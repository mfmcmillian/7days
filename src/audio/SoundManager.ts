/**
 * Sound Management System for Neural Collapse
 * Handles all game audio through sound pools
 */

import { engine, Entity, Transform, AudioSource } from '@dcl/sdk/ecs'
import { Vector3 } from '@dcl/sdk/math'
import { SOUND_POOL_SIZES } from '../utils/constants'
import type { SoundPool } from '../utils/types'

// Sound pools
const soundPools: Map<string, SoundPool> = new Map()

// Pause sound entity (special case)
export const pauseSoundEntity = engine.addEntity()

// Zombie sound pools (manual arrays like in original)
export const zombieAttackSoundPool: Entity[] = []
export const zombieDeathSoundPool: Entity[] = []
let currentZombieAttackSoundIndex = 0
let currentZombieDeathSoundIndex = 0
const zombieAttackSoundPoolSize = 3
const zombieDeathSoundPoolSize = 3

/**
 * Initialize all sound pools
 */
export function initializeSoundPools() {
  // Shot sound pool
  createSoundPool('shot', SOUND_POOL_SIZES.shot, 'sounds/shot.mp3', 0.02, true) // Much quieter for side-scrolling mode

  // Shot fail sound pool
  createSoundPool('shotFail', SOUND_POOL_SIZES.shotFail, 'sounds/shotFail.mp3', 0.3, true)

  // Create zombie attack sound pool (manual, like original)
  for (let i = 0; i < zombieAttackSoundPoolSize; i++) {
    const soundEntity = engine.addEntity()
    Transform.create(soundEntity, {
      position: Vector3.Zero()
    })
    AudioSource.create(soundEntity, {
      audioClipUrl: 'sounds/zombie-sounds/zombie-growl.mp3',
      playing: false,
      volume: 0.3,
      global: false // Positional
    })
    zombieAttackSoundPool.push(soundEntity)
  }
  console.log('Zombie attack sound pool created')

  // Create zombie death sound pool (manual, like original)
  for (let i = 0; i < zombieDeathSoundPoolSize; i++) {
    const soundEntity = engine.addEntity()
    Transform.create(soundEntity, {
      position: Vector3.Zero()
    })
    AudioSource.create(soundEntity, {
      audioClipUrl: 'sounds/zombie-sounds/zombie-growl2.mp3',
      playing: false,
      volume: 0.3,
      global: false // Positional
    })
    zombieDeathSoundPool.push(soundEntity)
  }
  console.log('Zombie death sound pool created')

  // Reload sound pool
  createSoundPool('reload', SOUND_POOL_SIZES.reload, 'sounds/zombie-sounds/pistol-reload.mp3', 0.4, true)

  // Shotgun shot sound pool
  createSoundPool('shotgunShot', SOUND_POOL_SIZES.shotgunShot, 'sounds/zombie-sounds/shotgun-shot.mp3', 0.4, true)

  // Weapon switch sound pool
  createSoundPool('weaponSwitch', SOUND_POOL_SIZES.weaponSwitch, 'sounds/zombie-sounds/weapon-switch.mp3', 0.4, true)

  // Start round sound pool
  createSoundPool('startRound', SOUND_POOL_SIZES.startRound, 'sounds/startRound.mp3', 0.03, true)

  // Game over sound pool
  createSoundPool('gameOver', SOUND_POOL_SIZES.gameOver, 'sounds/zombie-sounds/gameOver.mp3', 0.5, false)

  // Background siren sound pool
  createSoundPool(
    'backgroundSiren',
    SOUND_POOL_SIZES.backgroundSiren,
    'sounds/background/police-sirens1.mp3',
    0.3,
    true
  )

  // Sale sound pool
  createSoundPool('sale', SOUND_POOL_SIZES.sale, 'sounds/sale.mp3', 1.0, true)

  // No points sound pool
  createSoundPool('noPoints', SOUND_POOL_SIZES.noPoints, 'sounds/no-points.mp3', 0.4, true)

  // Perk sound pools (created individually due to different sounds)
  createPerkSoundPools()

  // Powerup sound pool
  createSoundPool('powerup', SOUND_POOL_SIZES.powerup, 'sounds/powerups/instantKill.mp3', 0.4, true)

  // Narration sound pool (used for random start sounds from start-sounds folder)
  createSoundPool(
    'alaraNarration',
    1,
    'sounds/start-sounds/ElevenLabs_2025-10-29T00_14_18_Revenant - RTS Stealth Ghost Soldier Unit_pvc_sp100_s19_sb43_se15_b_m2.mp3',
    1,
    true
  )

  // Initialize pause sound entity
  Transform.create(pauseSoundEntity, {
    parent: engine.CameraEntity,
    position: Vector3.Zero()
  })
  AudioSource.create(pauseSoundEntity, {
    audioClipUrl: 'sounds/zombie-sounds/pause-button.mp3',
    playing: false,
    volume: 0.5,
    global: true
  })

  console.log('Sound pools initialized')
}

