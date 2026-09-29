import { AvatarShape, Entity, GltfContainer, Transform, engine } from '@dcl/sdk/ecs'
import { Color3, Quaternion, Vector3 } from '@dcl/sdk/math'
import { getPlayer } from '@dcl/sdk/src/players'
import { art, ArtRole } from '../art/catalog'
import { HERO, WEAPONS, WeaponId } from '../config/balance'
import { CALLSIGN } from '../config/dialogue'
import { HERO_X, LANE_Z } from '../config/geometry'
import { playSfx } from '../core/audio'
import { consumeLaneRequest } from '../core/input'
import { isPlaying, state } from '../core/state'
import { attachModel, box, playClip, rgb } from '../world/props'
import { nearestEnemyInLane } from './enemies'
import { fireRateMultiplier, infiniteAmmo } from './pickups'
import { fireProjectile } from './projectiles'
import { spawnMuzzleFlash } from './vfx'

let heroRoot: Entity
let heroBody: Entity
let weaponEntity: Entity
let currentWeaponModel: WeaponId | null = null
let usingAvatar = false
let avatarApplied = false
let fireCooldown = 0
let currentZ = LANE_Z[1]

const WEAPON_ROLE: Record<WeaponId, ArtRole> = {
  pistol: 'weapon_pistol',
  shotgun: 'weapon_shotgun',
  rifle: 'weapon_rifle',
  assault: 'weapon_assault'
}

export function installHero(): void {
  heroRoot = engine.addEntity()
  currentZ = LANE_Z[state.hero.lane]
  Transform.create(heroRoot, {
    position: Vector3.create(HERO_X, 0, currentZ),
    rotation: Quaternion.fromEulerDegrees(0, 90, 0)
  })

  heroBody = engine.addEntity()
  Transform.create(heroBody, { position: Vector3.Zero(), parent: heroRoot })
  if (!attachModel(heroBody, 'hero')) {
    usingAvatar = true
    AvatarShape.create(heroBody, {
      id: 'seven-days-hero',
      name: CALLSIGN,
      wearables: [],
      emotes: []
    })
  }

  weaponEntity = engine.addEntity()
  Transform.create(weaponEntity, {
    position: Vector3.create(0.24, 1.22, 0.55),
    parent: heroRoot
  })
  applyWeaponModel(state.hero.weapon)

  engine.addSystem(heroSystem, 80, 'hero')
}

/** Copy the real player's look onto the hero once profile data is available. */
function tryMirrorPlayer(): void {
  if (!usingAvatar || avatarApplied) return
  const p = getPlayer()
  if (!p) return
  avatarApplied = true
  const shape = AvatarShape.getMutable(heroBody)
  shape.name = p.name || CALLSIGN
  if (p.avatar?.bodyShapeUrn) shape.bodyShape = p.avatar.bodyShapeUrn
  if (p.wearables && p.wearables.length > 0) shape.wearables = [...p.wearables]
  if (p.avatar?.skinColor) shape.skinColor = Color3.create(p.avatar.skinColor.r, p.avatar.skinColor.g, p.avatar.skinColor.b)
  if (p.avatar?.eyesColor) shape.eyeColor = Color3.create(p.avatar.eyesColor.r, p.avatar.eyesColor.g, p.avatar.eyesColor.b)
  if (p.avatar?.hairColor) shape.hairColor = Color3.create(p.avatar.hairColor.r, p.avatar.hairColor.g, p.avatar.hairColor.b)
}

function applyWeaponModel(weapon: WeaponId): void {
  if (currentWeaponModel === weapon) return
  currentWeaponModel = weapon
  const entry = art(WEAPON_ROLE[weapon])
  if (GltfContainer.has(weaponEntity)) GltfContainer.deleteFrom(weaponEntity)
  const t = Transform.getMutable(weaponEntity)
  t.rotation = Quaternion.fromEulerDegrees(0, entry.yaw, 0)
  t.scale = Vector3.create(entry.scale, entry.scale, entry.scale)
  if (entry.src) {
    GltfContainer.create(weaponEntity, { src: entry.src })
  } else {
    box(Vector3.create(0, 0, 0.3), Vector3.create(0.08, 0.1, 0.7), rgb(0.15, 0.15, 0.17), { parent: weaponEntity })
  }
}

export function equipWeapon(weapon: WeaponId, silent = false): void {
  if (!state.inventory.includes(weapon)) return
  state.hero.weapon = weapon
  state.hero.ammo = WEAPONS[weapon].magSize
  state.hero.reloading = false
  state.hero.reloadRemaining = 0
  fireCooldown = 0
  applyWeaponModel(weapon)
  if (!silent) playSfx('weapon-switch', 0.8)
}

/** Reset transient combat state at the start of a night. */
export function readyHeroForNight(): void {
  state.hero.ammo = WEAPONS[state.hero.weapon].magSize
  state.hero.reloading = false
  state.hero.reloadRemaining = 0
  state.hero.underAttack = false
  fireCooldown = 0.4
}

function muzzlePosition(): Vector3 {
  return Vector3.create(HERO_X + 0.9, 1.3, currentZ)
}

function heroSystem(dt: number): void {
  tryMirrorPlayer()

  // Lane movement is allowed whenever the hero is visible so the player can
  // pre-position during dialogue.
  const requested = consumeLaneRequest()
  if (requested !== null && requested !== state.hero.lane) {
    state.hero.lane = requested
    if (isPlaying()) playSfx('tink', 0.25)
  }
  const targetZ = LANE_Z[state.hero.lane]
  if (Math.abs(targetZ - currentZ) > 0.001) {
    const step = ((LANE_Z[0] - LANE_Z[1]) / HERO.laneSwitchSeconds) * dt
    const diff = targetZ - currentZ
    currentZ = Math.abs(diff) <= Math.abs(step) ? targetZ : currentZ + Math.sign(diff) * Math.abs(step)
    Transform.getMutable(heroRoot).position = Vector3.create(HERO_X, 0, currentZ)
    if (!usingAvatar) playClip(heroBody, 'hero', 'walk')
  } else if (!usingAvatar && !isPlaying()) {
    playClip(heroBody, 'hero', 'idle')
  }

  if (!isPlaying() || state.hero.health <= 0) return

  const def = WEAPONS[state.hero.weapon]
  fireCooldown -= dt

  if (state.hero.reloading) {
    state.hero.reloadRemaining -= dt
    if (state.hero.reloadRemaining <= 0) {
      state.hero.reloading = false
      state.hero.ammo = def.magSize
    }
    return
  }

  if (state.hero.ammo <= 0) {
    state.hero.reloading = true
    state.hero.reloadRemaining = def.reloadSeconds
    playSfx(def.reloadSfx, 0.7)
    return
  }

  if (fireCooldown > 0) return
  const target = nearestEnemyInLane(state.hero.lane, HERO_X + def.range)
  if (!target) return

  const fired = fireProjectile({
    lane: state.hero.lane,
    startX: HERO_X + 0.9,
    speed: def.projectileSpeed,
    damage: def.damage,
    pierce: def.pierce,
    range: def.range,
    color: def.tracerColor
  })
  if (!fired) return
  fireCooldown = 1 / (def.fireRate * fireRateMultiplier())
  if (!infiniteAmmo()) state.hero.ammo--
  playSfx(def.shotSfx)
  spawnMuzzleFlash(muzzlePosition(), def.tracerColor)
  if (!usingAvatar) playClip(heroBody, 'hero', 'attack', true)
}
