/**
 * Weapon System for Neural Collapse
 * Handles weapon shooting, recoil, reloading, and switching
 */

import {
  engine,
  Transform,
  Raycast,
  InputAction,
  PointerEventType,
  inputSystem,
  Animator,
  AudioSource,
  Entity
} from '@dcl/sdk/ecs'
import { Vector3, Quaternion } from '@dcl/sdk/math'
import { Weapon, Player, PlayerBuffs, AnimationState } from '../components/GameComponents'
import { playerEntity, lastShotTime, updateLastShotTime, getGamePhase, isPaused, weaponAmmo } from '../core/GameState'
import { playSound } from '../audio/SoundManager'
import { WEAPON_FPS_SCALE } from '../utils/constants'
import { getWeaponDisplayName } from '../entities/WeaponFactory'
import { createMuzzleFlash } from './VisualEffectsSystem'

/**
 * Shooting System
 */
export function shootingSystem(dt: number) {
  if (getGamePhase() !== 'playing') return
  if (isPaused()) return

  const player = Player.getOrNull(playerEntity)
  if (!player || player.weapons.length === 0) return

  const currentWeapon = player.weapons[player.currentWeaponIndex]
  const weapon = Weapon.getOrNull(currentWeapon)
  if (!weapon || weapon.isReloading) return

  const playerBuffs = PlayerBuffs.getOrNull(engine.PlayerEntity)
  if (!playerBuffs) return

  const currentTime = Date.now()
  const timeSinceLastShot = currentTime - lastShotTime
  const canFire = timeSinceLastShot >= weapon.fireRate * playerBuffs.fireRateMultiplier * 1000

  // Check if player is holding the fire button
  const isHoldingFire =
    inputSystem.isTriggered(InputAction.IA_POINTER, PointerEventType.PET_DOWN) ||
    (inputSystem.isPressed(InputAction.IA_POINTER) && weapon.type === 'rifle')

  if (isHoldingFire && canFire) {
    // Check ammo for non-pistol weapons
    if (weapon.type !== 'pistol' && weapon.ammo <= 0) {
      playSound('shotFail', 'sounds/shotFail.mp3')
      return
    }

    // Apply recoil
    const mutableWeapon = Weapon.getMutable(currentWeapon)
    mutableWeapon.recoilFactor = 1

    // Play weapon animation
    if (Animator.getOrNull(currentWeapon)) {
      const currentState = AnimationState.get(currentWeapon)

      if (currentState.currentClip !== 'fire') {
        const fireClip = Animator.getClip(currentWeapon, 'fire')
        fireClip.playing = true

        const mutableState = AnimationState.getMutable(currentWeapon)
        mutableState.currentClip = 'fire'
        mutableState.nextClip = 'idle'
      }
    }

    // Get camera transform for raycasting
    const cameraTransform = Transform.getOrNull(engine.CameraEntity)
    if (!cameraTransform) return

    const cameraPosition = cameraTransform.position
    const cameraRotation = cameraTransform.rotation

    // Calculate forward direction with slight downward angle
    const forwardVector = Vector3.rotate(Vector3.create(0, -0.01, 1), cameraRotation)

    // Get weapon position for muzzle flash
    const weaponTransform = Transform.getOrNull(currentWeapon)
    const weaponPosition = weaponTransform ? weaponTransform.position : cameraPosition

    // Create raycast entity
    const raycastEntity = engine.addEntity()
    Transform.create(raycastEntity, {
      position: Vector3.add(cameraPosition, Vector3.scale(forwardVector, 0.5)),
      rotation: cameraRotation
    })

    Raycast.create(raycastEntity, {
      continuous: false,
      direction: { $case: 'localDirection', localDirection: Vector3.create(0, -0.01, 1) },
      maxDistance: 100,
      queryType: 0,
      collisionMask: 2,
      timestamp: Date.now()
    })

    // Update weapon ammo
    if (weapon.type !== 'pistol') {
      mutableWeapon.ammo -= 1
      if (weapon.type === 'shotgun') {
        weaponAmmo.shotgun = mutableWeapon.ammo
      } else if (weapon.type === 'rifle') {
        weaponAmmo.rifle = mutableWeapon.ammo
      }
    }

    // Update last shot time
    updateLastShotTime(currentTime)

    // Play shooting sound
    if (weapon.type === 'shotgun') {
      playSound('shotgunShot', 'sounds/zombie-sounds/shotgun-shot.mp3')
    } else {
      playSound('shot', 'sounds/shot.mp3')
    }

    // Create muzzle flash effect at weapon position
    createMuzzleFlash(weaponPosition, forwardVector)

    console.log(`Fired ${weapon.type}, ammo: ${weapon.ammo}`)
  }
}

