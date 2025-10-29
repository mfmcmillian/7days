/**
 * Machine Interaction System for Neural Collapse
 * Handles weapon machines and perk machines
 */

import { engine, Transform, InputAction, PointerEventType, inputSystem, Entity } from '@dcl/sdk/ecs'
import { Vector3 } from '@dcl/sdk/math'
import {
  WeaponMachine,
  DoubleTapMachine,
  RoyalArmorMachine,
  QuickReloadMachine,
  ExecutionersChestMachine,
  Player,
  PlayerBuffs,
  Health,
  Weapon,
  GameState
} from '../components/GameComponents'
import { playerEntity, gameStateEntity, getGamePhase, isPaused, weaponAmmo, getScore } from '../core/GameState'
import { createWeapon, upgradeWeapon } from '../entities/WeaponFactory'
import { shotgunMachineEntity, rifleMachineEntity } from '../features/WeaponMachineManager'
import {
  doubleTapMachineEntity,
  royalArmorMachineEntity,
  quickReloadMachineEntity,
  executionersChestMachineEntity
} from '../features/PerkMachineManager'
import { playSound } from '../audio/SoundManager'
import { WEAPON_FPS_SCALE } from '../utils/constants'

/**
 * Weapon Machine System
 */
export function weaponMachineSystem(dt: number) {
  if (getGamePhase() !== 'playing') return
  if (isPaused()) return

  const player = Player.getOrNull(playerEntity)
  if (!player) return

  const gameState = GameState.getMutable(gameStateEntity)
  const playerPos = Transform.get(engine.PlayerEntity).position

  // Check shotgun machine
  handleShotgunMachine(player, gameState, playerPos)

  // Check rifle machine
  handleRifleMachine(player, gameState, playerPos)
}

/**
 * Handle shotgun machine interaction
 */
function handleShotgunMachine(player: any, gameState: any, playerPos: Vector3) {
  const shotgunMachine = WeaponMachine.get(shotgunMachineEntity)
  const distance = Vector3.distance(playerPos, shotgunMachine.position)

  if (distance < 3 && inputSystem.isTriggered(InputAction.IA_PRIMARY, PointerEventType.PET_DOWN)) {
    const hasShotgun = player.weapons.some((weapon: Entity) => Weapon.getOrNull(weapon)?.type === 'shotgun')

    if (hasShotgun) {
      // Purchase ammo
      if (gameState.score >= shotgunMachine.shotgunAmmoPrice) {
        gameState.score -= shotgunMachine.shotgunAmmoPrice
        weaponAmmo.shotgun = Math.min(weaponAmmo.shotgun + shotgunMachine.shotgunAmmoAmount, weaponAmmo.maxShotgun)

        // Update stored ammo for all shotgun weapons
        for (const weapon of player.weapons) {
          const weaponComponent = Weapon.getOrNull(weapon)
          if (weaponComponent?.type === 'shotgun') {
            Weapon.getMutable(weapon).storedAmmo = weaponAmmo.shotgun
          }
        }

        playSound('sale', 'sounds/sale.mp3')
        console.log(`Purchased shotgun ammo`)
      } else {
        playSound('noPoints', 'sounds/no-points.mp3')
      }
    } else {
      // Purchase shotgun
      if (gameState.score >= shotgunMachine.shotgunPrice) {
        gameState.score -= shotgunMachine.shotgunPrice
        const shotgun = createWeapon('shotgun', Vector3.Zero())
        const shotgunWeapon = Weapon.getMutable(shotgun)
        shotgunWeapon.ammo = weaponAmmo.shotgun
        shotgunWeapon.storedAmmo = weaponAmmo.shotgun

        const mutablePlayer = Player.getMutable(playerEntity)
        if (mutablePlayer.weapons.length > 0) {
          const currentWeapon = mutablePlayer.weapons[mutablePlayer.currentWeaponIndex]
          Transform.getMutable(currentWeapon).scale = Vector3.Zero()
        }

        mutablePlayer.weapons.push(shotgun)
        mutablePlayer.currentWeaponIndex = mutablePlayer.weapons.length - 1
        Transform.getMutable(shotgun).scale = WEAPON_FPS_SCALE

        playSound('sale', 'sounds/sale.mp3')
        console.log(`Purchased shotgun`)
      } else {
        playSound('noPoints', 'sounds/no-points.mp3')
      }
    }
  }
}

