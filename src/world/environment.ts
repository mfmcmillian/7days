import { AvatarModifierArea, AvatarModifierType, Entity, GltfContainer, Transform, engine } from '@dcl/sdk/ecs'
import { Quaternion, Vector3 } from '@dcl/sdk/math'
import { art } from '../art/catalog'
import {
  BARRICADE_X,
  HERO_X,
  LANE_Z,
  SCENE,
  SPAWN_X,
  STREET_CENTER_Z,
  STREET_WIDTH,
  STREET_Z_MAX,
  STREET_Z_MIN
} from '../config/geometry'
import { box, glow, plane, rgb } from './props'

const ASPHALT = rgb(0.075, 0.075, 0.085)
const CURB = rgb(0.16, 0.16, 0.17)
const GROUND = rgb(0.045, 0.05, 0.045)
const LANE_PAINT = rgb(0.32, 0.3, 0.22)
const BUILDING_A = rgb(0.09, 0.09, 0.11)
const BUILDING_B = rgb(0.12, 0.1, 0.1)
const WINDOW_WARM = rgb(1.0, 0.65, 0.25)
const WINDOW_COLD = rgb(0.45, 0.7, 1.0)
const SODIUM = rgb(1.0, 0.6, 0.2)

let seed = 1337
function rand(): number {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff
  return seed / 0x7fffffff
}

function flatRotation(): Quaternion {
  return Quaternion.fromEulerDegrees(90, 0, 0)
}

function buildGroundAndStreet(): void {
  // Ground is a single dark plane; the street sits 2cm above it.
  plane(
    Vector3.create(SCENE.width / 2, 0.0, SCENE.depth / 2),
    Vector3.create(SCENE.width, SCENE.depth, 1),
    flatRotation(),
    GROUND
  )
  if (art('street').src) {
    const e = engine.addEntity()
    Transform.create(e, { position: Vector3.create(SCENE.width / 2, 0, STREET_CENTER_Z) })
    GltfContainer.create(e, { src: art('street').src as string })
    return
  }
  plane(
    Vector3.create(SCENE.width / 2, 0.02, STREET_CENTER_Z),
    Vector3.create(SCENE.width, STREET_WIDTH, 1),
    flatRotation(),
    ASPHALT
  )
  // Curbs
  box(Vector3.create(SCENE.width / 2, 0.1, STREET_Z_MIN - 0.4), Vector3.create(SCENE.width, 0.2, 0.8), CURB)
  box(Vector3.create(SCENE.width / 2, 0.1, STREET_Z_MAX + 0.4), Vector3.create(SCENE.width, 0.2, 0.8), CURB)
  // Sidewalks
  box(Vector3.create(SCENE.width / 2, 0.08, STREET_Z_MIN - 3.4), Vector3.create(SCENE.width, 0.16, 5.2), rgb(0.13, 0.13, 0.135))
  box(Vector3.create(SCENE.width / 2, 0.08, STREET_Z_MAX + 3.4), Vector3.create(SCENE.width, 0.16, 5.2), rgb(0.13, 0.13, 0.135))
  // Faded lane paint between lanes (dashes)
  for (let i = 0; i < LANE_Z.length - 1; i++) {
    const z = (LANE_Z[i] + LANE_Z[i + 1]) / 2
    for (let x = 6; x < SCENE.width - 2; x += 4) {
      plane(Vector3.create(x, 0.035, z), Vector3.create(1.8, 0.14, 1), flatRotation(), LANE_PAINT)
    }
  }
  // Solid stop line where the barricade stands
  plane(Vector3.create(BARRICADE_X - 1.2, 0.035, STREET_CENTER_Z), Vector3.create(0.3, STREET_WIDTH - 1, 1), flatRotation(), LANE_PAINT)
}

function building(x: number, z: number, w: number, d: number, h: number, warm: boolean, variant: 'a' | 'b'): void {
  const role = variant === 'a' ? 'building_a' : 'building_b'
  if (art(role).src) {
    const e = engine.addEntity()
    Transform.create(e, {
      position: Vector3.create(x, 0, z),
      rotation: Quaternion.fromEulerDegrees(0, z < STREET_CENTER_Z ? 0 : 180, 0)
    })
    GltfContainer.create(e, { src: art(role).src as string })
    return
  }
  const body = box(Vector3.create(x, h / 2, z), Vector3.create(w, h, d), variant === 'a' ? BUILDING_A : BUILDING_B, {
    roughness: 1
  })
  // A handful of lit windows on the street-facing side.
  const facingZ = z < STREET_CENTER_Z ? z + d / 2 + 0.03 : z - d / 2 - 0.03
  const rot = z < STREET_CENTER_Z ? Quaternion.fromEulerDegrees(0, 0, 0) : Quaternion.fromEulerDegrees(0, 180, 0)
  const floors = Math.max(1, Math.floor(h / 3.2))
  const cols = Math.max(1, Math.floor(w / 2.6))
  for (let f = 0; f < floors; f++) {
    for (let c = 0; c < cols; c++) {
      if (rand() > 0.28) continue
      const wx = x - w / 2 + 1.3 + c * 2.6
      const wy = 1.8 + f * 3.2
      const col = rand() > 0.5 === warm ? WINDOW_WARM : WINDOW_COLD
      plane(Vector3.create(wx, wy, facingZ), Vector3.create(1.1, 1.4, 1), rot, col, {
        emissive: col,
        emissiveIntensity: 2 + rand() * 2
      })
    }
  }
  void body
}

