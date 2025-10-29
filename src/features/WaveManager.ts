/**
 * Wave Management for Neural Collapse
 * Handles zombie wave spawning and progression
 */

import { GameState } from '../components/GameComponents'
import { gameStateEntity } from '../core/GameState'
import { createZombie } from '../entities/ZombieFactory'
import { ZOMBIE_SPAWNS, ZOMBIE_SPAWN_INTERVAL, ZOMBIE_SPAWN_BATCH_SIZE } from '../utils/constants'
import { playSound } from '../audio/SoundManager'
import * as utils from '@dcl-sdk/utils'
import { startStoryWave } from '../systems/StoryWaveManager'

/**
 * Spawn the next wave of zombies
 * BALANCED FOR 5-7 MINUTE TOTAL GAME TIME
 */
export function spawnNextWave() {
  const gameState = GameState.getMutable(gameStateEntity)
  gameState.currentWave += 1
  const waveNumber = gameState.currentWave

  // Calculate zombies to spawn for FAST gameplay (5-7 min total)
  // Wave 1: 15, Wave 2: 20, Wave 3: 25, Wave 4: 30, Wave 5: 35
  // Each wave ~60-90 seconds = ~6 minutes total
  const zombiesToSpawn = 10 + waveNumber * 5

  // Set total zombies for the wave
  gameState.totalZombiesForWave = zombiesToSpawn
  gameState.zombiesRemaining = zombiesToSpawn
  gameState.nextSpawnTime = Date.now()

  // Play start round sound
  playSound('startRound', 'sounds/startRound.mp3')

  // Play random start narration on wave 1 (1 second after wave start sound)
  if (waveNumber === 1) {
    // Start story wave 1 IMMEDIATELY (play narration in background)
    console.log('📖 Starting Wave 1...')
    startStoryWave(1)

    utils.timers.setTimeout(() => {
      // Randomly pick one of 6 start sounds
      const startSounds = [
        'sounds/start-sounds/ElevenLabs_2025-10-29T00_14_18_Revenant - RTS Stealth Ghost Soldier Unit_pvc_sp100_s19_sb43_se15_b_m2.mp3',
        'sounds/start-sounds/ElevenLabs_2025-10-29T00_14_54_Revenant - RTS Stealth Ghost Soldier Unit_pvc_sp100_s19_sb43_se15_b_m2.mp3',
        'sounds/start-sounds/ElevenLabs_2025-10-29T00_15_32_Revenant - RTS Stealth Ghost Soldier Unit_pvc_sp100_s19_sb43_se15_b_m2.mp3',
        'sounds/start-sounds/ElevenLabs_2025-10-29T00_15_48_Revenant - RTS Stealth Ghost Soldier Unit_pvc_sp100_s19_sb43_se15_b_m2.mp3',
        'sounds/start-sounds/ElevenLabs_2025-10-29T00_16_09_Revenant - RTS Stealth Ghost Soldier Unit_pvc_sp100_s19_sb43_se15_b_m2.mp3',
        'sounds/start-sounds/ElevenLabs_2025-10-29T00_16_25_Revenant - RTS Stealth Ghost Soldier Unit_pvc_sp100_s19_sb43_se15_b_m2.mp3'
      ]

      const randomSound = startSounds[Math.floor(Math.random() * startSounds.length)]
      console.log(`🎵 Playing random start narration: ${randomSound}`)
      playSound('alaraNarration', randomSound)
    }, 1000) // 1 second delay for narration (but wave already started)
  }

  console.log(`Wave ${waveNumber} started with ${zombiesToSpawn} zombies (5-7 min mode)`)
}

/**
 * Handle staggered zombie spawning (called from system)
 */
export function handleZombieSpawning(): boolean {
  const gameState = GameState.getMutable(gameStateEntity)
  const currentTime = Date.now()

  // Check if it's time to spawn more zombies
  if (gameState.totalZombiesForWave > 0 && currentTime >= gameState.nextSpawnTime) {
    // Spawn zombies one at a time with small delays for smooth performance
    const zombiesToSpawn = Math.min(ZOMBIE_SPAWN_BATCH_SIZE, gameState.totalZombiesForWave)

    // Spawn zombies with staggered timing (100ms between each)
    for (let i = 0; i < zombiesToSpawn; i++) {
      utils.timers.setTimeout(() => {
        const spawnIndex = i % ZOMBIE_SPAWNS.length
        createZombie(ZOMBIE_SPAWNS[spawnIndex])
      }, i * 100) // 100ms delay between each zombie spawn
    }

    // Decrement total zombies to spawn
    gameState.totalZombiesForWave -= zombiesToSpawn

    // Set next spawn time (longer to account for staggered spawns)
    gameState.nextSpawnTime = currentTime + ZOMBIE_SPAWN_INTERVAL + zombiesToSpawn * 100

    return true
  }

  return false
}

/**
 * Check if wave is complete and spawn next wave
 * REDUCED transition time for faster gameplay
 */
export function checkWaveCompletion(): boolean {
  const gameState = GameState.getMutable(gameStateEntity)
  const currentTime = Date.now()

  // If all zombies are dead but we haven't set transition time yet
  if (gameState.zombiesRemaining <= 0 && gameState.totalZombiesForWave <= 0 && gameState.waveTransitionTime === 0) {
    // Set transition time to wait 1.5 seconds - FASTER for 5-7 min gameplay
    gameState.waveTransitionTime = currentTime + 1500
    console.log('Wave complete! Next wave in 1.5 seconds...')
    return false
  }

  // If transition time is set and has passed, start next wave
  if (gameState.waveTransitionTime > 0 && currentTime >= gameState.waveTransitionTime) {
    gameState.waveTransitionTime = 0
    spawnNextWave()
    return true
  }

  return false
}
