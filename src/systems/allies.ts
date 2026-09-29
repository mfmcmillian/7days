import { AvatarShape, Entity, Transform, engine } from '@dcl/sdk/ecs'
import { Quaternion, Vector3 } from '@dcl/sdk/math'
import { ALLIES } from '../config/balance'
import { ALLY_X, LANE_Z } from '../config/geometry'
import { playSfx } from '../core/audio'
import { isPlaying, state } from '../core/state'
import { attachModel, playClip } from '../world/props'
import { nearestEnemyInLane } from './enemies'
import { fireProjectile } from './projectiles'
import { spawnMuzzleFlash } from './vfx'

interface Ally {
  entity: Entity
  lane: number
  zOffset: number
  cooldown: number
  visible: boolean
  usingAvatar: boolean
}

const PARK = Vector3.create(8, -28, 8)
const SLOTS: Array<{ lane: number; zOffset: number }> = [
  { lane: 0, zOffset: 0.6 },
  { lane: 2, zOffset: -0.6 },
  { lane: 1, zOffset: 1.4 },
  { lane: 1, zOffset: -1.4 }
]
const NAMES = ['MARA', 'JONES', 'KIT', 'OSEI']
const allies: Ally[] = []

export function installAllies(): void {
  for (let i = 0; i < ALLIES.max; i++) {
    const entity = engine.addEntity()
    Transform.create(entity, { position: Vector3.clone(PARK), rotation: Quaternion.fromEulerDegrees(0, 90, 0) })
    let usingAvatar = false
    if (!attachModel(entity, 'survivor')) {
      usingAvatar = true
      AvatarShape.create(entity, { id: 'survivor-' + i, name: NAMES[i], wearables: [], emotes: [] })
    }
    allies.push({ entity, lane: SLOTS[i].lane, zOffset: SLOTS[i].zOffset, cooldown: Math.random(), visible: false, usingAvatar })
  }
  engine.addSystem(allySystem, 85, 'allies')
}

/** Show exactly `count` survivors behind the barricade. */
export function syncAllies(): void {
  const count = Math.min(ALLIES.max, state.allies)
  for (let i = 0; i < allies.length; i++) {
    const a = allies[i]
    const show = i < count
    if (show === a.visible) continue
    a.visible = show
    const t = Transform.getMutable(a.entity)
    t.position = show ? Vector3.create(ALLY_X + (i % 2) * 0.8, 0, LANE_Z[a.lane] + a.zOffset) : Vector3.clone(PARK)
  }
}

function allySystem(dt: number): void {
  if (!isPlaying()) return
  for (const a of allies) {
    if (!a.visible) continue
    a.cooldown -= dt
    if (a.cooldown > 0) continue
    const target = nearestEnemyInLane(a.lane, ALLY_X + ALLIES.range)
    if (!target) continue
    const fired = fireProjectile({
      lane: a.lane,
      startX: ALLY_X + 0.8,
      speed: ALLIES.projectileSpeed,
      damage: ALLIES.damage,
      pierce: 1,
      range: ALLIES.range,
      color: [0.8, 0.9, 1]
    })
    if (!fired) continue
    a.cooldown = 1 / ALLIES.fireRate + Math.random() * 0.25
    playSfx('shot', 0.12)
    spawnMuzzleFlash(Vector3.create(ALLY_X + 0.8, 1.3, LANE_Z[a.lane] + a.zOffset), [0.8, 0.9, 1])
    if (!a.usingAvatar) playClip(a.entity, 'survivor', 'attack', true)
  }
}
