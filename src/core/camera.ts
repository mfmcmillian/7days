import { Entity, MainCamera, Transform, UiCanvasInformation, VirtualCamera, engine } from '@dcl/sdk/ecs'
import { Quaternion, Vector3 } from '@dcl/sdk/math'
import { CINEMA, HERO_X, STREET_CENTER_Z } from '../config/geometry'

/**
 * Fixed-camera rig with two poses:
 *  - `play`   : behind the hero, looking down the street (+X).
 *  - `cinema` : squared up to the video screen.
 *
 * VirtualCamera has no FOV control, so instead of changing the lens we move the
 * camera based on the canvas aspect ratio. Phones in portrait get a higher,
 * steeper view so all three lanes stay inside the narrow frame.
 */
export type CameraPose = 'play' | 'cinema'

/** Assumed vertical field of view of the explorer camera (degrees). */
const ASSUMED_VFOV = 60
const TAN_HALF_VFOV = Math.tan((ASSUMED_VFOV / 2) * (Math.PI / 180))

let playCam: Entity
let cinemaCam: Entity
let current: CameraPose = 'play'
let lastAspect = 0
let shakeTime = 0
let shakeStrength = 0
let basePlayPos = Vector3.create(HERO_X - 9, 7.5, STREET_CENTER_Z)
let basePlayLook = Vector3.create(HERO_X + 14, 0.6, STREET_CENTER_Z)

export function currentAspect(): number {
  const c = UiCanvasInformation.getOrNull(engine.RootEntity)
  if (!c || c.width <= 0 || c.height <= 0) return 16 / 9
  return c.width / c.height
}

export function isPortrait(): boolean {
  return currentAspect() < 1
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v
}

function layoutPlay(aspect: number): void {
  // t = 0 -> landscape (16:9 and wider), t = 1 -> tall portrait (~9:19.5)
  const t = clamp01((1.6 - aspect) / (1.6 - 0.46))
  const back = lerp(9, 11, t)
  const height = lerp(7.5, 17, t)
  const lookAhead = lerp(14, 9, t)
  basePlayPos = Vector3.create(HERO_X - back, height, STREET_CENTER_Z)
  basePlayLook = Vector3.create(HERO_X + lookAhead, 0.6, STREET_CENTER_Z)
  const tr = Transform.getMutable(playCam)
  tr.position = Vector3.clone(basePlayPos)
  tr.rotation = Quaternion.fromLookAt(basePlayPos, basePlayLook)
}

function layoutCinema(aspect: number): void {
  const fitHeight = (CINEMA.height / 2) / TAN_HALF_VFOV
  const fitWidth = (CINEMA.width / 2) / (TAN_HALF_VFOV * aspect)
  const distance = Math.max(fitHeight, fitWidth) * 1.08
  const pos = Vector3.create(CINEMA.x, CINEMA.y, CINEMA.z - distance)
  const tr = Transform.getMutable(cinemaCam)
  tr.position = pos
  tr.rotation = Quaternion.fromLookAt(pos, Vector3.create(CINEMA.x, CINEMA.y, CINEMA.z))
}

export function installCamera(): void {
  playCam = engine.addEntity()
  Transform.create(playCam, { position: Vector3.clone(basePlayPos) })
  VirtualCamera.create(playCam, {
    defaultTransition: { transitionMode: VirtualCamera.Transition.Time(0.8) }
  })

  cinemaCam = engine.addEntity()
  Transform.create(cinemaCam, { position: Vector3.create(CINEMA.x, CINEMA.y, CINEMA.z - 10) })
  VirtualCamera.create(cinemaCam, {
    defaultTransition: { transitionMode: VirtualCamera.Transition.Time(0.8) }
  })

  const aspect = currentAspect()
  layoutPlay(aspect)
  layoutCinema(aspect)
  lastAspect = aspect
  setCameraPose('cinema')

  engine.addSystem(cameraSystem, 50, 'camera-rig')
}

export function setCameraPose(pose: CameraPose): void {
  current = pose
  MainCamera.createOrReplace(engine.CameraEntity, {
    virtualCameraEntity: pose === 'play' ? playCam : cinemaCam
  })
}

export function getCameraPose(): CameraPose {
  return current
}

export function shakeCamera(strength = 0.25, seconds = 0.25): void {
  shakeStrength = Math.max(shakeStrength, strength)
  shakeTime = Math.max(shakeTime, seconds)
}

let aspectPoll = 0
function cameraSystem(dt: number): void {
  aspectPoll += dt
  if (aspectPoll > 0.4) {
    aspectPoll = 0
    const aspect = currentAspect()
    if (Math.abs(aspect - lastAspect) > 0.02) {
      lastAspect = aspect
      layoutPlay(aspect)
      layoutCinema(aspect)
    }
  }

  if (shakeTime > 0) {
    shakeTime -= dt
    const tr = Transform.getMutable(playCam)
    const k = shakeStrength * Math.max(shakeTime, 0)
    tr.position = Vector3.create(
      basePlayPos.x + (Math.random() - 0.5) * k,
      basePlayPos.y + (Math.random() - 0.5) * k,
      basePlayPos.z + (Math.random() - 0.5) * k
    )
    if (shakeTime <= 0) {
      tr.position = Vector3.clone(basePlayPos)
      shakeStrength = 0
    }
  }
}
