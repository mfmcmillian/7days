/**
 * Weapon Machine Management for Neural Collapse
 * Handles weapon purchase machines
 */

import { engine, Entity, Transform, GltfContainer, Animator } from '@dcl/sdk/ecs'
import { Vector3, Quaternion } from '@dcl/sdk/math'
import { WeaponMachine } from '../components/GameComponents'
import { WEAPON_MACHINES } from '../utils/constants'

// Weapon machine entities
export let shotgunMachineEntity: Entity
export let rifleMachineEntity: Entity

/**
 * Initialize weapon machines
 */
export function initializeWeaponMachines() {
  // Shotgun Machine
  shotgunMachineEntity = engine.addEntity()
  WeaponMachine.create(shotgunMachineEntity, {
    position: WEAPON_MACHINES.shotgun.position,
    shotgunPrice: WEAPON_MACHINES.shotgun.weaponPrice,
    riflePrice: 0,
    pistolAmmoPrice: 0,
    shotgunAmmoPrice: WEAPON_MACHINES.shotgun.ammoPrice,
    rifleAmmoPrice: 0,
    pistolAmmoAmount: 0,
    shotgunAmmoAmount: WEAPON_MACHINES.shotgun.ammoAmount,
    rifleAmmoAmount: 0
  })

  Transform.createOrReplace(shotgunMachineEntity, {
    position: WEAPON_MACHINES.shotgun.position,
    scale: Vector3.create(1, 1, 1),
    rotation: WEAPON_MACHINES.shotgun.rotation
  })

  GltfContainer.create(shotgunMachineEntity, {
    src: WEAPON_MACHINES.shotgun.model
  })

  // Add floating shotgun model
  const floatingShotgun = engine.addEntity()
  Transform.createOrReplace(floatingShotgun, {
    position: WEAPON_MACHINES.shotgun.floatingPosition,
    scale: Vector3.create(0.6, 0.6, 0.6),
    rotation: Quaternion.fromEulerDegrees(0, 90, 0)
  })
  GltfContainer.create(floatingShotgun, {
    src: WEAPON_MACHINES.shotgun.floatingWeaponModel
  })
  Animator.create(floatingShotgun, {
    states: []
  })

  // Rifle Machine
  rifleMachineEntity = engine.addEntity()
  WeaponMachine.create(rifleMachineEntity, {
    position: WEAPON_MACHINES.rifle.position,
    shotgunPrice: 0,
    riflePrice: WEAPON_MACHINES.rifle.weaponPrice,
    pistolAmmoPrice: 0,
    shotgunAmmoPrice: 0,
    rifleAmmoPrice: WEAPON_MACHINES.rifle.ammoPrice,
    pistolAmmoAmount: 0,
    shotgunAmmoAmount: 0,
    rifleAmmoAmount: WEAPON_MACHINES.rifle.ammoAmount
  })

  Transform.createOrReplace(rifleMachineEntity, {
    position: WEAPON_MACHINES.rifle.position,
    scale: Vector3.create(1, 1, 1),
    rotation: WEAPON_MACHINES.rifle.rotation
  })

  GltfContainer.create(rifleMachineEntity, {
    src: WEAPON_MACHINES.rifle.model
  })

  // Add floating rifle model
  const floatingRifle = engine.addEntity()
  Transform.createOrReplace(floatingRifle, {
    position: WEAPON_MACHINES.rifle.floatingPosition,
    scale: Vector3.create(0.6, 0.6, 0.6),
    rotation: Quaternion.fromEulerDegrees(0, 90, 0)
  })
  GltfContainer.create(floatingRifle, {
    src: WEAPON_MACHINES.rifle.floatingWeaponModel
  })
  Animator.create(floatingRifle, {
    states: []
  })

  console.log('Weapon machines initialized')
}