function buildSkyline(): void {
  // Two rows of buildings flanking the street. Heights climb toward the spawn end.
  const rowNear = STREET_Z_MIN - 11
  const rowFar = STREET_Z_MAX + 11
  let x = 4
  let i = 0
  while (x < SCENE.width - 2) {
    const w = 7 + rand() * 6
    const h = 9 + rand() * 12 + (x / SCENE.width) * 8
    const d = 10
    building(x + w / 2, rowNear, w, d, h, i % 2 === 0, i % 3 === 0 ? 'b' : 'a')
    const w2 = 7 + rand() * 6
    const h2 = 9 + rand() * 12 + (x / SCENE.width) * 8
    building(x + w2 / 2, rowFar, w2, d, h2, i % 2 === 1, i % 3 === 1 ? 'b' : 'a')
    x += Math.max(w, w2) + 1.5
    i++
  }
}

function streetlight(x: number, z: number, lit: boolean): void {
  if (art('streetlight').src) {
    const e = engine.addEntity()
    Transform.create(e, { position: Vector3.create(x, 0, z) })
    GltfContainer.create(e, { src: art('streetlight').src as string })
    return
  }
  const post = rgb(0.2, 0.2, 0.22)
  box(Vector3.create(x, 2.6, z), Vector3.create(0.18, 5.2, 0.18), post)
  const armDir = z < STREET_CENTER_Z ? 1 : -1
  box(Vector3.create(x, 5.2, z + armDir * 0.9), Vector3.create(0.14, 0.14, 1.8), post)
  if (lit) {
    glow(Vector3.create(x, 5.05, z + armDir * 1.7), Vector3.create(0.5, 0.25, 0.5), SODIUM, 4)
    // Soft pool of light on the road
    plane(
      Vector3.create(x, 0.04, z + armDir * 3.2),
      Vector3.create(5, 3.5, 1),
      flatRotation(),
      rgb(0.16, 0.12, 0.08),
      { emissive: rgb(0.5, 0.3, 0.1), emissiveIntensity: 0.6 }
    )
  }
}

function wreck(x: number, z: number, yaw: number, color: { r: number; g: number; b: number }): void {
  if (art('wreck').src) {
    const e = engine.addEntity()
    Transform.create(e, { position: Vector3.create(x, 0, z), rotation: Quaternion.fromEulerDegrees(0, yaw, 0) })
    GltfContainer.create(e, { src: art('wreck').src as string })
    return
  }
  const rot = Quaternion.fromEulerDegrees(0, yaw, 0)
  const root = engine.addEntity()
  Transform.create(root, { position: Vector3.create(x, 0, z), rotation: rot })
  box(Vector3.create(0, 0.55, 0), Vector3.create(4.2, 0.9, 1.9), color, { parent: root })
  box(Vector3.create(-0.3, 1.25, 0), Vector3.create(2.2, 0.6, 1.7), rgb(0.06, 0.06, 0.07), { parent: root })
  box(Vector3.create(1.5, 0.3, 1.0), Vector3.create(0.7, 0.6, 0.3), rgb(0.03, 0.03, 0.03), { parent: root })
  box(Vector3.create(-1.5, 0.3, -1.0), Vector3.create(0.7, 0.6, 0.3), rgb(0.03, 0.03, 0.03), { parent: root })
}

function buildStreetDressing(): void {
  for (let x = 10; x <= SPAWN_X; x += 12) {
    streetlight(x, STREET_Z_MIN - 1.2, (x / 12) % 3 !== 1)
    streetlight(x + 6, STREET_Z_MAX + 1.2, (x / 12) % 4 !== 2)
  }
  wreck(46, STREET_Z_MAX + 3.6, 18, rgb(0.35, 0.12, 0.1))
  wreck(61, STREET_Z_MIN - 3.4, -12, rgb(0.14, 0.2, 0.32))
  wreck(HERO_X - 6, STREET_Z_MIN - 3.8, 80, rgb(0.28, 0.28, 0.3))

  // Fires burning far down the street: cheap ambience that sells "the city is burning".
  for (const [fx, fz] of [
    [SPAWN_X + 2, STREET_Z_MAX + 6],
    [SPAWN_X - 12, STREET_Z_MIN - 6.5]
  ]) {
    glow(Vector3.create(fx, 0.8, fz), Vector3.create(1.6, 1.2, 1.6), rgb(1.0, 0.45, 0.1), 5)
    glow(Vector3.create(fx, 1.5, fz), Vector3.create(0.9, 1.4, 0.9), rgb(1.0, 0.75, 0.2), 6)
  }
}

/** Hide every real avatar (including the player's own) across the whole scene. */
function hideAvatars(): void {
  const e = engine.addEntity()
  Transform.create(e, { position: Vector3.create(SCENE.width / 2, SCENE.height / 2, SCENE.depth / 2) })
  AvatarModifierArea.create(e, {
    area: Vector3.create(SCENE.width, SCENE.height, SCENE.depth),
    modifiers: [AvatarModifierType.AMT_HIDE_AVATARS, AvatarModifierType.AMT_DISABLE_PASSPORTS],
    excludeIds: []
  })
}

export function buildEnvironment(): void {
  buildGroundAndStreet()
  buildSkyline()
  buildStreetDressing()
  hideAvatars()
}

/** Marker lights that show lane spawn positions during the night. */
export function buildSpawnMarkers(): Entity[] {
  const markers: Entity[] = []
  for (const z of LANE_Z) {
    markers.push(
      plane(Vector3.create(SPAWN_X, 0.045, z), Vector3.create(3, 3.6, 1), flatRotation(), rgb(0.25, 0.04, 0.04), {
        emissive: rgb(1, 0.1, 0.1),
        emissiveIntensity: 1.2
      })
    )
  }
  return markers
}
