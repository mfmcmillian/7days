/**
 * Weapon Factory for Neural Collapse
 * Creates and manages weapon entities
 */

import { engine, Entity, Transform, GltfContainer, Animator } from '@dcl/sdk/ecs'
import { Vector3, Quaternion } from '@dcl/sdk/math'
import { Weapon, AnimationState } from '../components/GameComponents'
import { WEAPON_FPS_POSITION, WEAPON_FPS_SCALE, WEAPON_FPS_ROTATION, WEAPON_STATS } from '../utils/constants'
import type { WeaponType } from '../utils/types'

/**
 * Create a weapon entity
 */
export function createWeapon(type: WeaponType, position: Vector3): Entity {
  console.log(`Creating weapon of type: ${type}`)
  const entity = engine.addEntity()

  const stats = WEAPON_STATS[type]

  // Create the weapon with proper FPS positioning (HIDDEN for side-scrolling mode)
  Transform.create(entity, {
    position: WEAPON_FPS_POSITION,
    scale: Vector3.create(0, 0, 0), // Hide weapon model (scale to 0)
    rotation: WEAPON_FPS_ROTATION,
    parent: engine.CameraEntity
  })

  // Add the weapon model (hidden)
  GltfContainer.create(entity, {
    src: stats.model,
    visibleMeshesCollisionMask: 0, // No collision
    invisibleMeshesCollisionMask: 0 // No collision
  })

  // Add Animator component for weapon animations
  Animator.create(entity, {
    states: [
      { clip: 'idle', playing: true, loop: true, weight: 1 },
      { clip: 'fire', playing: false, loop: false, weight: 0 },
      { clip: 'reload', playing: false, loop: false, weight: 0 }
    ]
  })

  // Add AnimationState component
  AnimationState.create(entity, {
    currentClip: 'idle',
    nextClip: ''
  })

  // Calculate recoil positions and rotations
  const recoilPosition = Vector3.create(
    WEAPON_FPS_POSITION.x + 0.1,
    WEAPON_FPS_POSITION.y + 0.08,
    WEAPON_FPS_POSITION.z - 0.05
  )

  const recoilRotation = Quaternion.multiply(
    Quaternion.create(WEAPON_FPS_ROTATION.x, WEAPON_FPS_ROTATION.y, WEAPON_FPS_ROTATION.z, WEAPON_FPS_ROTATION.w),
    Quaternion.fromEulerDegrees(30, 10, -20)
  )

  // Create weapon component
  Weapon.create(entity, {
    damage: stats.damage,
    fireRate: stats.fireRate,
    ammo: stats.ammo,
    maxAmmo: stats.maxAmmo,
    storedAmmo: stats.ammo,
    type,
    active: true,
    recoilFactor: 0,
    recoilSpeed: 2,
    recoilPosition,
    restPosition: Vector3.create(WEAPON_FPS_POSITION.x, WEAPON_FPS_POSITION.y, WEAPON_FPS_POSITION.z),
    restRotation: Quaternion.create(
      WEAPON_FPS_ROTATION.x,
      WEAPON_FPS_ROTATION.y,
      WEAPON_FPS_ROTATION.z,
      WEAPON_FPS_ROTATION.w
    ),
    recoilRotation,
    reloadTime: stats.reloadTime,
    isReloading: false,
    reloadStartTime: 0,
    modelPath: stats.model
  })

  console.log(`Weapon created successfully with ${stats.ammo} ammo`)

  return entity
}

/**
 * Upgrade weapon with executioner's chest
 */
export function upgradeWeapon(weaponEntity: Entity, type: WeaponType) {
  const weapon = Weapon.getMutable(weaponEntity)

  switch (type) {
    case 'pistol':
      weapon.damage = 30
      weapon.modelPath = WEAPON_STATS.pistol.upgradeModel
      weapon.ammo = 24
      weapon.maxAmmo = 24
      weapon.storedAmmo = 24
      break
    case 'shotgun':
      weapon.damage = 100
      weapon.modelPath = WEAPON_STATS.shotgun.upgradeModel
      weapon.ammo = 12
      weapon.maxAmmo = 12
      weapon.storedAmmo = 12
      break
    case 'rifle':
      weapon.damage = 40
      weapon.modelPath = WEAPON_STATS.rifle.upgradeModel
      weapon.ammo = 50
      weapon.maxAmmo = 50
      weapon.storedAmmo = 50
      break
  }

  // Update the GltfContainer with new model
  const gltfContainer = GltfContainer.getMutable(weaponEntity)
  gltfContainer.src = weapon.modelPath

  console.log(`Upgraded ${type} to executioner version`)
}

/**
 * Get weapon display name
 */
export function getWeaponDisplayName(type: WeaponType): string {
  return type.charAt(0).toUpperCase() + type.slice(1)
}
