/**
 * PowerUp Spawn System (Last War Style)
 * Powerups spawn and travel down the lane like upgrade boxes
 */

import {
  engine,
  Transform,
  Material,
  MeshRenderer,
  Entity,
  Schemas,
  GltfContainer,
  Billboard,
  BillboardMode
} from '@dcl/sdk/ecs'
import { Vector3, Color4, Quaternion } from '@dcl/sdk/math'
import { PlayerFighter } from './PlayerFighterSystem'
import { getGamePhase, isPaused, gameStateEntity } from '../core/GameState'
import { GameState, PlayerBuffs, Zombie, DyingZombie, AnimationState, Health } from '../components/GameComponents'
import { playSound } from '../audio/SoundManager'
import { POWERUP_MODELS, POWERUP_DURATION } from '../utils/constants'
import { Animator } from '@dcl/sdk/ecs'
import * as utils from '@dcl-sdk/utils'

// PowerUp spawn settings
const POWERUP_SPAWN_INTERVAL = 15 // Seconds (less frequent than boxes)
const POWERUP_SPAWN_POSITION_X = 32 // In front of gas station
const POWERUP_SPEED = 10 // Units per second (same as boxes)
const POWERUP_SIZE = 0.75 // 50% smaller (was 1.5)

type PowerUpType = 'instantKill' | 'fireRate' | 'doublePoints'

// Component for powerups
export const MovingPowerUp = engine.defineComponent('moving::powerup', {
  type: Schemas.String,
  velocity: Schemas.Vector3
})

let lastPowerUpSpawnTime = 0
let activePowerUps: Entity[] = []

/**
 * Spawn powerup system
 * DISABLED - Powerups removed from gameplay
 */
export function powerUpSpawnSystem(dt: number): void {
  return // Disabled

  if (getGamePhase() !== 'playing') return
  if (isPaused()) return

  const currentTime = Date.now() / 1000

  // Check if enough time has passed to spawn
  if (currentTime - lastPowerUpSpawnTime >= POWERUP_SPAWN_INTERVAL) {
    spawnRandomPowerUp()
    lastPowerUpSpawnTime = currentTime
  }
}

/**
 * Spawn a random powerup (weighted - instant kill is rare)
 */
function spawnRandomPowerUp(): void {
  // Weighted selection - instant kill is rare (10%), others are common (45% each)
  const roll = Math.random() * 100
  let randomType: PowerUpType

  if (roll < 10) {
    randomType = 'instantKill' // 10% chance
  } else if (roll < 55) {
    randomType = 'fireRate' // 45% chance
  } else {
    randomType = 'doublePoints' // 45% chance
  }

  // Random Z position - forces player to move around!
  // Z range matches player movement bounds: -8 to +6 (from FighterMovementSystem)
  const MIN_Z = -6
  const MAX_Z = 4
  const randomZ = MIN_Z + Math.random() * (MAX_Z - MIN_Z)

  const powerUp = createMovingPowerUp(Vector3.create(POWERUP_SPAWN_POSITION_X, 1, randomZ), randomType)

  activePowerUps.push(powerUp)
  console.log(`⚡ Spawned ${randomType} powerup at Z=${randomZ.toFixed(1)}`)
}

/**
 * Create a moving powerup
 */
function createMovingPowerUp(position: Vector3, type: PowerUpType): Entity {
  const powerUp = engine.addEntity()

  Transform.create(powerUp, {
    position,
    rotation: Quaternion.fromEulerDegrees(0, 270, 0), // Face forward (toward player/left)
    scale: Vector3.create(POWERUP_SIZE, POWERUP_SIZE, POWERUP_SIZE)
  })

  // Add powerup model
  GltfContainer.create(powerUp, {
    src: POWERUP_MODELS[type],
    invisibleMeshesCollisionMask: 0,
    visibleMeshesCollisionMask: 0
  })

  // No billboard - powerups face forward

  // Add moving powerup component
  MovingPowerUp.create(powerUp, {
    type,
    velocity: { x: -POWERUP_SPEED, y: 0, z: 0 } // Move toward player
  })

  return powerUp
}

/**
 * Update powerup movement and collision
 */
export function powerUpUpdateSystem(dt: number): void {
  if (getGamePhase() !== 'playing') return
  if (isPaused()) return

  const playerFighterData = getPlayerFighterData()
  if (!playerFighterData) return

  for (const [entity] of engine.getEntitiesWith(MovingPowerUp, Transform)) {
    const powerUp = MovingPowerUp.getMutable(entity)
    const transform = Transform.getMutable(entity)

    // Move powerup toward player
    transform.position = Vector3.create(
      transform.position.x + powerUp.velocity.x * dt,
      transform.position.y + powerUp.velocity.y * dt,
      transform.position.z + powerUp.velocity.z * dt
    )

    // Check if powerup went past player (missed)
    if (transform.position.x < playerFighterData.position.x - 5) {
      removePowerUp(entity)
      continue
    }

    // Check collision with player
    const distance = Vector3.distance(transform.position, playerFighterData.position)
    if (distance < 2.5) {
      handlePowerUpPickup(entity, powerUp.type as PowerUpType)
    }
  }
}

