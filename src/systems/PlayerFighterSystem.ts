/**
 * Player Fighter System - Creates a visible fighter entity (zombie)
 * The player controls THIS entity with WASD, not their avatar
 * This is how Fright Night does it - separate controllable fighter entity
 */

import { engine, Transform, GltfContainer, Entity, Animator } from '@dcl/sdk/ecs'
import { Vector3, Quaternion } from '@dcl/sdk/math'
import { Schemas } from '@dcl/sdk/ecs'

// Fighter component to identify the player's fighter
export const PlayerFighter = engine.defineComponent('player::fighter', {
  health: Schemas.Number,
  isMoving: Schemas.Boolean
})

let playerFighterEntity: Entity | null = null

/**
 * Create the player's fighter entity (zombie)
 * This is what you actually control and see on screen
 */
export function createPlayerFighter(): Entity {
  console.log('👤 Creating player fighter (zombie)...')

  playerFighterEntity = engine.addEntity()

  // Start position - pushed further back from camera
  Transform.create(playerFighterEntity, {
    position: Vector3.create(-20, 0, 8), // X=16 (further back from camera), Z=8 (center)
    rotation: Quaternion.fromEulerDegrees(0, 90, 0), // Face right (toward +X) so side faces camera
    scale: Vector3.create(1, 1, 1)
  })

  // Add zombie model
  GltfContainer.create(playerFighterEntity, {
    src: 'models/zombie.glb',
    invisibleMeshesCollisionMask: 0,
    visibleMeshesCollisionMask: 0
  })

  // Add fighter component
  PlayerFighter.create(playerFighterEntity, {
    health: 100,
    isMoving: false
  })

  // Add animations
  Animator.create(playerFighterEntity, {
    states: [
      { clip: 'idle', playing: true, loop: true },
      { clip: 'walk', playing: false, loop: true },
      { clip: 'run', playing: false, loop: true },
      { clip: 'attack', playing: false, loop: false }
    ]
  })

  console.log('✅ Player fighter created at (8, 0, 8)')
  return playerFighterEntity
}

/**
 * Get the player's fighter entity
 */
export function getPlayerFighter(): Entity | null {
  return playerFighterEntity
}

/**
 * Remove player fighter
 */
export function removePlayerFighter(): void {
  if (playerFighterEntity) {
    engine.removeEntity(playerFighterEntity)
    playerFighterEntity = null
  }
}
