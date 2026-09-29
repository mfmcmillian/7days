import {
  Animator,
  Entity,
  GltfContainer,
  Material,
  MaterialTransparencyMode,
  MeshRenderer,
  Transform,
  TransformType,
  engine
} from '@dcl/sdk/ecs'
import { Color3, Color4, Quaternion, Vector3 } from '@dcl/sdk/math'
import { ArtRole, ModelEntry, art } from '../art/catalog'

export interface Rgb {
  r: number
  g: number
  b: number
}

export function rgb(r: number, g: number, b: number): Rgb {
  return { r, g, b }
}

export function box(
  position: Vector3,
  scale: Vector3,
  color: Rgb,
  opts: { emissive?: Rgb; emissiveIntensity?: number; rotation?: Quaternion; parent?: Entity; roughness?: number } = {}
): Entity {
  const e = engine.addEntity()
  const t: Partial<TransformType> = { position, scale }
  if (opts.rotation) t.rotation = opts.rotation
  if (opts.parent !== undefined) t.parent = opts.parent
  Transform.create(e, t)
  MeshRenderer.setBox(e)
  Material.setPbrMaterial(e, {
    albedoColor: Color4.create(color.r, color.g, color.b, 1),
    roughness: opts.roughness ?? 0.9,
    metallic: 0,
    emissiveColor: opts.emissive ? Color3.create(opts.emissive.r, opts.emissive.g, opts.emissive.b) : undefined,
    emissiveIntensity: opts.emissive ? opts.emissiveIntensity ?? 1.5 : undefined
  })
  return e
}

export function plane(
  position: Vector3,
  scale: Vector3,
  rotation: Quaternion,
  color: Rgb,
  opts: { emissive?: Rgb; emissiveIntensity?: number; parent?: Entity } = {}
): Entity {
  const e = engine.addEntity()
  const t: Partial<TransformType> = { position, scale, rotation }
  if (opts.parent !== undefined) t.parent = opts.parent
  Transform.create(e, t)
  MeshRenderer.setPlane(e)
  Material.setPbrMaterial(e, {
    albedoColor: Color4.create(color.r, color.g, color.b, 1),
    roughness: 1,
    metallic: 0,
    emissiveColor: opts.emissive ? Color3.create(opts.emissive.r, opts.emissive.g, opts.emissive.b) : undefined,
    emissiveIntensity: opts.emissive ? opts.emissiveIntensity ?? 1.5 : undefined
  })
  return e
}

export function glow(position: Vector3, scale: Vector3, color: Rgb, intensity = 3, parent?: Entity): Entity {
  const e = engine.addEntity()
  const t: Partial<TransformType> = { position, scale }
  if (parent !== undefined) t.parent = parent
  Transform.create(e, t)
  MeshRenderer.setSphere(e)
  Material.setPbrMaterial(e, {
    albedoColor: Color4.create(color.r, color.g, color.b, 1),
    emissiveColor: Color3.create(color.r, color.g, color.b),
    emissiveIntensity: intensity,
    roughness: 1,
    metallic: 0
  })
  return e
}

export function tintEmissive(e: Entity, color: Rgb, intensity: number, alpha = 1): void {
  Material.setPbrMaterial(e, {
    albedoColor: Color4.create(color.r, color.g, color.b, alpha),
    emissiveColor: Color3.create(color.r, color.g, color.b),
    emissiveIntensity: intensity,
    roughness: 1,
    metallic: 0,
    transparencyMode: alpha < 1 ? MaterialTransparencyMode.MTM_ALPHA_BLEND : MaterialTransparencyMode.MTM_OPAQUE
  })
}

/**
 * Attach a catalog model to `entity`. Returns false when the role has no GLB
 * so the caller can build a placeholder instead.
 */
export function attachModel(entity: Entity, role: ArtRole, extraYaw = 0): boolean {
  const entry: ModelEntry = art(role)
  if (!entry.src) return false
  const t = Transform.getMutableOrNull(entity)
  if (t) {
    t.scale = Vector3.create(entry.scale, entry.scale, entry.scale)
    t.rotation = Quaternion.fromEulerDegrees(0, entry.yaw + extraYaw, 0)
    t.position = Vector3.create(t.position.x, t.position.y + entry.yOffset, t.position.z)
  }
  GltfContainer.create(entity, { src: entry.src })
  if (entry.clips) {
    const states = Object.entries(entry.clips)
      .filter(([, clip]) => !!clip)
      .map(([key, clip]) => ({ clip: clip as string, playing: key === 'idle', loop: key !== 'die' && key !== 'attack' }))
    if (states.length > 0) Animator.create(entity, { states })
  }
  return true
}

export function playClip(entity: Entity, role: ArtRole, key: keyof NonNullable<ModelEntry['clips']>, reset = false): void {
  const entry = art(role)
  const clip = entry.clips?.[key]
  if (!clip || !Animator.has(entity)) return
  Animator.playSingleAnimation(entity, clip, reset)
}

export function remove(entity: Entity | null | undefined): void {
  if (entity === null || entity === undefined) return
  engine.removeEntity(entity)
}