/**
 * Handle rifle machine interaction
 */
function handleRifleMachine(player: any, gameState: any, playerPos: Vector3) {
  const rifleMachine = WeaponMachine.get(rifleMachineEntity)
  const distance = Vector3.distance(playerPos, rifleMachine.position)

  if (distance < 3 && inputSystem.isTriggered(InputAction.IA_PRIMARY, PointerEventType.PET_DOWN)) {
    const hasRifle = player.weapons.some((weapon: Entity) => Weapon.getOrNull(weapon)?.type === 'rifle')

    if (hasRifle) {
      // Purchase ammo
      if (gameState.score >= rifleMachine.rifleAmmoPrice) {
        gameState.score -= rifleMachine.rifleAmmoPrice
        weaponAmmo.rifle = Math.min(weaponAmmo.rifle + rifleMachine.rifleAmmoAmount, weaponAmmo.maxRifle)

        // Update stored ammo for all rifle weapons
        for (const weapon of player.weapons) {
          const weaponComponent = Weapon.getOrNull(weapon)
          if (weaponComponent?.type === 'rifle') {
            Weapon.getMutable(weapon).storedAmmo = weaponAmmo.rifle
          }
        }

        playSound('sale', 'sounds/sale.mp3')
        console.log(`Purchased rifle ammo`)
      } else {
        playSound('noPoints', 'sounds/no-points.mp3')
      }
    } else {
      // Purchase rifle
      if (gameState.score >= rifleMachine.riflePrice) {
        gameState.score -= rifleMachine.riflePrice
        const rifle = createWeapon('rifle', Vector3.Zero())
        const rifleWeapon = Weapon.getMutable(rifle)
        rifleWeapon.ammo = weaponAmmo.rifle
        rifleWeapon.storedAmmo = weaponAmmo.rifle

        const mutablePlayer = Player.getMutable(playerEntity)
        if (mutablePlayer.weapons.length > 0) {
          const currentWeapon = mutablePlayer.weapons[mutablePlayer.currentWeaponIndex]
          Transform.getMutable(currentWeapon).scale = Vector3.Zero()
        }

        mutablePlayer.weapons.push(rifle)
        mutablePlayer.currentWeaponIndex = mutablePlayer.weapons.length - 1
        Transform.getMutable(rifle).scale = WEAPON_FPS_SCALE

        playSound('sale', 'sounds/sale.mp3')
        console.log(`Purchased rifle`)
      } else {
        playSound('noPoints', 'sounds/no-points.mp3')
      }
    }
  }
}

/**
 * Perk Machine System
 */
export function perkMachineSystem(dt: number) {
  if (getGamePhase() !== 'playing') return
  if (isPaused()) return

  const playerTransform = Transform.getOrNull(engine.PlayerEntity)
  if (!playerTransform) return

  const playerPosition = playerTransform.position
  const gameState = GameState.get(gameStateEntity)
  const mutableGameState = GameState.getMutable(gameStateEntity)

  // Handle each perk machine
  handleDoubleTapMachine(playerPosition, gameState, mutableGameState)
  handleRoyalArmorMachine(playerPosition, gameState, mutableGameState)
  handleQuickReloadMachine(playerPosition, gameState, mutableGameState)
  handleExecutionersChestMachine(playerPosition, gameState, mutableGameState)
}

/**
 * Handle Double Tap machine
 */
