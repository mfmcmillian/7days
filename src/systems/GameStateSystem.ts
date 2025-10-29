/**
 * Game State System for Neural Collapse
 * Handles game state transitions and input
 */

import { engine, InputAction, PointerEventType, inputSystem, AudioSource, InputModifier } from '@dcl/sdk/ecs'
import { GameState } from '../components/GameComponents'
import { gameStateEntity, updateLastShotTime, setPaused } from '../core/GameState'
import { pauseSoundEntity } from '../audio/SoundManager'
import { startGame, restartGame } from '../core/GameController.js'
import { forceCleanupCutscene } from '../ui/IntroCutscene'
import { startDialogueSequence, handleSkipDialogue, isDialogueActive } from '../ui/CutsceneManager'
import { handleSkipWaveDialogue, isWaveDialogueActiveCheck } from './WaveDialogueManager'
import { handleContinueNightComplete, isNightCompleteActiveCheck } from './WaveCompleteManager'

/**
 * Game State System
 */
export function gameStateSystem(dt: number) {
  const gameState = GameState.get(gameStateEntity)

  // Handle E key during dialogue (skip)
  if (isDialogueActive() && inputSystem.isTriggered(InputAction.IA_PRIMARY, PointerEventType.PET_DOWN)) {
    console.log('E key pressed during dialogue - skipping...')
    handleSkipDialogue()
    return // Don't process other inputs
  }

  // Handle E key during night complete screen (continue)
  if (isNightCompleteActiveCheck() && inputSystem.isTriggered(InputAction.IA_PRIMARY, PointerEventType.PET_DOWN)) {
    console.log('E key pressed during night complete - continuing...')
    handleContinueNightComplete()
    return // Don't process other inputs
  }

  // Handle E key during wave dialogue (skip)
  if (isWaveDialogueActiveCheck() && inputSystem.isTriggered(InputAction.IA_PRIMARY, PointerEventType.PET_DOWN)) {
    console.log('E key pressed during wave dialogue - skipping...')
    handleSkipWaveDialogue()
    return // Don't process other inputs
  }

  // Start dialogue sequence from menu
  if (gameState.phase === 'menu' && inputSystem.isTriggered(InputAction.IA_PRIMARY, PointerEventType.PET_DOWN)) {
    console.log('E key pressed - starting dialogue sequence...')

    // Clean up cutscene with fade, then start dialogue
    forceCleanupCutscene(() => {
      // Start the dialogue sequence
      console.log('Starting dialogue sequence...')
      startDialogueSequence()
    })
  }

  // Restart from game over
  if (gameState.phase === 'gameOver' && inputSystem.isTriggered(InputAction.IA_PRIMARY, PointerEventType.PET_DOWN)) {
    console.log('Restarting game...')
    restartGame()
  }

  // Resume from pause with E key
  if (
    gameState.phase === 'playing' &&
    gameState.paused &&
    inputSystem.isTriggered(InputAction.IA_PRIMARY, PointerEventType.PET_DOWN)
  ) {
    console.log('Resuming game...')
    setPaused(false)
    AudioSource.playSound(pauseSoundEntity, 'sounds/zombie-sounds/pause-button.mp3')
    updateLastShotTime()
  }
}
