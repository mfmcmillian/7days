import { Entity, MeshRenderer, Transform, engine } from '@dcl/sdk/ecs'
import { Quaternion, Vector3 } from '@dcl/sdk/math'
import { art } from '../art/catalog'
import { ENEMIES, EnemyKind, HERO } from '../config/balance'
import { BARRICADE_ATTACK_X, HERO_ATTACK_X, LANE_Z, SPAWN_X, SPAWN_X_JITTER } from '../config/geometry'
import { playSfx } from '../core/audio'
import { shakeCamera } from '../core/camera'
import { hasEffect, isPlaying, pushToast, state } from '../core/state'
import { attachModel, box, playClip, rgb, tintEmissive } from '../world/props'
import { spawnHitSpark } from './vfx'
import { maybeDropPickup } from './pickups'

export type EnemyState = 'walking' | 'attacking' | 'dying' | 'idle'

export interface Enemy {
  entity: Entity
  ring: Entity
  kind: EnemyKind
  lane: number
  x: number
  health: number
  maxHealth: number
  state: EnemyState
  active: boolean
  attackTick: number
  growlTimer: number
  dieTimer: number
  speedJitter: number
}

const POOL_SIZE = 44
const pool: Enemy[] = []
const PARK = Vector3.create(2, -20, 2)

function facingHero(): Quaternion {
  return Quaternion.fromEulerDegrees(0, 270 + art('zombie').yaw, 0)
}

function makeEnemy(): Enemy {
  const entity = engine.addEntity()
  Transform.create(entity, { position: Vector3.clone(PARK), scale: Vector3.create(0.001, 0.001, 0.001) })
  if (!attachModel(entity, 'zombie', 270)) {
    // Placeholder body when no zombie model is configured.
    box(Vector3.create(0, 0.9, 0), Vector3.create(0.6, 1.8, 0.4), rgb(0.25, 0.4, 0.2), { parent: entity })
  }
  const ring = engine.addEntity()
  Transform.create(ring, {
    position: Vector3.clone(PARK),
    rotation: Quaternion.fromEulerDegrees(90, 0, 0),
    scale: Vector3.create(0.001, 0.001, 0.001)
  })
  // Ring is a flat emissive disc; only shown for brutes and bosses.
  MeshRenderer.setPlane(ring)
  tintEmissive(ring, rgb(1, 0.1, 0.1), 2, 0.6)
  return {
    entity,
    ring,
    kind: 'walker',
    lane: 1,
    x: SPAWN_X,
    health: 1,
    maxHealth: 1,
    state: 'idle',
    active: false,
    attackTick: 0,
    growlTimer: 0,
    dieTimer: 0,
    speedJitter: 1
  }
}

export function installEnemies(): void {
  for (let i = 0; i < POOL_SIZE; i++) pool.push(makeEnemy())
  engine.addSystem(enemySystem, 100, 'enemies')
}

export function activeEnemies(): Enemy[] {
  return pool.filter((e) => e.active && e.state !== 'dying')
}

export function anyEnemiesAlive(): boolean {
  return pool.some((e) => e.active)
}

export function enemiesInLane(lane: number): Enemy[] {
  return pool.filter((e) => e.active && e.state !== 'dying' && e.lane === lane).sort((a, b) => a.x - b.x)
}

export function nearestEnemyInLane(lane: number, maxX: number): Enemy | null {
  let best: Enemy | null = null
  for (const e of pool) {
    if (!e.active || e.state === 'dying' || e.lane !== lane || e.x > maxX) continue
    if (!best || e.x < best.x) best = e
  }
  return best
}

export function spawnEnemy(kind: EnemyKind, lane: number): Enemy | null {
  const rec = pool.find((e) => !e.active)
  if (!rec) return null
  const def = ENEMIES[kind]
  const night = state.night
  rec.kind = kind
  rec.lane = lane
  rec.x = SPAWN_X + (Math.random() - 0.5) * 2 * SPAWN_X_JITTER
  rec.maxHealth = def.baseHealth + def.healthPerNight * (night - 1)
  rec.health = rec.maxHealth
  rec.state = 'walking'
  rec.active = true
  rec.attackTick = 0
  rec.growlTimer = 1 + Math.random() * 4
  rec.dieTimer = 0
  rec.speedJitter = 0.9 + Math.random() * 0.2

  const t = Transform.getMutable(rec.entity)
  const s = art('zombie').scale * def.scale
  t.position = Vector3.create(rec.x, art('zombie').yOffset, LANE_Z[lane])
  t.scale = Vector3.create(s, s, s)
  t.rotation = facingHero()
  playClip(rec.entity, 'zombie', def.moveClip, true)

  const rt = Transform.getMutable(rec.ring)
  if (kind === 'brute' || kind === 'boss') {
    const r = kind === 'boss' ? 2.6 : 1.8
    rt.scale = Vector3.create(r, r, 1)
    rt.position = Vector3.create(rec.x, 0.05, LANE_Z[lane])
    tintEmissive(rec.ring, kind === 'boss' ? rgb(1, 0.15, 0.1) : rgb(1, 0.5, 0.1), 2.5, 0.55)
  } else {
    rt.scale = Vector3.create(0.001, 0.001, 0.001)
  }

  if (kind === 'boss') {
    state.nightStats.bossAlive = true
    state.nightStats.bossHealth = rec.health
    state.nightStats.bossMaxHealth = rec.maxHealth
    playSfx('longGrowl', 0.8)
    pushToast('SOMETHING BIG IS COMING', [1, 0.3, 0.2], 3)
    shakeCamera(0.5, 0.6)
  } else if (kind === 'brute') {
    playSfx('growl2', 0.7)
  }
  state.nightStats.spawned++
  return rec
}

