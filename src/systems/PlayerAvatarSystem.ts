/**
 * Player Avatar Representation System
 * Creates a visible model (zombie) that tracks player position
 * AND hides the actual player avatar using AvatarModifierArea
 */

import {
  engine,
  Transform,
  GltfContainer,
  Entity,
  Animator,
  AvatarModifierArea,
  AvatarModifierType
} from '@dcl/sdk/ecs'
import { Vector3, Quaternion } from '@dcl/sdk/math'

let playerAvatarEntity: Entity | null = null
let avatarHideArea: Entity | null = null

/**
 * Create visible player avatar (zombie model)
 */
export function createPlayerAvatar(): void {
  if (playerAvatarEntity) {
    console.log('⚠️ Player avatar already exists')
    return
  }

  console.log('👤 Creating visible player avatar system...')

  // Step 1: Hide the actual player avatar using AvatarModifierArea
  avatarHideArea = engine.addEntity()
  Transform.create(avatarHideArea, {
    position: Vector3.create(8, 0, 8), // Arena center
    scale: Vector3.create(1, 1, 1)
  })

  AvatarModifierArea.create(avatarHideArea, {
    area: Vector3.create(32, 20, 32), // Large area to cover entire scene
    modifiers: [AvatarModifierType.AMT_HIDE_AVATARS],
    excludeIds: [] // Hide all avatars including player
  })
  console.log('✅ Player avatar hidden via AvatarModifierArea')

  // Step 2: Create visible zombie model that tracks player position
  playerAvatarEntity = engine.addEntity()

  const playerTransform = Transform.getOrNull(engine.PlayerEntity)
  const initialPos = playerTransform?.position || Vector3.create(8, 0, 8)

  Transform.create(playerAvatarEntity, {
    position: initialPos,
    rotation: Quaternion.fromEulerDegrees(0, 180, 0), // Face forward
    scale: Vector3.create(1, 1, 1)
  })

  // Add zombie model
  GltfContainer.create(playerAvatarEntity, {
    src: 'models/zombie.glb'
  })

  // Add animator for walk/idle animations
  Animator.create(playerAvatarEntity, {
    states: [
      { clip: 'idle', playing: true, loop: true },
      { clip: 'walk', playing: false, loop: true },
      { clip: 'run', playing: false, loop: true }
    ]
  })

  // Register sync system
  engine.addSystem(syncPlayerAvatarSystem)

  console.log('✅ Visible zombie avatar created')
  console.log('   → Your actual avatar is hidden')
  console.log('   → Zombie model represents you on screen')
}

/**
 * Remove player avatar
 */
export function removePlayerAvatar(): void {
  if (playerAvatarEntity) {
    engine.removeEntity(playerAvatarEntity)
    playerAvatarEntity = null
  }

  if (avatarHideArea) {
    engine.removeEntity(avatarHideArea)
    avatarHideArea = null
  }

  console.log('✅ Player avatar system removed')
}

/**
 * Sync system - makes the visible avatar follow the player's position
 * Uses smooth syncing to prevent glitching
 */
let lastPlayerX = 0
const MOVE_THRESHOLD = 0.001 // Very small threshold to detect actual movement

export function syncPlayerAvatarSystem(dt: number): void {
  if (!playerAvatarEntity) return

  const playerTransform = Transform.getOrNull(engine.PlayerEntity)
  const avatarTransform = Transform.getMutableOrNull(playerAvatarEntity)

  if (!playerTransform || !avatarTransform) return

  // CRITICAL: Only sync if player position is valid and stable
  // This prevents glitching from invalid positions
  const playerPos = playerTransform.position

  // Validate position is within reasonable bounds
  if (playerPos.x < 0 || playerPos.x > 16 || playerPos.z < 0 || playerPos.z > 16) {
    console.log('Player position out of bounds, skipping sync')
    return
  }

  // Direct position sync (no lerp - prevents lag/glitching)
  avatarTransform.position = Vector3.create(playerPos.x, playerPos.y, playerPos.z)

  // Keep zombie facing forward (toward zombies coming from back)
  avatarTransform.rotation = Quaternion.fromEulerDegrees(0, 180, 0)

  // Update animation based on actual movement
  const currentX = playerPos.x
  const deltaX = Math.abs(currentX - lastPlayerX)
  const isMoving = deltaX > MOVE_THRESHOLD

  const animator = Animator.getMutableOrNull(playerAvatarEntity)
  if (animator) {
    // Find and play the correct animation
    const targetClip = isMoving ? 'walk' : 'idle'

    for (const state of animator.states) {
      if (state.clip === targetClip) {
        if (!state.playing) {
          state.playing = true
        }
      } else {
        state.playing = false
      }
    }
  }

  lastPlayerX = currentX
}

/**
 * Get player avatar entity
 */
export function getPlayerAvatarEntity(): Entity | null {
  return playerAvatarEntity
}
