/**
 * PowerUp Management for Neural Collapse
 * Handles power-up spawning, collection, and effects
 */

import { engine, Entity, Transform, GltfContainer } from '@dcl/sdk/ecs'
import { Vector3 } from '@dcl/sdk/math'
import { PowerUp } from '../components/GameComponents'
import { POWERUP_MODELS, POWERUP_LIFETIME, POWERUP_DURATION } from '../utils/constants'
import type { PowerUpType } from '../utils/types'

/**
 * Create a power-up entity
 */
export function createPowerUp(position: Vector3, type: PowerUpType): Entity {
  const entity = engine.addEntity()

  // Create the power-up with the appropriate model
  Transform.createOrReplace(entity, {
    position: Vector3.create(position.x, position.y + 1, position.z),
    scale: Vector3.create(0.5, 0.5, 0.5)
  })

  // Add the appropriate GLTF model based on type
  GltfContainer.create(entity, {
    src: POWERUP_MODELS[type]
  })

  // Determine duration and value
  const isInstantOrAmmo = type === 'instantKill' || type === 'maxReload'
  const duration = isInstantOrAmmo ? 0 : POWERUP_DURATION
  const value = isInstantOrAmmo ? 0 : type === 'fireRate' ? 0.5 : 2

  // Add the PowerUp component
  PowerUp.create(entity, {
    type,
    duration,
    value,
    active: true,
    spawnTime: Date.now(),
    lifetime: POWERUP_LIFETIME
  })

  console.log(`Created ${type} power-up at ${position}`)
  return entity
}

/**
 * Get random power-up type
 */
export function getRandomPowerUpType(): PowerUpType {
  const random = Math.random()
  if (random < 0.25) return 'instantKill'
  if (random < 0.5) return 'fireRate'
  if (random < 0.75) return 'maxReload'
  return 'doublePoints'
}

/**
 * Remove all active power-ups
 */
export function removeAllPowerUps() {
  for (const [entity] of engine.getEntitiesWith(PowerUp)) {
    engine.removeEntity(entity)
  }
  console.log('Removed all power-ups')
}
