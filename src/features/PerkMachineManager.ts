/**
 * Perk Machine Management for Neural Collapse
 * Handles perk machine entities and interactions
 */

import { engine, Entity, Transform, GltfContainer } from '@dcl/sdk/ecs'
import {
  DoubleTapMachine,
  RoyalArmorMachine,
  QuickReloadMachine,
  ExecutionersChestMachine
} from '../components/GameComponents'
import { PERK_MACHINES } from '../utils/constants'

// Perk machine entities
export let doubleTapMachineEntity: Entity
export let royalArmorMachineEntity: Entity
export let quickReloadMachineEntity: Entity
export let executionersChestMachineEntity: Entity

/**
 * Initialize all perk machines
 */
export function initializePerkMachines() {
  // Double Tap Machine
  doubleTapMachineEntity = engine.addEntity()
  DoubleTapMachine.create(doubleTapMachineEntity, {
    position: PERK_MACHINES.doubleTap.position,
    price: PERK_MACHINES.doubleTap.price,
    purchased: false
  })
  Transform.createOrReplace(doubleTapMachineEntity, {
    position: PERK_MACHINES.doubleTap.displayPosition,
    scale: { x: 1, y: 1, z: 1 },
    rotation: PERK_MACHINES.doubleTap.rotation
  })
  GltfContainer.create(doubleTapMachineEntity, {
    src: PERK_MACHINES.doubleTap.model
  })

  // Royal Armor Machine
  royalArmorMachineEntity = engine.addEntity()
  RoyalArmorMachine.create(royalArmorMachineEntity, {
    position: PERK_MACHINES.royalArmor.position,
    price: PERK_MACHINES.royalArmor.price,
    purchased: false
  })
  Transform.createOrReplace(royalArmorMachineEntity, {
    position: PERK_MACHINES.royalArmor.position,
    scale: { x: 1, y: 1, z: 1 },
    rotation: PERK_MACHINES.royalArmor.rotation
  })
  GltfContainer.create(royalArmorMachineEntity, {
    src: PERK_MACHINES.royalArmor.model
  })

  // Quick Reload Machine
  quickReloadMachineEntity = engine.addEntity()
  QuickReloadMachine.create(quickReloadMachineEntity, {
    position: PERK_MACHINES.quickReload.position,
    price: PERK_MACHINES.quickReload.price,
    purchased: false
  })
  Transform.createOrReplace(quickReloadMachineEntity, {
    position: PERK_MACHINES.quickReload.position,
    scale: { x: 1, y: 1, z: 1 },
    rotation: PERK_MACHINES.quickReload.rotation
  })
  GltfContainer.create(quickReloadMachineEntity, {
    src: PERK_MACHINES.quickReload.model
  })

  // Executioner's Chest Machine
  executionersChestMachineEntity = engine.addEntity()
  ExecutionersChestMachine.create(executionersChestMachineEntity, {
    position: PERK_MACHINES.executionersChest.position,
    price: PERK_MACHINES.executionersChest.price,
    purchased: false,
    upgradedWeapons: []
  })
  Transform.createOrReplace(executionersChestMachineEntity, {
    position: PERK_MACHINES.executionersChest.position,
    scale: { x: 1, y: 1, z: 1 },
    rotation: PERK_MACHINES.executionersChest.rotation
  })
  GltfContainer.create(executionersChestMachineEntity, {
    src: PERK_MACHINES.executionersChest.model
  })

  console.log('Perk machines initialized')
}

/**
 * Reset all perk machines (for new game)
 */
export function resetPerkMachines() {
  DoubleTapMachine.getMutable(doubleTapMachineEntity).purchased = false
  RoyalArmorMachine.getMutable(royalArmorMachineEntity).purchased = false
  QuickReloadMachine.getMutable(quickReloadMachineEntity).purchased = false
  const executionersChest = ExecutionersChestMachine.getMutable(executionersChestMachineEntity)
  executionersChest.purchased = false
  executionersChest.upgradedWeapons = []
  console.log('Reset all perk machines')
}
