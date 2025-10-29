/**
 * Zombie Factory for Neural Collapse
 * Creates and manages zombie entities
 */

import { engine, Entity, Transform, GltfContainer, Animator, MeshCollider } from '@dcl/sdk/ecs'
import { Vector3, Quaternion } from '@dcl/sdk/math'
import { Zombie, Health, AnimationState } from '../components/GameComponents'
import { GameState } from '../components/GameComponents'
import { gameStateEntity } from '../core/GameState'
import {
  ZOMBIE_BASE_HEALTH,
  ZOMBIE_HEALTH_MULTIPLIER,
  ZOMBIE_BASE_SPEED,
  ZOMBIE_SPEED_INCREMENT,
  ZOMBIE_BASE_DAMAGE,
  ZOMBIE_DAMAGE_INCREMENT
} from '../utils/constants'

/**
 * Create a zombie entity
 */
export function createZombie(position: Vector3): Entity {
  const entity = engine.addEntity()

  // Create the main zombie entity with GLTF model
  // Rotate to face player fighter (270 degrees = facing left/toward player)
  Transform.create(entity, {
    position,
    rotation: Quaternion.fromEulerDegrees(0, 270, 0), // Face toward player fighter (at lower X)
    scale: Vector3.create(1, 1, 1)
  })

  // Add the GLTF model
  GltfContainer.create(entity, {
    src: 'models/zombie.glb'
  })

  // Add collision to the zombie
  MeshCollider.setBox(entity, [2])

  // Get current wave for health/damage scaling
  const gameState = GameState.get(gameStateEntity)
  const currentWave = gameState.currentWave

  // Calculate scaled stats
  const healthMultiplier = 1 + (currentWave - 1) * ZOMBIE_HEALTH_MULTIPLIER
  const maxHealth = Math.floor(ZOMBIE_BASE_HEALTH * healthMultiplier)
  const speed = ZOMBIE_BASE_SPEED + currentWave * ZOMBIE_SPEED_INCREMENT
  const damage = ZOMBIE_BASE_DAMAGE + currentWave * ZOMBIE_DAMAGE_INCREMENT

  // Add components for zombie behavior
  Zombie.create(entity, {
    health: maxHealth,
    speed,
    damage,
    target: engine.PlayerEntity,
    spawnPositionX: position.x, // Track spawn X for straight-run behavior
    hasTurned: false // Start running straight
  })

  Health.create(entity, {
    current: maxHealth,
    max: maxHealth,
    lastDamageTime: 0
  })

  // Randomly choose between walk and run animation (50/50)
  const movementClip = Math.random() > 0.5 ? 'run' : 'walk'
  const movementSpeed = movementClip === 'run' ? speed * 1.5 : speed

  // Add Animator component for animations
  Animator.create(entity, {
    states: [
      { clip: 'walk', playing: movementClip === 'walk', loop: true, weight: movementClip === 'walk' ? 1 : 0 },
      { clip: 'run', playing: movementClip === 'run', loop: true, weight: movementClip === 'run' ? 1 : 0 },
      { clip: 'attack', playing: false, loop: true, weight: 0 },
      { clip: 'die', playing: false, loop: false, weight: 0 }
    ]
  })

  // Add AnimationState component to track current and base movement animation
  AnimationState.create(entity, {
    currentClip: movementClip,
    nextClip: movementClip // Store base movement animation (walk or run)
  })

  // Update zombie speed if running
  if (movementClip === 'run') {
    Zombie.getMutable(entity).speed = movementSpeed
  }

  console.log(`Created zombie ${entity} with ${maxHealth} health at wave ${currentWave}`)
  return entity
}

/**
 * Remove all zombies from the scene
 */
export function removeAllZombies() {
  for (const [entity] of engine.getEntitiesWith(Zombie)) {
    engine.removeEntity(entity)
  }
  console.log('Removed all zombies')
}