/**
 * Weapon Recoil System
 */
export function weaponRecoilSystem(dt: number) {
  if (getGamePhase() !== 'playing') return

  for (const [entity, weapon] of engine.getEntitiesWith(Weapon)) {
    if (weapon.active && weapon.recoilFactor > 0) {
      const transform = Transform.getMutable(entity)

      // Apply recoil
      transform.position = Vector3.lerp(weapon.restPosition, weapon.recoilPosition, weapon.recoilFactor)
      transform.rotation = Quaternion.slerp(weapon.restRotation, weapon.recoilRotation, weapon.recoilFactor)

      // Reduce recoil over time
      const mutableWeapon = Weapon.getMutable(entity)
      mutableWeapon.recoilFactor = Math.max(0, weapon.recoilFactor - weapon.recoilSpeed * dt)
    }
  }
}

/**
 * Weapon Switch System
 */
export function weaponSwitchSystem(dt: number) {
  if (getGamePhase() !== 'playing') return
  if (isPaused()) return

  const player = Player.getOrNull(playerEntity)
  if (!player || player.weapons.length === 0) return

  // Switch to previous weapon with Q
  if (inputSystem.isTriggered(InputAction.IA_ACTION_3, PointerEventType.PET_DOWN)) {
    switchWeapon(player, -1)
  }
  // Switch to next weapon with E
  else if (inputSystem.isTriggered(InputAction.IA_ACTION_4, PointerEventType.PET_DOWN)) {
    switchWeapon(player, 1)
  }
}

/**
 * Helper function to switch weapons
 */
function switchWeapon(player: any, direction: number) {
  const mutablePlayer = Player.getMutable(playerEntity)

  // Hide current weapon
  const currentWeapon = mutablePlayer.weapons[mutablePlayer.currentWeaponIndex] as Entity
  Transform.getMutable(currentWeapon).scale = Vector3.Zero()

  // Calculate new index
  const newIndex =
    direction > 0
      ? (mutablePlayer.currentWeaponIndex + 1) % mutablePlayer.weapons.length
      : (mutablePlayer.currentWeaponIndex - 1 + mutablePlayer.weapons.length) % mutablePlayer.weapons.length

  mutablePlayer.currentWeaponIndex = newIndex

  // Show new weapon
  const newWeapon = mutablePlayer.weapons[newIndex] as Entity
  Transform.getMutable(newWeapon).scale = WEAPON_FPS_SCALE

  const weapon = Weapon.get(newWeapon)
  console.log(`Switched to ${getWeaponDisplayName(weapon.type as any)}, ammo: ${weapon.ammo}`)

  // Play weapon switch sound
  playSound('weaponSwitch', 'sounds/zombie-sounds/weapon-switch.mp3')
}

/**
 * Weapon Reload System
 */
