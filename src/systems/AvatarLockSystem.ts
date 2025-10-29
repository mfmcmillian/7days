/**
 * Avatar Lock System
 * Uses physical colliders (invisible walls) to trap avatar in place
 * Simple and reliable - no position snapping needed!
 */

import {
  engine,
  Transform,
  AvatarModifierArea,
  AvatarModifierType,
  Entity,
  MeshCollider,
  MeshRenderer,
  Material
} from '@dcl/sdk/ecs'
import { Vector3, Color4 } from '@dcl/sdk/math'
import { movePlayerTo } from '~system/RestrictedActions'

let avatarHideArea: Entity | null = null
let collisionCage: Entity[] = []
const AVATAR_LOCK_POSITION = Vector3.create(45, 1, -0.5) // Behind gas station, out of view

export function lockAvatar(): void {
  console.log('🔒 Locking player avatar with collision cage...')

  // Teleport underground
  movePlayerTo({
    newRelativePosition: AVATAR_LOCK_POSITION
  }).catch(() => {})

  // Hide area
  avatarHideArea = engine.addEntity()
  Transform.create(avatarHideArea, {
    position: Vector3.create(45, 1, -0.5) // Behind gas station
  })

  AvatarModifierArea.create(avatarHideArea, {
    area: Vector3.create(20, 10, 20),
    modifiers: [AvatarModifierType.AMT_HIDE_AVATARS],
    excludeIds: []
  })

  // Create invisible collision box around avatar
  const cageSize = 1
  const walls = [
    {
      pos: Vector3.create(AVATAR_LOCK_POSITION.x + cageSize, AVATAR_LOCK_POSITION.y, AVATAR_LOCK_POSITION.z),
      scale: Vector3.create(0.1, 3, 3)
    }, // Right
    {
      pos: Vector3.create(AVATAR_LOCK_POSITION.x - cageSize, AVATAR_LOCK_POSITION.y, AVATAR_LOCK_POSITION.z),
      scale: Vector3.create(0.1, 3, 3)
    }, // Left
    {
      pos: Vector3.create(AVATAR_LOCK_POSITION.x, AVATAR_LOCK_POSITION.y, AVATAR_LOCK_POSITION.z + cageSize),
      scale: Vector3.create(3, 3, 0.1)
    }, // Front
    {
      pos: Vector3.create(AVATAR_LOCK_POSITION.x, AVATAR_LOCK_POSITION.y, AVATAR_LOCK_POSITION.z - cageSize),
      scale: Vector3.create(3, 3, 0.1)
    }, // Back
    {
      pos: Vector3.create(AVATAR_LOCK_POSITION.x, AVATAR_LOCK_POSITION.y + 1.5, AVATAR_LOCK_POSITION.z),
      scale: Vector3.create(3, 0.1, 3)
    }, // Top
    {
      pos: Vector3.create(AVATAR_LOCK_POSITION.x, AVATAR_LOCK_POSITION.y - 0.5, AVATAR_LOCK_POSITION.z),
      scale: Vector3.create(3, 0.1, 3)
    } // Bottom
  ]

  for (const wall of walls) {
    const wallEntity = engine.addEntity()
    Transform.create(wallEntity, {
      position: wall.pos,
      scale: wall.scale
    })

    // Invisible collision box
    MeshRenderer.setBox(wallEntity)
    MeshCollider.setBox(wallEntity)

    // Make invisible
    Material.setPbrMaterial(wallEntity, {
      albedoColor: Color4.create(0, 0, 0, 0) // Fully transparent
    })

    collisionCage.push(wallEntity)
  }

  console.log('✅ Avatar locked in invisible collision cage')
}

export function unlockAvatar(): void {
  if (avatarHideArea) {
    engine.removeEntity(avatarHideArea)
    avatarHideArea = null
  }

  // Remove collision cage
  for (const wall of collisionCage) {
    engine.removeEntity(wall)
  }
  collisionCage = []

  movePlayerTo({
    newRelativePosition: Vector3.create(8, 0, 8)
  }).catch(() => {})

  console.log('✅ Avatar unlocked')
}
