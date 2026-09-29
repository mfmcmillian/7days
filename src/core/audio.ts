import { AudioSource, Entity, Transform, engine } from '@dcl/sdk/ecs'
import { Vector3 } from '@dcl/sdk/math'
import { MUSIC, NARRATION, SFX, SfxId } from '../config/media'
import { state } from './state'

/**
 * Small global audio layer. SFX go through a round-robin pool of non-spatial
 * AudioSources so overlapping shots don't cut each other off.
 */
const SFX_POOL_SIZE = 10
const sfxPool: Entity[] = []
let sfxCursor = 0
let musicEntity: Entity | null = null
let ambienceEntity: Entity | null = null
let narrationEntity: Entity | null = null

const DEFAULT_GAIN: Partial<Record<SfxId, number>> = {
  shot: 0.35,
  'shotgun-shot': 0.5,
  attack: 0.5,
  die: 0.6,
  growl: 0.45,
  growl2: 0.45,
  longGrowl: 0.5,
  tink: 0.6,
  thunk: 0.7
}

function makeSource(): Entity {
  const e = engine.addEntity()
  Transform.create(e, { position: Vector3.create(40, 2, 31) })
  return e
}

export function installAudio(): void {
  for (let i = 0; i < SFX_POOL_SIZE; i++) sfxPool.push(makeSource())
  musicEntity = makeSource()
  ambienceEntity = makeSource()
  narrationEntity = makeSource()
}

function gain(v: number): number {
  return state.muted ? 0 : v
}

export function playSfx(id: SfxId, volume?: number): void {
  if (!state.audioUnlocked || sfxPool.length === 0) return
  const e = sfxPool[sfxCursor]
  sfxCursor = (sfxCursor + 1) % sfxPool.length
  AudioSource.createOrReplace(e, {
    audioClipUrl: SFX[id],
    playing: true,
    loop: false,
    volume: gain(volume ?? DEFAULT_GAIN[id] ?? 0.8),
    global: true
  })
}

export function playMusic(volume = 0.35): void {
  if (!musicEntity || !state.audioUnlocked) return
  AudioSource.createOrReplace(musicEntity, {
    audioClipUrl: MUSIC.main,
    playing: true,
    loop: true,
    volume: gain(volume),
    global: true
  })
}

export function setMusicVolume(volume: number): void {
  if (!musicEntity || !AudioSource.has(musicEntity)) return
  AudioSource.getMutable(musicEntity).volume = gain(volume)
}

export function stopMusic(): void {
  if (musicEntity && AudioSource.has(musicEntity)) AudioSource.getMutable(musicEntity).playing = false
}

export function playAmbience(index: number): void {
  if (!ambienceEntity || !state.audioUnlocked) return
  const src = MUSIC.sirens[index % MUSIC.sirens.length]
  AudioSource.createOrReplace(ambienceEntity, {
    audioClipUrl: src,
    playing: true,
    loop: true,
    volume: gain(0.18),
    global: true
  })
}

export function stopAmbience(): void {
  if (ambienceEntity && AudioSource.has(ambienceEntity)) AudioSource.getMutable(ambienceEntity).playing = false
}

export function playNarration(night: number): void {
  if (!narrationEntity || !state.audioUnlocked) return
  const src = NARRATION[(night - 1) % NARRATION.length]
  AudioSource.createOrReplace(narrationEntity, {
    audioClipUrl: src,
    playing: true,
    loop: false,
    volume: gain(0.9),
    global: true
  })
}

export function stopNarration(): void {
  if (narrationEntity && AudioSource.has(narrationEntity)) AudioSource.getMutable(narrationEntity).playing = false
}

/** Re-apply volumes after a mute toggle. */
export function applyMute(): void {
  const all = [musicEntity, ambienceEntity, narrationEntity]
  for (const e of all) {
    if (e && AudioSource.has(e)) {
      const a = AudioSource.getMutable(e)
      a.volume = state.muted ? 0 : e === musicEntity ? 0.35 : e === ambienceEntity ? 0.18 : 0.9
    }
  }
}
