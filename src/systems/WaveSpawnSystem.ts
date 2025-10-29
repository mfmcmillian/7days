/**
 * Wave Spawn System for Neural Collapse
 * Handles staggered zombie spawning during waves
 */

import { GameState } from '../components/GameComponents'
import { gameStateEntity, getGamePhase, isPaused } from '../core/GameState'
import { handleZombieSpawning, checkWaveCompletion } from '../features/WaveManager'

/**
 * Wave Spawn System - spawns zombies at intervals and checks for wave completion
 */
export function waveSpawnSystem(dt: number) {
  if (getGamePhase() !== 'playing') return
  if (isPaused()) return

  const gameState = GameState.get(gameStateEntity)

  // DISABLE old wave system if in story mode
  if (gameState.storyMode) {
    return // Story mode handles its own wave progression
  }

  // Handle spawning new zombies (old system, only for endless mode)
  handleZombieSpawning()

  // Check if wave is complete and handle transition delay (old system)
  checkWaveCompletion()
}
