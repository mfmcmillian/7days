/**
 * Story Wave Manager
 * Manages story mode progression, wave completion, and boss spawning
 */

import { GameState } from '../components/GameComponents'
import { gameStateEntity } from '../core/GameState'
import { STORY_WAVES } from '../utils/storyConfig'
import { spawnMiniBosses, spawnBigBoss, areBossesAlive } from '../systems/BossZombieSystem'
import { resetAllySystem, removeAllAllies } from '../systems/AllyZombieSystem'
import { resetFighterWeapon, removeAllProjectiles } from '../systems/FighterWeaponSystem'
import { removeAllZombies } from '../entities/ZombieFactory'
import { resetStoryZombieSpawner } from '../systems/StoryZombieSpawner'
import { removeAllUpgradeBoxes } from '../systems/UpgradeBoxSystem'
import { removeAllPowerUps } from '../systems/MovingPowerUpSystem'
import { removeAllWeaponBoxes } from '../systems/WeaponBoxSystem'
import * as utils from '@dcl-sdk/utils'

/**
 * Start a story mode wave
 */
export function startStoryWave(waveNumber: number): void {
  console.log(`📖 Starting Story Night ${waveNumber}`)

  const gameState = GameState.getMutable(gameStateEntity)
  gameState.currentWave = waveNumber
  gameState.zombiesKilledThisWave = 0
  gameState.bossSpawned = false
  gameState.bossAlive = false
  gameState.phase = 'playing'
  gameState.storyMode = true

  // Night 1: Reset everything (fresh start)
  if (waveNumber === 1) {
    resetAllySystem()
    resetFighterWeapon()
    console.log(`🌙 Night 1: Fresh start with pistol and no allies`)
  }
  // Night 2+: Keep allies and weapons from daytime!
  else {
    console.log(`🌙 Night ${waveNumber}: Keeping allies and weapons from daytime`)
  }

  // Reset zombie spawner
  resetStoryZombieSpawner()

  // Remove any leftover zombies from previous wave
  removeAllZombies()

  console.log(`✅ Night ${waveNumber} ready. Zombie spawner reset.`)
}

/**
 * Check if it's time to spawn the boss
 */
export function checkBossSpawn(): void {
  const gameState = GameState.get(gameStateEntity)

  // Only in story mode
  if (!gameState.storyMode) {
    console.log('❌ Boss spawn check: Not in story mode')
    return
  }

  // Boss already spawned
  if (gameState.bossSpawned) {
    return // Don't log spam
  }

  // Get current night config
  const nightConfig = STORY_WAVES[gameState.currentWave - 1]
  if (!nightConfig) {
    console.log(`❌ Boss spawn check: No night config for night ${gameState.currentWave}`)
    return
  }

  console.log(`🔍 Boss spawn check: ${gameState.zombiesKilledThisWave}/${nightConfig.zombieCount} kills`)

  // Check if enough zombies killed
  if (gameState.zombiesKilledThisWave >= nightConfig.zombieCount) {
    console.log(`👹 Night ${gameState.currentWave}: ${nightConfig.zombieCount} zombies killed!`)

    // Mark boss as spawned FIRST to prevent loop
    const mutableGameState = GameState.getMutable(gameStateEntity)
    mutableGameState.bossSpawned = true

    // Check if there are any bosses to spawn
    const hasBosses = nightConfig.miniBosses > 0 || nightConfig.bigBoss

    if (hasBosses) {
      // Spawn mini-bosses
      if (nightConfig.miniBosses > 0) {
        spawnMiniBosses(nightConfig.miniBosses, gameState.currentWave)
      }

      // Spawn big boss
      if (nightConfig.bigBoss) {
        spawnBigBoss(gameState.currentWave)
      }

      mutableGameState.bossAlive = true
      console.log(`👹 Bosses spawned for night ${gameState.currentWave}`)
    } else {
      // No bosses - night is complete immediately
      console.log(`✅ Night ${gameState.currentWave} has no bosses - completing immediately`)
      mutableGameState.bossAlive = false

      // Wait 1 second, then complete the night
      utils.timers.setTimeout(() => {
        handleWaveVictory()
      }, 1000)
    }
  }
}

/**
 * Check if wave is complete (all bosses dead)
 */
export function checkWaveCompletion(): void {
  const gameState = GameState.get(gameStateEntity)

  // Only in story mode
  if (!gameState.storyMode) return

  // Boss must be spawned
  if (!gameState.bossSpawned) return

  // Boss must be alive
  if (!gameState.bossAlive) return

  // Check if all bosses are dead
  if (!areBossesAlive()) {
    console.log(`✅ All bosses defeated! Wave ${gameState.currentWave} complete!`)

    // Mark boss as dead
    const mutableGameState = GameState.getMutable(gameStateEntity)
    mutableGameState.bossAlive = false

    // Clean up the scene immediately
    console.log(`🧹 Cleaning up scene...`)
    removeAllZombies() // Remove all zombies (including dead boss)
    // DON'T remove allies - they persist across nights!
    removeAllProjectiles() // Remove all bullets/projectiles
    removeAllUpgradeBoxes() // Remove blue/red boxes
    removeAllPowerUps() // Remove powerups (nuke, fire rate, etc)
    removeAllWeaponBoxes() // Remove weapon pickup boxes

    // Wait 1 second, then show wave complete screen
    utils.timers.setTimeout(() => {
      handleWaveVictory()
    }, 1000) // 1 second pause to let action settle
  }
}

/**
 * Handle wave victory
 */
function handleWaveVictory(): void {
  const gameState = GameState.getMutable(gameStateEntity)

  // Check if we just completed wave 7 (story complete)
  if (gameState.currentWave >= 7) {
    console.log(`🎉 Story Mode Complete! 7 waves survived!`)
    gameState.phase = 'victory'
  } else {
    // Check if this is Wave 1 (skip daytime)
    if (gameState.currentWave === 1) {
      console.log(`🎉 Wave 1 complete! Proceeding directly to Wave 2...`)
      gameState.phase = 'waveComplete' // Will show complete screen, then dialogue, then Wave 2
    } else {
      // Wave 2+ → Show daytime activities
      console.log(`🎉 Showing wave ${gameState.currentWave} complete screen...`)
      gameState.phase = 'waveComplete' // New phase for completion screen
    }
  }
}

/**
 * Proceed to next wave
 */
export function proceedToNextWave(): void {
  const gameState = GameState.get(gameStateEntity)
  const nextWave = gameState.currentWave + 1

  if (nextWave <= 7) {
    startStoryWave(nextWave)
  } else {
    console.log(`❌ Cannot proceed: Wave ${nextWave} exceeds 7 waves`)
  }
}

/**
 * Start endless mode after story completion
 */
export function startEndlessMode(): void {
  console.log(`♾️ Starting Endless Mode!`)

  const gameState = GameState.getMutable(gameStateEntity)
  gameState.storyMode = false
  gameState.currentWave = 6 // Continue from wave 6
  gameState.phase = 'playing'
  gameState.zombiesKilledThisWave = 0
  gameState.bossSpawned = false
  gameState.bossAlive = false

  // Reset allies to 0
  resetAllySystem()

  // Reset weapon to pistol
  resetFighterWeapon()

  console.log(`✅ Endless mode started at wave 6`)
}
