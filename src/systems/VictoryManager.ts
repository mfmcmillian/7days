/**
 * Victory Manager
 * Handles victory screen when player completes 18 nights
 */

import { ReactEcsRenderer } from '@dcl/sdk/react-ecs'
import { GameState } from '../components/GameComponents'
import { gameStateEntity } from '../core/GameState'
import { VictoryMenu } from '../ui/GameUI'

let isVictoryActive = false

/**
 * Show victory screen
 */
export function startVictoryScreen(): void {
  console.log('🎉 Showing victory screen...')

  isVictoryActive = true

  // Set UI to victory screen
  ReactEcsRenderer.setUiRenderer(VictoryMenu)
}

/**
 * Check if victory screen is active
 */
export function isVictoryActiveCheck(): boolean {
  return isVictoryActive
}

/**
 * Victory system - checks game state and shows victory screen when needed
 */
export function victorySystem(dt: number): void {
  const gameState = GameState.get(gameStateEntity)

  // Check if we need to show victory screen
  if (gameState.phase === 'victory' && !isVictoryActive) {
    startVictoryScreen()
  }
}