function handleDoubleTapMachine(playerPosition: Vector3, gameState: any, mutableGameState: any) {
  const machine = DoubleTapMachine.getOrNull(doubleTapMachineEntity)
  if (!machine) return

  const distance = Vector3.distance(playerPosition, machine.position)
  if (distance < 3 && inputSystem.isTriggered(InputAction.IA_PRIMARY, PointerEventType.PET_DOWN)) {
    if (!machine.purchased && gameState.score >= machine.price) {
      const playerBuffs = PlayerBuffs.getMutable(engine.PlayerEntity)
      playerBuffs.damageMultiplier = 2
      playerBuffs.damageExpiry = Number.MAX_SAFE_INTEGER

      mutableGameState.score -= machine.price
      DoubleTapMachine.getMutable(doubleTapMachineEntity).purchased = true

      playSound('doubleTap', 'sounds/perkMachines/doubleTap.mp3')
      console.log('Purchased Double Tap')
    } else if (!machine.purchased) {
      playSound('noPoints', 'sounds/no-points.mp3')
    }
  }
}

/**
 * Handle Royal Armor machine
 */
function handleRoyalArmorMachine(playerPosition: Vector3, gameState: any, mutableGameState: any) {
  const machine = RoyalArmorMachine.getOrNull(royalArmorMachineEntity)
  if (!machine) return

  const distance = Vector3.distance(playerPosition, machine.position)
  if (distance < 3 && inputSystem.isTriggered(InputAction.IA_PRIMARY, PointerEventType.PET_DOWN)) {
    if (!machine.purchased && gameState.score >= machine.price) {
      const playerHealth = Health.getMutable(engine.PlayerEntity)
      playerHealth.max = 200
      playerHealth.current = 200

      mutableGameState.score -= machine.price
      RoyalArmorMachine.getMutable(royalArmorMachineEntity).purchased = true

      playSound('royalArmor', 'sounds/perkMachines/royalArmorMachine.mp3')
      console.log('Purchased Royal Armor')
    } else if (!machine.purchased) {
      playSound('noPoints', 'sounds/no-points.mp3')
    }
  }
}

/**
 * Handle Quick Reload machine
 */
function handleQuickReloadMachine(playerPosition: Vector3, gameState: any, mutableGameState: any) {
  const machine = QuickReloadMachine.getOrNull(quickReloadMachineEntity)
  if (!machine) return

  const distance = Vector3.distance(playerPosition, machine.position)
  if (distance < 3 && inputSystem.isTriggered(InputAction.IA_PRIMARY, PointerEventType.PET_DOWN)) {
    if (!machine.purchased && gameState.score >= machine.price) {
      const playerBuffs = PlayerBuffs.getMutable(engine.PlayerEntity)
      playerBuffs.reloadSpeedMultiplier = 0.5
      playerBuffs.reloadSpeedExpiry = Number.MAX_SAFE_INTEGER

      mutableGameState.score -= machine.price
      QuickReloadMachine.getMutable(quickReloadMachineEntity).purchased = true

      playSound('quickReload', 'sounds/perkMachines/quickReload.mp3')
      console.log('Purchased Quick Reload')
    } else if (!machine.purchased) {
      playSound('noPoints', 'sounds/no-points.mp3')
    }
  }
}

/**
 * Handle Executioner's Chest machine
 */
function handleExecutionersChestMachine(playerPosition: Vector3, gameState: any, mutableGameState: any) {
  const machine = ExecutionersChestMachine.getOrNull(executionersChestMachineEntity)
  if (!machine) return

  const distance = Vector3.distance(playerPosition, machine.position)
  if (distance < 3 && inputSystem.isTriggered(InputAction.IA_PRIMARY, PointerEventType.PET_DOWN)) {
    const player = Player.getOrNull(playerEntity)
    if (!player || player.weapons.length === 0) return

    const currentWeapon = player.weapons[player.currentWeaponIndex]
    const weapon = Weapon.getOrNull(currentWeapon)
    if (!weapon) return

    const mutableMachine = ExecutionersChestMachine.getMutable(executionersChestMachineEntity)

    if (!mutableMachine.upgradedWeapons.includes(weapon.type)) {
      if (gameState.score >= machine.price) {
        upgradeWeapon(currentWeapon, weapon.type as any)
        mutableMachine.upgradedWeapons.push(weapon.type)
        mutableGameState.score -= machine.price

        playSound('executionerChest', 'sounds/perkMachines/executionerChest.mp3')
        console.log(`Upgraded ${weapon.type}`)
      } else {
        playSound('noPoints', 'sounds/no-points.mp3')
      }
    }
  }
}