/**
 * Play zombie attack sound at position
 */
export function playZombieAttackSound(position: Vector3): Entity {
  const soundEntity = zombieAttackSoundPool[currentZombieAttackSoundIndex]
  currentZombieAttackSoundIndex = (currentZombieAttackSoundIndex + 1) % zombieAttackSoundPoolSize
  Transform.getMutable(soundEntity).position = position
  console.log(`Playing zombie attack sound at position ${position}`)
  AudioSource.getMutable(soundEntity).playing = true
  return soundEntity
}

/**
 * Play zombie death sound at position
 */
export function playZombieDeathSound(position: Vector3) {
  const soundEntity = zombieDeathSoundPool[currentZombieDeathSoundIndex]
  currentZombieDeathSoundIndex = (currentZombieDeathSoundIndex + 1) % zombieDeathSoundPoolSize
  Transform.getMutable(soundEntity).position = position
  console.log(`Playing zombie death sound at position ${position}`)
  AudioSource.getMutable(soundEntity).playing = true
}

/**
 * Create a sound pool for a specific sound effect
 */
function createSoundPool(name: string, size: number, defaultSound: string, volume: number, global: boolean) {
  const entities: Entity[] = []

  for (let i = 0; i < size; i++) {
    const soundEntity = engine.addEntity()

    if (global) {
      Transform.create(soundEntity, {
        parent: engine.CameraEntity,
        position: Vector3.Zero()
      })
    } else {
      Transform.create(soundEntity, {
        position: Vector3.Zero()
      })
    }

    AudioSource.create(soundEntity, {
      audioClipUrl: defaultSound,
      playing: false,
      volume: volume,
      global: global
    })

    entities.push(soundEntity)
  }

  soundPools.set(name, {
    entities,
    currentIndex: 0,
    size
  })

  console.log(`${name} sound pool created with ${size} entities`)
}

/**
 * Create perk machine sound pools
 */
function createPerkSoundPools() {
  const perkSounds = [
    { name: 'doubleTap', sound: 'sounds/perkMachines/doubleTap.mp3' },
    { name: 'royalArmor', sound: 'sounds/perkMachines/royalArmorMachine.mp3' },
    { name: 'quickReload', sound: 'sounds/perkMachines/quickReload.mp3' },
    { name: 'executionerChest', sound: 'sounds/perkMachines/executionerChest.mp3' }
  ]

  perkSounds.forEach(({ name, sound }) => {
    createSoundPool(name, SOUND_POOL_SIZES.perk, sound, 0.4, true)
  })
}

/**
 * Play a sound from a pool
 */
export function playSound(poolName: string, soundPath?: string): Entity | null {
  const pool = soundPools.get(poolName)
  if (!pool) {
    console.log(`Sound pool '${poolName}' not found`)
    return null
  }

  const soundEntity = pool.entities[pool.currentIndex]
  pool.currentIndex = (pool.currentIndex + 1) % pool.size

  if (soundPath) {
    const audioSource = AudioSource.getMutable(soundEntity)
    audioSource.audioClipUrl = soundPath
  }

  AudioSource.playSound(soundEntity, soundPath || '', true)

  return soundEntity
}

/**
 * Play a positional sound (for zombie deaths, etc.)
 */
export function playPositionalSound(poolName: string, position: Vector3): Entity | null {
  const pool = soundPools.get(poolName)
  if (!pool) {
    console.log(`Sound pool '${poolName}' not found`)
    return null
  }

  const soundEntity = pool.entities[pool.currentIndex]
  pool.currentIndex = (pool.currentIndex + 1) % pool.size

  // Update position
  Transform.getMutable(soundEntity).position = position

  // Play sound
  const audioSource = AudioSource.getMutable(soundEntity)
  audioSource.playing = true

  return soundEntity
}

/**
 * Stop a specific sound entity
 */
export function stopSound(soundEntity: Entity) {
  const audioSource = AudioSource.getMutableOrNull(soundEntity)
  if (audioSource) {
    audioSource.playing = false
  }
}

/**
 * Get a sound entity from pool (for manual control)
 */
export function getSoundEntity(poolName: string): Entity | null {
  const pool = soundPools.get(poolName)
  if (!pool) return null

  const soundEntity = pool.entities[pool.currentIndex]
  pool.currentIndex = (pool.currentIndex + 1) % pool.size

  return soundEntity
}
