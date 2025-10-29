/**
 * Story Mode System
 * Main system that runs every frame to check story mode progress
 */

import { getGamePhase } from '../core/GameState'
import { checkBossSpawn, checkWaveCompletion } from './StoryWaveManager'

/**
 * Story mode update system - runs every frame
 */
export function storyModeSystem(dt: number): void {
  if (getGamePhase() !== 'playing') return

  // Check if it's time to spawn bosses
  checkBossSpawn()

  // Check if wave is complete
  checkWaveCompletion()
}

