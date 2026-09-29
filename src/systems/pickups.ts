import { Billboard, BillboardMode, Entity, Font, MeshRenderer, TextAlignMode, TextShape, Transform, engine } from '@dcl/sdk/ecs'
import { Color4, Quaternion, Vector3 } from '@dcl/sdk/math'
import { art } from '../art/catalog'
import { BARRICADE, EnemyKind, HERO, PICKUPS, PICKUP_RULES, PickupKind, WEAPONS } from '../config/balance'
import { HERO_X, LANE_Z, PICKUP_Y } from '../config/geometry'
import { playSfx } from '../core/audio'
import { hasEffect, isPlaying, pushToast, state } from '../core/state'
import { attachModel, rgb, tintEmissive } from '../world/props'
import { SfxId } from '../config/media'

interface Pickup {
  root: Entity
  crate: Entity
  label: Entity
  kind: PickupKind
  lane: number
  x: number
  spin: number
  active: boolean
}

const POOL = 8
const pool: Pickup[] = []
const PARK = Vector3.create(4, -24, 4)

function make(): Pickup {
  const root = engine.addEntity()
  Transform.create(root, { position: Vector3.clone(PARK) })
  const crate = engine.addEntity()
  Transform.create(crate, { position: Vector3.create(0, PICKUP_Y, 0), scale: Vector3.create(0.7, 0.7, 0.7), parent: root })
  if (!attachModel(crate, 'pickup_crate')) {
    MeshRenderer.setBox(crate)
    tintEmissive(crate, rgb(1, 1, 1), 2)
  }
  const label = engine.addEntity()
  Transform.create(label, { position: Vector3.create(0, PICKUP_Y + 1.0, 0), parent: root })
  TextShape.create(label, {
    text: '',
    fontSize: 2.2,
    font: Font.F_SANS_SERIF,
    textColor: Color4.White(),
    outlineColor: Color4.Black(),
    outlineWidth: 0.15,
    textAlign: TextAlignMode.TAM_MIDDLE_CENTER
  })
  Billboard.create(label, { billboardMode: BillboardMode.BM_Y })
  return { root, crate, label, kind: 'medkit', lane: 1, x: 0, spin: 0, active: false }
}

export function installPickups(): void {
  for (let i = 0; i < POOL; i++) pool.push(make())
  engine.addSystem(pickupSystem, 110, 'pickups')
}

function pickRandomKind(): PickupKind {
  const entries = Object.values(PICKUPS).filter((p) => {
    // Don't offer heals / repairs when they'd be wasted.
    if (p.kind === 'medkit' && state.hero.health > HERO.maxHealth * 0.85) return false
    if (p.kind === 'repair' && state.barricade.health > BARRICADE.maxHealth * 0.9) return false
    return true
  })
  const total = entries.reduce((s, p) => s + p.weight, 0)
  let r = Math.random() * total
  for (const p of entries) {
    r -= p.weight
    if (r <= 0) return p.kind
  }
  return entries[entries.length - 1].kind
}

export function maybeDropPickup(lane: number, x: number, killedKind: EnemyKind): void {
  const guaranteed = state.killsSinceDrop >= PICKUP_RULES.guaranteedEveryKills
  const roll = Math.random() < PICKUP_RULES.dropChance
  const bossDrop = killedKind === 'boss' || killedKind === 'brute'
  if (!guaranteed && !roll && !bossDrop) return
  const slot = pool.find((p) => !p.active)
  if (!slot) return
  state.killsSinceDrop = 0
  const kind = pickRandomKind()
  const def = PICKUPS[kind]
  slot.kind = kind
  slot.lane = lane
  slot.x = Math.max(HERO_X + 6, x)
  slot.spin = 0
  slot.active = true
  Transform.getMutable(slot.root).position = Vector3.create(slot.x, 0, LANE_Z[lane])
  if (!art('pickup_crate').src) tintEmissive(slot.crate, rgb(def.color[0], def.color[1], def.color[2]), 2.5)
  const text = TextShape.getMutable(slot.label)
  text.text = def.label
  text.textColor = Color4.create(def.color[0], def.color[1], def.color[2], 1)
}

function collect(p: Pickup): void {
  const def = PICKUPS[p.kind]
  playSfx(def.sfx as SfxId, 0.9)
  pushToast(def.label, def.color, 2.2)
  switch (p.kind) {
    case 'medkit':
      state.hero.health = Math.min(HERO.maxHealth, state.hero.health + PICKUP_RULES.medkitHeal)
      break
    case 'repair':
      state.barricade.health = Math.min(BARRICADE.maxHealth, state.barricade.health + PICKUP_RULES.repairAmount)
      break
    case 'max_ammo': {
      state.hero.ammo = WEAPONS[state.hero.weapon].magSize
      state.hero.reloading = false
      state.hero.reloadRemaining = 0
      addEffect(p.kind, def.duration)
      break
    }
    default:
      addEffect(p.kind, def.duration)
  }
  release(p)
}

function addEffect(kind: PickupKind, duration: number): void {
  const existing = state.effects.find((e) => e.kind === kind)
  if (existing) {
    existing.remaining = duration
    existing.duration = duration
  } else {
    state.effects.push({ kind, remaining: duration, duration })
  }
}

function release(p: Pickup): void {
  p.active = false
  Transform.getMutable(p.root).position = Vector3.clone(PARK)
}

export function clearPickups(): void {
  for (const p of pool) if (p.active) release(p)
  state.effects = []
}

export function fireRateMultiplier(): number {
  return hasEffect('fire_rate') ? PICKUP_RULES.fireRateMultiplier : 1
}

export function infiniteAmmo(): boolean {
  return hasEffect('max_ammo')
}

function pickupSystem(dt: number): void {
  const playing = isPlaying()
  if (playing) {
    for (let i = state.effects.length - 1; i >= 0; i--) {
      state.effects[i].remaining -= dt
      if (state.effects[i].remaining <= 0) state.effects.splice(i, 1)
    }
  }
  for (const p of pool) {
    if (!p.active) continue
    if (!playing) continue
    p.spin += dt * 90
    p.x -= PICKUP_RULES.driftSpeed * dt
    const t = Transform.getMutable(p.root)
    t.position = Vector3.create(p.x, 0, LANE_Z[p.lane])
    const ct = Transform.getMutable(p.crate)
    ct.rotation = Quaternion.fromEulerDegrees(0, p.spin, 0)
    ct.position = Vector3.create(0, PICKUP_Y + Math.sin(p.spin / 40) * 0.12, 0)
    if (p.x <= HERO_X + 1.2 && p.lane === state.hero.lane) {
      collect(p)
    } else if (p.x < HERO_X - 1.5) {
      release(p)
    }
  }
}
