/**
 * Background Sound System for Neural Collapse
 * Plays ambient background sounds like police sirens and background music
 */

import { AudioSource, engine, Entity, Transform } from '@dcl/sdk/ecs'
import { Vector3 } from '@dcl/sdk/math'
import { getGamePhase, isPaused } from '../core/GameState'
import { playSound } from '../audio/SoundManager'

// Background music entity
let backgroundMusicEntity: Entity | null = null
let isMusicInitialized = false

/**
 * Initialize background music
 */
function initializeBackgroundMusic() {
  if (isMusicInitialized) return

  backgroundMusicEntity = engine.addEntity()
  Transform.create(backgroundMusicEntity, {
    parent: engine.CameraEntity,
    position: Vector3.Zero()
  })
  AudioSource.create(backgroundMusicEntity, {
    audioClipUrl: 'sounds/sound-track.mp3',
    playing: false,
    loop: true,
    volume: 0.15, // Keep it subtle so it doesn't overpower game sounds
    global: true
  })

  isMusicInitialized = true
  console.log('🎵 Background music initialized')
}

/**
 * Background music system
 * Starts/stops music based on game state
 */
export function backgroundMusicSystem(dt: number) {
  // Initialize if needed
  if (!isMusicInitialized) {
    initializeBackgroundMusic()
  }

  if (!backgroundMusicEntity) return

  const audioSource = AudioSource.getMutableOrNull(backgroundMusicEntity)
  if (!audioSource) return

  // Start music when game is playing
  if (getGamePhase() === 'playing' && !isPaused()) {
    if (!audioSource.playing) {
      audioSource.playing = true
      console.log('🎵 Background music started')
    }
  } else {
    // Stop music when not playing or paused
    if (audioSource.playing) {
      audioSource.playing = false
      console.log('🎵 Background music stopped')
    }
  }
}

/**
 * Background siren sound system
 * Randomly plays police sirens every 30-60 seconds
 */
export function backgroundSirenSoundSystem(dt: number) {
  if (getGamePhase() !== 'playing') return
  if (isPaused()) return

  // Randomly play a siren sound every 30-60 seconds
  // Math.random() < 0.001 means approximately once per 1000 frames
  // At 60fps, that's roughly every 16-17 seconds
  if (Math.random() < 0.001) {
    const sirenSound =
      Math.random() < 0.5 ? 'sounds/background/police-sirens1.mp3' : 'sounds/background/police-sirens2.mp3'
    playSound('backgroundSiren', sirenSound)
    console.log('Playing background police siren sound')
  }
}
