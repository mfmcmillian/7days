import { Entity, MeshRenderer, Transform, engine } from '@dcl/sdk/ecs'
import { Vector3 } from '@dcl/sdk/math'
import { rgb, tintEmissive } from '../world/props'

interface Spark {
  entity: Entity
  life: number
  maxLife: number
  size: number
  active: boolean
}

const POOL = 24
const sparks: Spark[] = []
const PARK = Vector3.create(2, -22, 4)

export function installVfx(): void {
  for (let i = 0; i < POOL; i++) {
    const entity = engine.addEntity()
    Transform.create(entity, { position: Vector3.clone(PARK), scale: Vector3.create(0.001, 0.001, 0.001) })
    MeshRenderer.setSphere(entity)
    tintEmissive(entity, rgb(1, 0.6, 0.3), 4)
    sparks.push({ entity, life: 0, maxLife: 0.2, size: 0.3, active: false })
  }
  engine.addSystem(vfxSystem, 120, 'vfx')
}

export function spawnHitSpark(position: Vector3, big = false): void {
  let s = sparks.find((x) => !x.active)
  if (!s) s = sparks[0]
  s.active = true
  s.maxLife = big ? 0.28 : 0.18
  s.life = s.maxLife
  s.size = big ? 0.75 : 0.42
  const t = Transform.getMutable(s.entity)
  t.position = Vector3.create(position.x, position.y + (Math.random() - 0.5) * 0.4, position.z + (Math.random() - 0.5) * 0.4)
  t.scale = Vector3.create(0.05, 0.05, 0.05)
  tintEmissive(s.entity, big ? rgb(1, 0.35, 0.15) : rgb(1, 0.7, 0.35), 5)
}

export function spawnMuzzleFlash(position: Vector3, color: [number, number, number]): void {
  let s = sparks.find((x) => !x.active)
  if (!s) return
  s.active = true
  s.maxLife = 0.07
  s.life = s.maxLife
  s.size = 0.32
  const t = Transform.getMutable(s.entity)
  t.position = Vector3.clone(position)
  t.scale = Vector3.create(0.2, 0.2, 0.2)
  tintEmissive(s.entity, rgb(color[0], color[1], color[2]), 6)
}

function vfxSystem(dt: number): void {
  for (const s of sparks) {
    if (!s.active) continue
    s.life -= dt
    const t = Transform.getMutable(s.entity)
    if (s.life <= 0) {
      s.active = false
      t.position = Vector3.clone(PARK)
      t.scale = Vector3.create(0.001, 0.001, 0.001)
      continue
    }
    const k = 1 - s.life / s.maxLife
    const size = s.size * (0.4 + k)
    t.scale = Vector3.create(size, size * (1 - k * 0.6), size)
  }
}