export function weaponReloadSystem(dt: number) {
  if (getGamePhase() !== 'playing') return
  if (isPaused()) return

  const player = Player.getOrNull(playerEntity)
  if (!player || player.weapons.length === 0) return

  const currentWeapon = player.weapons[player.currentWeaponIndex]
  const weapon = Weapon.getOrNull(currentWeapon)
  if (!weapon) return

  const playerBuffs = PlayerBuffs.getOrNull(engine.PlayerEntity)
  if (!playerBuffs) return

  // Check for manual reload (R key)
  if (
    inputSystem.isTriggered(InputAction.IA_SECONDARY, PointerEventType.PET_DOWN) &&
    !weapon.isReloading &&
    weapon.ammo < weapon.maxAmmo
  ) {
    if (weapon.storedAmmo > 0) {
      startReload(currentWeapon, weapon)
    } else {
      console.log('No stored ammo available to reload')
    }
  }

  // Handle ongoing reload
  if (weapon.isReloading) {
    const currentTime = Date.now()
    const reloadProgress =
      (currentTime - weapon.reloadStartTime) / (weapon.reloadTime * playerBuffs.reloadSpeedMultiplier)

    if (reloadProgress >= 1) {
      finishReload(currentWeapon, weapon, player)
    }
  }
}

/**
 * Start weapon reload
 */
function startReload(weaponEntity: Entity, weapon: any) {
  const mutableWeapon = Weapon.getMutable(weaponEntity)
  mutableWeapon.isReloading = true
  mutableWeapon.reloadStartTime = Date.now()

  // Play reload sound
  playSound('reload', `sounds/zombie-sounds/${weapon.type}-reload.mp3`)

  // Play reload animation
  if (Animator.getOrNull(weaponEntity)) {
    const reloadClip = Animator.getClip(weaponEntity, 'reload')
    reloadClip.playing = true
    reloadClip.weight = 1

    const idleClip = Animator.getClip(weaponEntity, 'idle')
    idleClip.playing = false
    idleClip.weight = 0

    const mutableState = AnimationState.getMutable(weaponEntity)
    mutableState.currentClip = 'reload'
    mutableState.nextClip = 'idle'
  }

  console.log(`Started reloading ${weapon.type}`)
}

/**
 * Finish weapon reload
 */
function finishReload(weaponEntity: Entity, weapon: any, player: any) {
  const mutableWeapon = Weapon.getMutable(weaponEntity)
  const ammoNeeded = weapon.maxAmmo - weapon.ammo
  const ammoToReload = Math.min(ammoNeeded, weapon.storedAmmo)

  // Update weapon ammo
  mutableWeapon.ammo += ammoToReload
  mutableWeapon.storedAmmo -= ammoToReload
  mutableWeapon.isReloading = false
  mutableWeapon.reloadStartTime = 0

  // Update global ammo state
  const isUpgraded = weapon.modelPath.includes('-exe.glb')
  switch (weapon.type) {
    case 'pistol':
      weaponAmmo.pistol = Math.min(weapon.storedAmmo, isUpgraded ? weaponAmmo.maxPistol * 2 : weaponAmmo.maxPistol)
      break
    case 'shotgun':
      weaponAmmo.shotgun = Math.min(weapon.storedAmmo, isUpgraded ? weaponAmmo.maxShotgun * 2 : weaponAmmo.maxShotgun)
      break
    case 'rifle':
      weaponAmmo.rifle = Math.min(weapon.storedAmmo, isUpgraded ? weaponAmmo.maxRifle * 2 : weaponAmmo.maxRifle)
      break
  }

  // Play idle animation
  if (Animator.getOrNull(weaponEntity)) {
    const reloadClip = Animator.getClip(weaponEntity, 'reload')
    reloadClip.playing = false
    reloadClip.weight = 0

    const idleClip = Animator.getClip(weaponEntity, 'idle')
    idleClip.playing = true
    idleClip.weight = 1

    const mutableState = AnimationState.getMutable(weaponEntity)
    mutableState.currentClip = 'idle'
    mutableState.nextClip = ''
  }

  console.log(`Finished reloading ${weapon.type}, ammo: ${mutableWeapon.ammo}, stored: ${mutableWeapon.storedAmmo}`)
}
