/**
 * Upgrade Box System (Last War Style)
 * Red boxes (negative) and Blue boxes (positive) that modify ally zombie count
 */

import { engine, Transform, Material, MeshRenderer, Entity, Schemas, TextShape, BillboardMode } from '@dcl/sdk/ecs'
import { Vector3, Color4, Quaternion } from '@dcl/sdk/math'
import { PlayerFighter } from './PlayerFighterSystem'
import { getGamePhase, isPaused, gameStateEntity } from '../core/GameState'
import { GameState } from '../components/GameComponents'
import { playSound } from '../audio/SoundManager'
import { addAllies, removeAllies, getTotalZombieCount } from './AllyZombieSystem'

// Box spawn settings
const BOX_SPAWN_INTERVAL = 10 // Seconds
const BOX_SPAWN_POSITION_X = 32 // In front of gas station (same as zombies)
const BOX_SPEED = 10 // Units per second (faster than zombies)
const BOX_SIZE = 2 // Bigger boxes
const BOX_SPACING = 3 // Distance between red and blue boxes

// Component for upgrade boxes
export const UpgradeBox = engine.defineComponent('upgrade::box', {
  type: Schemas.String, // 'red' or 'blue'
  value: Schemas.Int, // The number (+/- allies)
  velocity: Schemas.Vector3,
  paired: Schemas.Boolean // If true, has a paired box that should disappear together
})

let lastSpawnTime = 0
let activeBoxPairs: Entity[][] = [] // Track pairs of boxes

/**
 * Spawn upgrade boxes system - spawns red/blue box pairs
 * DISABLED - Boxes removed from gameplay
 */
export function upgradeBoxSpawnSystem(dt: number): void {
  return // Disabled

  if (getGamePhase() !== 'playing') return
  if (isPaused()) return

  const currentTime = Date.now() / 1000

  // Check if enough time has passed to spawn
  if (currentTime - lastSpawnTime >= BOX_SPAWN_INTERVAL) {
    spawnBoxPair()
    lastSpawnTime = currentTime
  }
}

/**
 * Spawn a pair of upgrade boxes (red + blue)
 */
function spawnBoxPair(): void {
  const gameState = GameState.get(gameStateEntity)
  const wave = gameState.currentWave

  // Calculate values based on wave (scale with difficulty)
  const redValue = -Math.floor(1 + Math.random() * Math.min(wave, 3)) // -1 to -(wave, max -4)
  const blueValue = Math.floor(1 + Math.random() * Math.min(wave + 1, 5)) // +1 to +(wave+1, max +6)

  // Randomize which side each box appears on
  const redOnLeft = Math.random() < 0.5

  // Random Z position for each spawn - forces player to move around!
  // Z range matches player movement bounds: -8 to +6 (from FighterMovementSystem)
  const MIN_Z = -6 // Stay within reasonable bounds
  const MAX_Z = 4

  // Pick a random center point for this pair
  const centerZ = MIN_Z + Math.random() * (MAX_Z - MIN_Z)

  // Create positions (spread apart from random center)
  const leftZ = centerZ - BOX_SPACING / 2
  const rightZ = centerZ + BOX_SPACING / 2

  const redZ = redOnLeft ? leftZ : rightZ
  const blueZ = redOnLeft ? rightZ : leftZ

  // Create red box
  const redBox = createUpgradeBox(Vector3.create(BOX_SPAWN_POSITION_X, 1, redZ), 'red', redValue)

  // Create blue box
  const blueBox = createUpgradeBox(Vector3.create(BOX_SPAWN_POSITION_X, 1, blueZ), 'blue', blueValue)

  // Mark them as paired
  UpgradeBox.getMutable(redBox).paired = true
  UpgradeBox.getMutable(blueBox).paired = true

  // Store pair
  activeBoxPairs.push([redBox, blueBox])

  console.log(
    `📦 Spawned box pair: Red ${redValue} (${redOnLeft ? 'left' : 'right'}), Blue +${blueValue} (${
      redOnLeft ? 'right' : 'left'
    })`
  )
}

/**
 * Create a single upgrade box
 */