/**
 * Handle powerup pickup
 */
function handlePowerUpPickup(powerUpEntity: Entity, type: PowerUpType): void {
  console.log(`⚡ Picked up ${type} powerup`)

  // Play unique sound for each powerup type
  let soundPath = ''
  switch (type) {
    case 'instantKill':
      soundPath = 'sounds/powerups/instantKill.mp3'
      break
    case 'fireRate':
      soundPath = 'sounds/powerups/fireRate.mp3'
      break
    case 'doublePoints':
      soundPath = 'sounds/powerups/double-points.mp3'
      break
  }
  playSound('powerup', soundPath)

  // Apply powerup effect
  const playerBuffs = PlayerBuffs.getMutable(engine.PlayerEntity)
  const currentTime = Date.now()

  switch (type) {
    case 'instantKill':
      // Kill all zombies on screen immediately
      applyInstantKillEffect()
      console.log(`⚡ Instant Kill activated - clearing all zombies!`)
      break

    case 'fireRate':
      playerBuffs.fireRateMultiplier = 0.5 // Double fire rate (half cooldown)
      playerBuffs.fireRateExpiry = currentTime + POWERUP_DURATION
      console.log(`⚡ Fire Rate boost active for ${POWERUP_DURATION / 1000}s`)
      break

    case 'doublePoints':
      playerBuffs.pointsMultiplier = 2 // Double points
      playerBuffs.pointsExpiry = currentTime + POWERUP_DURATION
      console.log(`⚡ Double Points active for ${POWERUP_DURATION / 1000}s`)
      break
  }

  // Remove powerup
  removePowerUp(powerUpEntity)
}

/**
 * Remove a powerup
 */
function removePowerUp(powerUpEntity: Entity): void {
  const index = activePowerUps.indexOf(powerUpEntity)
  if (index !== -1) {
    activePowerUps.splice(index, 1)
  }
  engine.removeEntity(powerUpEntity)
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
 * Reset powerup system
 */
export function resetMovingPowerUps(): void {
  lastPowerUpSpawnTime = 0

  // Remove all powerups
  for (const powerUp of activePowerUps) {
    engine.removeEntity(powerUp)
  }
  activePowerUps = []
}

/**
 * Remove all powerups (for scene cleanup)
 */
export function removeAllPowerUps(): void {
  for (const powerUp of activePowerUps) {
    engine.removeEntity(powerUp)
  }
  activePowerUps = []
  console.log('🧹 All powerups removed')
}

/**
 * Apply instant kill effect - kills all zombies on screen
 */
function applyInstantKillEffect(): void {
  const gameState = GameState.getMutable(gameStateEntity)

  // Collect all alive zombies
  interface ZombieToKill {
    entity: number
    position: Vector3
  }

  const zombiesToKill: ZombieToKill[] = []

  for (const [zombieEntity, zombie, transform] of engine.getEntitiesWith(Zombie, Transform)) {
    // Skip if already dying
    if (DyingZombie.getOrNull(zombieEntity)) continue
    zombiesToKill.push({
      entity: zombieEntity,
      position: Vector3.clone(transform.position)
    })
  }

  if (zombiesToKill.length === 0) return

  console.log(`💀 Instant kill activating on ${zombiesToKill.length} zombies...`)

  // Kill zombies in batches with staggered timing for smooth performance
  const batchSize = 3 // Kill 3 zombies at a time
  const delayBetweenBatches = 50 // 50ms between batches

  let batchIndex = 0
  const totalBatches = Math.ceil(zombiesToKill.length / batchSize)

  function killNextBatch() {
    const startIdx = batchIndex * batchSize
    const endIdx = Math.min(startIdx + batchSize, zombiesToKill.length)

    // Kill this batch of zombies
    for (let i = startIdx; i < endIdx; i++) {
      const { entity: zombieEntity, position } = zombiesToKill[i]

      // Update game state
      gameState.zombiesRemaining -= 1
      gameState.kills += 1

      // Play death sound
      playSound('die')

      // Play death animation
      const animator = Animator.getOrNull(zombieEntity as any)
      if (animator) {
        Animator.stopAllAnimations(zombieEntity as any, false)
        Animator.playSingleAnimation(zombieEntity as any, 'die', true)

        const animState = AnimationState.getMutableOrNull(zombieEntity as any)
        if (animState) {
          animState.currentClip = 'die'
          animState.nextClip = ''
        }
      }

      // Mark zombie as dying
      DyingZombie.create(zombieEntity as any, {
        deathStartTime: Date.now()
      })
    }

    batchIndex++

    // Schedule next batch
    if (batchIndex < totalBatches) {
      utils.timers.setTimeout(killNextBatch, delayBetweenBatches)
    } else {
      console.log(`✅ Instant kill complete! All ${zombiesToKill.length} zombies eliminated.`)
    }
  }

  // Start killing zombies
  killNextBatch()
}
