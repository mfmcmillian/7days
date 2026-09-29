import { Entity, MeshRenderer, Transform, engine } from '@dcl/sdk/ecs'
import { Vector3 } from '@dcl/sdk/math'
import { LANE_Z, PROJECTILE_Y } from '../config/geometry'
import { isPlaying } from '../core/state'
import { rgb, tintEmissive } from '../world/props'
import { Enemy, damageEnemy, enemiesInLane } from './enemies'

export interface ShotSpec {
  lane: number
  startX: number
  speed: number
  damage: number
  pierce: number
  range: number
  color: [number, number, number]
}

interface Projectile {
  entity: Entity
  lane: number
  x: number
  startX: number
  speed: number
  damage: number
  pierce: number
  range: number
  hit: Set<Enemy>
  active: boolean
}

const POOL = 48
const pool: Projectile[] = []
const PARK = Vector3.create(6, -26, 6)

export function installProjectiles(): void {
  for (let i = 0; i < POOL; i++) {
    const entity = engine.addEntity()
    Transform.create(entity, { position: Vector3.clone(PARK), scale: Vector3.create(0.001, 0.001, 0.001) })
    MeshRenderer.setBox(entity)
    tintEmissive(entity, rgb(1, 1, 1), 4)
    pool.push({ entity, lane: 0, x: 0, startX: 0, speed: 0, damage: 0, pierce: 1, range: 0, hit: new Set(), active: false })
  }
  engine.addSystem(projectileSystem, 90, 'projectiles')
}

export function fireProjectile(spec: ShotSpec): boolean {
  const p = pool.find((x) => !x.active)
  if (!p) return false
  p.active = true
  p.lane = spec.lane
  p.x = spec.startX
  p.startX = spec.startX
  p.speed = spec.speed
  p.damage = spec.damage
  p.pierce = spec.pierce
  p.range = spec.range
  p.hit.clear()
  const t = Transform.getMutable(p.entity)
  t.position = Vector3.create(p.x, PROJECTILE_Y, LANE_Z[p.lane])
  // Long thin tracer along X.
  t.scale = Vector3.create(0.9, 0.07, 0.07)
  tintEmissive(p.entity, rgb(spec.color[0], spec.color[1], spec.color[2]), 4)
  return true
}

function release(p: Projectile): void {
  p.active = false
  const t = Transform.getMutable(p.entity)
  t.position = Vector3.clone(PARK)
  t.scale = Vector3.create(0.001, 0.001, 0.001)
}

export function clearProjectiles(): void {
  for (const p of pool) if (p.active) release(p)
}

function projectileSystem(dt: number): void {
  if (!isPlaying()) {
    for (const p of pool) if (p.active) release(p)
    return
  }
  for (const p of pool) {
    if (!p.active) continue
    const prev = p.x
    p.x += p.speed * dt
    // Hit test against every enemy in this lane whose body spans [prev, p.x + 0.4].
    const targets = enemiesInLane(p.lane)
    for (const e of targets) {
      if (p.hit.has(e)) continue
      const halfWidth = e.kind === 'boss' ? 0.9 : e.kind === 'brute' ? 0.7 : 0.45
      if (e.x - halfWidth <= p.x + 0.4 && e.x + halfWidth >= prev) {
        p.hit.add(e)
        damageEnemy(e, p.damage, PROJECTILE_Y)
        if (p.hit.size >= p.pierce) break
      }
    }
    if (p.hit.size >= p.pierce || p.x - p.startX > p.range) {
      release(p)
      continue
    }
    Transform.getMutable(p.entity).position = Vector3.create(p.x, PROJECTILE_Y, LANE_Z[p.lane])
  }
}