function createUpgradeBox(position: Vector3, type: 'red' | 'blue', value: number): Entity {
  const box = engine.addEntity()

  Transform.create(box, {
    position,
    scale: Vector3.create(BOX_SIZE, BOX_SIZE, BOX_SIZE)
  })

  // Create glowing box visual
  MeshRenderer.setBox(box)
  const color = type === 'red' ? Color4.create(1, 0, 0, 0.8) : Color4.create(0, 0.3, 1, 0.8)
  const emissive = type === 'red' ? Color4.create(1, 0, 0) : Color4.create(0, 0.5, 1)

  Material.setPbrMaterial(box, {
    albedoColor: color,
    emissiveColor: emissive,
    emissiveIntensity: 3 // Strong glow
  })

  // Add upgrade box component
  UpgradeBox.create(box, {
    type,
    value,
    velocity: { x: -BOX_SPEED, y: 0, z: 0 }, // Move toward player (negative X)
    paired: false
  })

  // Create floating text above box
  const textEntity = engine.addEntity()
  Transform.create(textEntity, {
    position: Vector3.create(0, BOX_SIZE + 0.5, 0), // Above the box
    rotation: Quaternion.fromEulerDegrees(0, 90, 0), // Face forward (180° flip from 270°)
    parent: box
  })

  const displayText = value > 0 ? `+${value}` : `${value}`
  TextShape.create(textEntity, {
    text: displayText,
    fontSize: 5,
    textColor: type === 'red' ? Color4.Red() : Color4.Blue()
    // No billboard - facing forward
  })

  return box
}

/**
 * Update box movement and collision
 */
export function upgradeBoxUpdateSystem(dt: number): void {
  if (getGamePhase() !== 'playing') return
  if (isPaused()) return

  const playerFighterData = getPlayerFighterData()
  if (!playerFighterData) return

  for (const [entity] of engine.getEntitiesWith(UpgradeBox, Transform)) {
    const box = UpgradeBox.getMutable(entity)
    const transform = Transform.getMutable(entity)

    // Move box toward player
    transform.position = Vector3.create(
      transform.position.x + box.velocity.x * dt,
      transform.position.y + box.velocity.y * dt,
      transform.position.z + box.velocity.z * dt
    )

    // Check if box went past player (missed)
    if (transform.position.x < playerFighterData.position.x - 5) {
      removeBoxAndPair(entity)
      continue
    }

    // Check collision with player
    const distance = Vector3.distance(transform.position, playerFighterData.position)
    if (distance < 2.5) {
      handleBoxPickup(entity, box)
    }
  }
}

/**
 * Handle box pickup
 */
function handleBoxPickup(boxEntity: Entity, box: ReturnType<typeof UpgradeBox.getMutable>): void {
  console.log(`📦 Picked up ${box.type} box: ${box.value}`)

  // Play pickup sound
  playSound('sale')

  // Apply effect - modify ally count
  if (box.value > 0) {
    // Blue box - add allies
    addAllies(box.value)
  } else {
    // Red box - remove allies
    removeAllies(Math.abs(box.value))
  }

  console.log(`🧟 Total zombies: ${getTotalZombieCount()}`)

  // Remove this box and its pair
  removeBoxAndPair(boxEntity)
}

/**
 * Remove a box and its paired box
 */
function removeBoxAndPair(boxEntity: Entity): void {
  // Find the pair this box belongs to
  let pairIndex = -1
  let boxIndexInPair = -1

  for (let i = 0; i < activeBoxPairs.length; i++) {
    const pair = activeBoxPairs[i]
    const index = pair.indexOf(boxEntity)
    if (index !== -1) {
      pairIndex = i
      boxIndexInPair = index
      break
    }
  }

  // If we found the pair, remove both boxes
  if (pairIndex !== -1) {
    const pair = activeBoxPairs[pairIndex]
    for (const box of pair) {
      engine.removeEntity(box)
    }
    activeBoxPairs.splice(pairIndex, 1)
  } else {
    // Just remove this box if no pair found
    engine.removeEntity(boxEntity)
  }
}

/**
 * Get player fighter Z position
 */
function getPlayerFighterZ(): number | null {
  for (const [entity] of engine.getEntitiesWith(PlayerFighter, Transform)) {
    const transform = Transform.get(entity)
    return transform.position.z
  }
  return null
}

/**
 * Get player fighter data
 */
function getPlayerFighterData(): { entity: Entity; position: Vector3 } | null {
  for (const [entity] of engine.getEntitiesWith(PlayerFighter, Transform)) {
    const transform = Transform.get(entity)
    return { entity, position: transform.position }
  }
  return null
}

/**
 * Reset upgrade box system
 */
export function resetUpgradeBoxes(): void {
  lastSpawnTime = 0

  // Remove all boxes
  for (const pair of activeBoxPairs) {
    for (const box of pair) {
      engine.removeEntity(box)
    }
  }
  activeBoxPairs = []
}

/**
 * Remove all upgrade boxes (for scene cleanup)
 */
export function removeAllUpgradeBoxes(): void {
  for (const pair of activeBoxPairs) {
    for (const box of pair) {
      engine.removeEntity(box)
    }
  }
  activeBoxPairs = []
  console.log('🧹 All upgrade boxes removed')
}
