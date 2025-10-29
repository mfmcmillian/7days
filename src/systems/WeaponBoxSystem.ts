/**
 * Weapon Box System (Last War Style)
 * Spawns weapon pickup boxes for Rifle and Assault weapons
 */

import { engine, Transform, Material, MeshRenderer, Entity, Schemas, GltfContainer } from '@dcl/sdk/ecs'
import { Vector3, Color4, Quaternion } from '@dcl/sdk/math'
import { PlayerFighter } from './PlayerFighterSystem'
import { getGamePhase, isPaused } from '../core/GameState'
import { playSound } from '../audio/SoundManager'
import { setFighterWeapon, type FighterWeaponType } from './FighterWeaponSystem'

// Weapon box spawn settings
const WEAPON_BOX_SPAWN_INTERVAL = 20 // Seconds (rarer than upgrade boxes)
const WEAPON_BOX_SPAWN_POSITION_X = 32 // In front of gas station
const WEAPON_BOX_SPEED = 8 // Units per second (slightly slower than upgrade boxes)
const MIN_Z = -6 // Movement bounds
const MAX_Z = 4

// Component for weapon boxes
export const WeaponBox = engine.defineComponent('weapon::box', {
  weaponType: Schemas.String, // 'rifle' or 'assault'
  velocity: Schemas.Vector3
})

let lastSpawnTime = 0
let activeWeaponBoxes: Entity[] = []

/**
 * Spawn weapon boxes system
 * DISABLED - Weapon boxes removed from gameplay
 */
export function weaponBoxSpawnSystem(dt: number): void {
  return // Disabled

  if (getGamePhase() !== 'playing') return
  if (isPaused()) return

  const currentTime = Date.now() / 1000

  // Check if enough time has passed to spawn
  if (currentTime - lastSpawnTime >= WEAPON_BOX_SPAWN_INTERVAL) {
    spawnWeaponBox()
    lastSpawnTime = currentTime
  }
}

/**
 * Spawn a single weapon box (random weapon type)
 */
function spawnWeaponBox(): void {
  // Randomly choose between rifle and assault
  const weaponType: FighterWeaponType = Math.random() < 0.5 ? 'rifle' : 'assault'

  // Random Z position - forces player to move around
  const randomZ = MIN_Z + Math.random() * (MAX_Z - MIN_Z)

  const box = createWeaponBox(Vector3.create(WEAPON_BOX_SPAWN_POSITION_X, 1, randomZ), weaponType)

  activeWeaponBoxes.push(box)

  console.log(`🔫 Spawned ${weaponType} weapon box at Z=${randomZ.toFixed(1)}`)
}

/**
 * Create a weapon box entity
 */
function createWeaponBox(position: Vector3, weaponType: FighterWeaponType): Entity {
  const box = engine.addEntity()

  // Weapon-specific models and scale
  let modelPath: string
  let modelScale: number

  if (weaponType === 'rifle') {
    modelPath = 'models/rifle.glb'
    modelScale = 1.25 // 50% smaller (was 2.5)
  } else {
    // assault
    modelPath = 'models/rifle-exe.glb'
    modelScale = 1.25 // 50% smaller (was 2.5)
  }

  Transform.create(box, {
    position,
    rotation: Quaternion.fromEulerDegrees(0, 180, 0), // Rotated 90 degrees more (was 90, now 180)
    scale: Vector3.create(modelScale, modelScale, modelScale)
  })

  // Add the weapon model
  GltfContainer.create(box, {
    src: modelPath,
    invisibleMeshesCollisionMask: 0,
    visibleMeshesCollisionMask: 0
  })

  // Add component
  WeaponBox.create(box, {
    weaponType: weaponType,
    velocity: { x: -WEAPON_BOX_SPEED, y: 0, z: 0 } // Move toward player (decrease X)
  })

  return box
}

/**
 * Update weapon boxes system - handles movement and collision
 */
export function weaponBoxUpdateSystem(dt: number): void {
  if (getGamePhase() !== 'playing') return
  if (isPaused()) return

  // Get player fighter position
  let playerPos: Vector3 | null = null
  for (const [entity] of engine.getEntitiesWith(PlayerFighter, Transform)) {
    playerPos = Transform.get(entity).position
    break
  }

  if (!playerPos) return

  // Update all weapon boxes
  for (const [entity, box] of engine.getEntitiesWith(WeaponBox, Transform)) {
    const transform = Transform.getMutable(entity)

    // Move box toward player (decrease X)
    transform.position = Vector3.create(
      transform.position.x + box.velocity.x * dt,
      transform.position.y,
      transform.position.z
    )

    // Check for player collision (pickup range)
    const distance = Vector3.distance(transform.position, playerPos)
    if (distance < 2.5) {
      handleWeaponPickup(entity, box.weaponType as FighterWeaponType)
    }

    // Remove if too far past player (X < -25)
    if (transform.position.x < -25) {
      console.log(`🔫 Weapon box ${box.weaponType} expired`)
      engine.removeEntity(entity)
      activeWeaponBoxes = activeWeaponBoxes.filter((e) => e !== entity)
    }
  }
}

/**
 * Handle weapon box pickup
 */
function handleWeaponPickup(boxEntity: Entity, weaponType: FighterWeaponType): void {
  // Play pickup sound (use powerup sound for now)
  playSound('powerup', 'sounds/zombie-sounds/powerup.mp3')

  // Switch to new weapon
  setFighterWeapon(weaponType)

  console.log(`🔫 Picked up ${weaponType}!`)

  // Remove the box
  engine.removeEntity(boxEntity)
  activeWeaponBoxes = activeWeaponBoxes.filter((e) => e !== boxEntity)
}

/**
 * Reset weapon box system (for game restart)
 */
export function resetWeaponBoxSystem(): void {
  for (const box of activeWeaponBoxes) {
    engine.removeEntity(box)
  }
  activeWeaponBoxes = []
  lastSpawnTime = 0
  console.log('✅ Weapon box system reset')
}

/**
 * Remove all weapon boxes (for scene cleanup)
 */
export function removeAllWeaponBoxes(): void {
  for (const box of activeWeaponBoxes) {
    engine.removeEntity(box)
  }
  activeWeaponBoxes = []
  console.log('🧹 All weapon boxes removed')
}
