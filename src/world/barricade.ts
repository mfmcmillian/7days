import { Entity, GltfContainer, Transform, engine } from '@dcl/sdk/ecs'
import { Vector3 } from '@dcl/sdk/math'
import { art } from '../art/catalog'
import { BARRICADE_X, LANE_Z, STREET_Z_MAX, STREET_Z_MIN } from '../config/geometry'
import { box, rgb } from './props'

const SANDBAG = rgb(0.36, 0.32, 0.22)
const SANDBAG_DARK = rgb(0.28, 0.25, 0.17)
const STEEL = rgb(0.2, 0.21, 0.23)

/** Rows of sandbags, bottom to top. Higher rows disappear first as the wall takes damage. */
const rows: Entity[][] = [[], [], []]
let built = false
let lastFraction = -1

export function buildBarricade(): void {
  if (built) return
  built = true

  if (art('barricade').src) {
    for (const z of LANE_Z) {
      const e = engine.addEntity()
      Transform.create(e, { position: Vector3.create(BARRICADE_X, 0, z) })
      GltfContainer.create(e, { src: art('barricade').src as string })
      rows[0].push(e)
    }
    return
  }

  // Sandbag wall across the full street width, three courses high.
  const span = STREET_Z_MAX - STREET_Z_MIN
  const bagLen = 1.1
  const count = Math.floor(span / bagLen)
  for (let row = 0; row < 3; row++) {
    const y = 0.28 + row * 0.5
    const offset = row % 2 === 0 ? 0 : bagLen / 2
    for (let i = 0; i < count; i++) {
      const z = STREET_Z_MIN + bagLen / 2 + i * bagLen + offset
      if (z > STREET_Z_MAX - 0.3) continue
      const e = box(
        Vector3.create(BARRICADE_X + (row === 1 ? 0.05 : 0), y, z),
        Vector3.create(0.9, 0.5, bagLen * 0.96),
        (i + row) % 2 === 0 ? SANDBAG : SANDBAG_DARK,
        { roughness: 1 }
      )
      rows[row].push(e)
    }
  }
  // Steel posts on each lane boundary so the wall reads as deliberate, not a pile.
  for (let i = 0; i < LANE_Z.length - 1; i++) {
    const z = (LANE_Z[i] + LANE_Z[i + 1]) / 2
    box(Vector3.create(BARRICADE_X - 0.6, 0.9, z), Vector3.create(0.16, 1.8, 0.16), STEEL)
  }
  box(Vector3.create(BARRICADE_X - 0.6, 0.9, STREET_Z_MIN + 0.3), Vector3.create(0.16, 1.8, 0.16), STEEL)
  box(Vector3.create(BARRICADE_X - 0.6, 0.9, STREET_Z_MAX - 0.3), Vector3.create(0.16, 1.8, 0.16), STEEL)
}

/** Reflect the wall's health (0..1) in its geometry. */
export function updateBarricadeVisual(fraction: number): void {
  if (!built || art('barricade').src) return
  const f = Math.max(0, Math.min(1, fraction))
  if (Math.abs(f - lastFraction) < 0.01) return
  lastFraction = f
  // Row 2 (top) visible above 66%, row 1 above 33%, row 0 above 0%. Within a row, bags vanish left to right.
  for (let row = 0; row < 3; row++) {
    const rowStart = row / 3
    const rowFrac = Math.max(0, Math.min(1, (f - rowStart) / (1 / 3)))
    const bags = rows[row]
    const visibleCount = Math.round(rowFrac * bags.length)
    for (let i = 0; i < bags.length; i++) {
      const t = Transform.getMutableOrNull(bags[i])
      if (!t) continue
      const show = i < visibleCount
      const isShown = t.scale.x > 0.01
      if (show && !isShown) t.scale = Vector3.create(0.9, 0.5, 1.056)
      else if (!show && isShown) t.scale = Vector3.create(0.0001, 0.0001, 0.0001)
    }
  }
}
