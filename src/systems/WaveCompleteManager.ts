/**
 * Night Complete Manager
 * Handles night complete UI flow
 */

import { ReactEcsRenderer } from '@dcl/sdk/react-ecs'
import { GameState } from '../components/GameComponents'
import { gameStateEntity } from '../core/GameState'
import { WaveCompleteScreen, resetWaveComplete, triggerWaveComplete } from '../ui/WaveCompleteScreen'
import { MainUI } from '../ui/GameUI'

let isNightCompleteActive = false
let currentNight = 0

/**
 * Start night complete screen
 */
export function startNightComplete(nightNumber: number): void {
  console.log(`🎬 Starting night ${nightNumber} complete screen...`)

  isNightCompleteActive = true
  currentNight = nightNumber
  resetWaveComplete()

  // Set UI to night complete screen
  ReactEcsRenderer.setUiRenderer(() =>
    WaveCompleteScreen({
      waveNumber: nightNumber,
      onComplete: handleNightCompleteFinished
    })
  )
}

/**
 * Handle night complete screen finished
 */
function handleNightCompleteFinished(): void {
  console.log(`✅ Night complete screen finished, going to daytime activities...`)

  isNightCompleteActive = false

  // Switch back to main UI
  ReactEcsRenderer.setUiRenderer(MainUI)

  const gameState = GameState.getMutable(gameStateEntity)

  // All nights (including Night 1): Go to daytime activities
  console.log(`🌅 Night ${gameState.currentWave} complete → Going to daytime activities`)
  gameState.phase = 'daytime'
}

/**
 * Check if night complete is active
 */
export function isNightCompleteActiveCheck(): boolean {
  return isNightCompleteActive
}

/**
 * Handle skip night complete (E key)
 */
export function handleContinueNightComplete(): void {
  if (isNightCompleteActive) {
    triggerWaveComplete()
  }
}

/**
 * Night complete system - checks game state and shows screen when needed
 */
export function nightCompleteSystem(dt: number): void {
  const gameState = GameState.get(gameStateEntity)

  // Check if we need to show night complete
  if (gameState.phase === 'waveComplete' && !isNightCompleteActive) {
    startNightComplete(gameState.currentWave)
  }
}
