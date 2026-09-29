import { Entity, Material, MeshRenderer, Transform, VideoPlayer, VideoState, engine, videoEventsSystem } from '@dcl/sdk/ecs'
import { Color3, Color4, Quaternion, Vector3 } from '@dcl/sdk/math'
import { CINEMA } from '../config/geometry'
import { plane, rgb } from './props'

/**
 * A 16:9 screen floating above the city. The cinema camera pose looks straight
 * at it; a black backdrop behind it keeps the frame clean at any aspect ratio.
 */
let screen: Entity | null = null
let onEnded: (() => void) | null = null
let ended = false
let watchdog = 0
let watchdogLimit = 0
let active = false

export function buildCinema(): void {
  const facing = Quaternion.fromEulerDegrees(0, 180, 0)
  plane(
    Vector3.create(CINEMA.x, CINEMA.y, CINEMA.z + 0.6),
    Vector3.create(70, 44, 1),
    facing,
    rgb(0, 0, 0)
  )
  screen = engine.addEntity()
  Transform.create(screen, {
    position: Vector3.create(CINEMA.x, CINEMA.y, CINEMA.z),
    rotation: facing,
    scale: Vector3.create(CINEMA.width, CINEMA.height, 1)
  })
  MeshRenderer.setPlane(screen)
  Material.setPbrMaterial(screen, { albedoColor: Color4.Black(), roughness: 1, metallic: 0 })

  videoEventsSystem.registerVideoEventsEntity(screen, (ev) => {
    if (!active || ended) return
    if (ev.state === VideoState.VS_ERROR) finish()
    if (ev.state === VideoState.VS_READY && ev.videoLength > 0 && ev.currentOffset >= ev.videoLength - 0.6) finish()
  })

  engine.addSystem((dt) => {
    if (!active || ended || watchdogLimit <= 0) return
    watchdog += dt
    if (watchdog >= watchdogLimit) finish()
  }, 200, 'cinema-watchdog')
}

export interface PlayOptions {
  loop?: boolean
  volume?: number
  /** Seconds before we give up waiting for the stream and continue. 0 = never. */
  timeout?: number
  onEnded?: () => void
}

export function playVideo(src: string, opts: PlayOptions = {}): void {
  if (!screen) return
  active = true
  ended = false
  watchdog = 0
  watchdogLimit = opts.timeout ?? 0
  onEnded = opts.onEnded ?? null
  VideoPlayer.createOrReplace(screen, { src, playing: true, loop: opts.loop ?? false, volume: opts.volume ?? 1 })
  const tex = Material.Texture.Video({ videoPlayerEntity: screen })
  Material.setPbrMaterial(screen, {
    texture: tex,
    emissiveTexture: tex,
    emissiveColor: Color3.White(),
    emissiveIntensity: 0.9,
    roughness: 1,
    metallic: 0,
    specularIntensity: 0
  })
}

export function stopVideo(): void {
  active = false
  ended = true
  onEnded = null
  if (screen && VideoPlayer.has(screen)) {
    const v = VideoPlayer.getMutable(screen)
    v.playing = false
  }
  if (screen) Material.setPbrMaterial(screen, { albedoColor: Color4.Black(), roughness: 1, metallic: 0 })
}

export function setVideoVolume(volume: number): void {
  if (screen && VideoPlayer.has(screen)) VideoPlayer.getMutable(screen).volume = volume
}

function finish(): void {
  if (ended) return
  ended = true
  const cb = onEnded
  onEnded = null
  if (cb) cb()
}

/** Skip button handler: same path as a natural end. */
export function skipVideo(): void {
  finish()
}
