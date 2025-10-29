/**
 * Story Mode Zombie Spawner
 * Spawns zombies for story mode waves
 */

import { GameState } from '../components/GameComponents'
import { gameStateEntity, getGamePhase, isPaused } from '../core/GameState'
import { createZombie } from '../entities/ZombieFactory'
import { ZOMBIE_SPAWNS, ZOMBIE_SPAWN_INTERVAL, ZOMBIE_SPAWN_BATCH_SIZE } from '../utils/constants'
import { STORY_WAVES } from '../utils/storyConfig'

let lastSpawnTime = 0
let zombiesSpawnedThisWave = 0 // Track zombies SPAWNED, not killed

/**
 * Story mode zombie spawn system
 * FIXED: Now tracks spawned zombies to prevent infinite spawning
 */
export function storyZombieSpawnSystem(dt: number): void {
  if (getGamePhase() !== 'playing') return
  if (isPaused()) return

  const gameState = GameState.get(gameStateEntity)

  // Only spawn in story mode
  if (!gameState.storyMode) return

  // Don't spawn if boss already spawned
  if (gameState.bossSpawned) return

  // Get story wave config
  const waveConfig = STORY_WAVES[gameState.currentWave - 1]
  if (!waveConfig) return

  // Check if we've spawned enough zombies for this wave
  if (zombiesSpawnedThisWave >= waveConfig.zombieCount) {
    return // Stop spawning - exact count reached
  }

  const currentTime = Date.now()

  // Spawn zombies at intervals
  if (currentTime - lastSpawnTime >= ZOMBIE_SPAWN_INTERVAL) {
    // Calculate how many zombies to spawn (don't exceed wave limit)
    const remainingZombies = waveConfig.zombieCount - zombiesSpawnedThisWave
    const spawnCount = Math.min(ZOMBIE_SPAWN_BATCH_SIZE, remainingZombies)

    for (let i = 0; i < spawnCount; i++) {
      const spawnIndex = Math.floor(Math.random() * ZOMBIE_SPAWNS.length)
      createZombie(ZOMBIE_SPAWNS[spawnIndex])
    }

    zombiesSpawnedThisWave += spawnCount
    lastSpawnTime = currentTime

    console.log(
      `🧟 Spawned ${spawnCount} zombies (${zombiesSpawnedThisWave}/${waveConfig.zombieCount}) for wave ${gameState.currentWave}`
    )
  }
}

/**
 * Reset story zombie spawner (for wave reset)
 */
export function resetStoryZombieSpawner(): void {
  lastSpawnTime = 0
  zombiesSpawnedThisWave = 0
  console.log('🔄 Story zombie spawner reset')
}