function deactivate(rec: Enemy): void {
  rec.active = false
  rec.state = 'idle'
  const t = Transform.getMutable(rec.entity)
  t.position = Vector3.clone(PARK)
  t.scale = Vector3.create(0.001, 0.001, 0.001)
  const rt = Transform.getMutable(rec.ring)
  rt.scale = Vector3.create(0.001, 0.001, 0.001)
  rt.position = Vector3.clone(PARK)
}

/** Apply damage. Returns true when the hit killed the enemy. */
export function damageEnemy(rec: Enemy, amount: number, hitY = 1.2): boolean {
  if (!rec.active || rec.state === 'dying') return false
  const dmg = hasEffect('instant_kill') && rec.kind !== 'boss' ? rec.health : amount
  rec.health -= dmg
  spawnHitSpark(Vector3.create(rec.x - 0.3, hitY, LANE_Z[rec.lane]), rec.kind === 'boss' || rec.kind === 'brute')
  if (rec.kind === 'boss') state.nightStats.bossHealth = Math.max(0, rec.health)
  if (rec.health > 0) return false
  kill(rec)
  return true
}

function kill(rec: Enemy): void {
  const def = ENEMIES[rec.kind]
  const mult = hasEffect('double_points') ? 2 : 1
  state.score += def.score * mult
  state.totalKills++
  state.nightStats.kills++
  state.killsSinceDrop++
  if (rec.kind === 'boss') {
    state.nightStats.bossAlive = false
    state.nightStats.bossHealth = 0
    pushToast('BOSS DOWN  +' + def.score * mult, [1, 0.85, 0.2], 2.5)
    shakeCamera(0.6, 0.5)
  }
  rec.state = 'dying'
  rec.dieTimer = 1.6
  playClip(rec.entity, 'zombie', 'die', true)
  playSfx('die', rec.kind === 'boss' ? 1 : 0.55)
  const rt = Transform.getMutable(rec.ring)
  rt.scale = Vector3.create(0.001, 0.001, 0.001)
  maybeDropPickup(rec.lane, rec.x, rec.kind)
}

/** Wipe the field (night reset / game over). */
export function clearEnemies(): void {
  for (const rec of pool) if (rec.active) deactivate(rec)
  state.nightStats.bossAlive = false
}

let heroDamageAccumulator = 0

function enemySystem(dt: number): void {
  const playing = isPlaying()
  let heroUnderAttack = false

  for (const rec of pool) {
    if (!rec.active) continue

    if (rec.state === 'dying') {
      rec.dieTimer -= dt
      // Sink into the ground during the last part of the death animation.
      if (rec.dieTimer < 0.6) {
        const t = Transform.getMutable(rec.entity)
        t.position = Vector3.create(t.position.x, t.position.y - dt * 1.2, t.position.z)
      }
      if (rec.dieTimer <= 0) deactivate(rec)
      continue
    }

    if (!playing) continue

    const def = ENEMIES[rec.kind]
    const barricadeUp = state.barricade.health > 0
    const stopX = barricadeUp ? BARRICADE_ATTACK_X : HERO_ATTACK_X

    rec.growlTimer -= dt
    if (rec.growlTimer <= 0) {
      rec.growlTimer = 4 + Math.random() * 7
      if (Math.random() < 0.5) playSfx(Math.random() < 0.5 ? 'growl' : 'growl2', 0.3)
    }

    if (rec.x > stopX) {
      if (rec.state !== 'walking') {
        rec.state = 'walking'
        playClip(rec.entity, 'zombie', def.moveClip, true)
      }
      rec.x = Math.max(stopX, rec.x - def.speed * rec.speedJitter * dt)
      const t = Transform.getMutable(rec.entity)
      t.position = Vector3.create(rec.x, art('zombie').yOffset, LANE_Z[rec.lane])
      if (rec.kind === 'brute' || rec.kind === 'boss') {
        const rt = Transform.getMutable(rec.ring)
        rt.position = Vector3.create(rec.x, 0.05, LANE_Z[rec.lane])
      }
    } else {
      if (rec.state !== 'attacking') {
        rec.state = 'attacking'
        rec.attackTick = 0.4
        playClip(rec.entity, 'zombie', 'attack', true)
      }
      rec.attackTick -= dt
      if (rec.attackTick <= 0) {
        rec.attackTick = 1.0
        playClip(rec.entity, 'zombie', 'attack', true)
        if (Math.random() < 0.6) playSfx('attack', 0.35)
      }
      if (barricadeUp) {
        state.barricade.health = Math.max(0, state.barricade.health - def.dps * dt)
        if (state.barricade.health <= 0) {
          pushToast('BARRICADE BREACHED', [1, 0.25, 0.2], 3)
          playSfx('thunk', 1)
          shakeCamera(0.7, 0.7)
        }
      } else {
        heroUnderAttack = true
        heroDamageAccumulator += def.dps * dt
        if (heroDamageAccumulator >= 1) {
          const whole = Math.floor(heroDamageAccumulator)
          heroDamageAccumulator -= whole
          state.hero.health = Math.max(0, state.hero.health - whole)
          shakeCamera(0.2, 0.15)
        }
      }
    }
  }

  state.hero.underAttack = heroUnderAttack
  if (playing && !heroUnderAttack && state.hero.health > 0 && state.hero.health < HERO.maxHealth) {
    state.hero.health = Math.min(HERO.maxHealth, state.hero.health + HERO.regenPerSecond * dt)
  }
}
