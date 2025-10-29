/**
 * Wave Dialogue Manager
 * Handles wave dialogue UI flow
 */

import { ReactEcsRenderer } from '@dcl/sdk/react-ecs'
import { GameState } from '../components/GameComponents'
import { gameStateEntity } from '../core/GameState'
import { WaveDialogueScreen, resetWaveDialogue, skipWaveDialogue } from '../ui/WaveDialogueScreen'
import { proceedToNextWave } from '../systems/StoryWaveManager'
import { MainUI } from '../ui/GameUI'
import * as utils from '@dcl-sdk/utils'
import * as ReactEcs from '@dcl/sdk/react-ecs'
import { Color4 } from '@dcl/sdk/math'

let isWaveDialogueActive = false
let currentDialogueWave = 0
let isCompleting = false // Prevent re-initialization during completion
let isFading = false
let fadeStartTime = 0
const FADE_IN_DURATION = 500 // 0.5 sec fade to black
const HOLD_DURATION = 2500 // 2.5 sec hold on black (wave starts during this)
const FADE_OUT_DURATION = 1000 // 1 sec fade out to gameplay
const TOTAL_DURATION = FADE_IN_DURATION + HOLD_DURATION + FADE_OUT_DURATION

/**
 * Fade overlay component
 */
function FadeOverlay() {
  if (!isFading) return null

  const currentTime = Date.now()
  const elapsed = currentTime - fadeStartTime

  let opacity = 0

  // Phase 1: Fade IN to black (0 → 1)
  if (elapsed < FADE_IN_DURATION) {
    opacity = elapsed / FADE_IN_DURATION
  }
  // Phase 2: HOLD on black (opacity = 1)
  else if (elapsed < FADE_IN_DURATION + HOLD_DURATION) {
    opacity = 1
  }
  // Phase 3: Fade OUT from black (1 → 0)
  else if (elapsed < TOTAL_DURATION) {
    const fadeOutElapsed = elapsed - (FADE_IN_DURATION + HOLD_DURATION)
    opacity = 1 - fadeOutElapsed / FADE_OUT_DURATION
  }
  // Phase 4: Complete
  else {
    isFading = false
    fadeStartTime = 0
    return null
  }

  if (opacity < 0) opacity = 0
  if (opacity > 1) opacity = 1

  return ReactEcs.UiEntity({
    uiTransform: {
      width: '100%',
      height: '100%',
      positionType: 'absolute',
      position: { top: 0, left: 0 }
    },
    uiBackground: {
      color: Color4.create(0, 0, 0, opacity)
    }
  })
}

/**
 * Start wave dialogue sequence
 */
export function startWaveDialogue(waveNumber: number): void {
  console.log(`🎬 Starting wave ${waveNumber} dialogue...`)

  isWaveDialogueActive = true
  currentDialogueWave = waveNumber
  isCompleting = false
  resetWaveDialogue()

  // Set UI to wave dialogue screen
  ReactEcsRenderer.setUiRenderer(() =>
    WaveDialogueScreen({
      waveNumber,
      onComplete: handleWaveDialogueComplete
    })
  )
}

/**
 * Handle wave dialogue completion
 */
function handleWaveDialogueComplete(): void {
  console.log(`✅ Wave dialogue complete, fading to next wave...`)

  isWaveDialogueActive = false
  isCompleting = true // Mark as completing to prevent re-initialization

  // Switch back to main UI
  ReactEcsRenderer.setUiRenderer(MainUI)

  // Start fade immediately
  isFading = true
  fadeStartTime = Date.now()

  // Start the wave after fade-in + 1 second of hold (gives time for setup)
  const waveStartDelay = FADE_IN_DURATION + 1000 // 1.5 seconds total
  utils.timers.setTimeout(() => {
    console.log(`🚀 Starting wave ${currentDialogueWave} (during black screen)...`)
    proceedToNextWave()
  }, waveStartDelay)

  // Reset completing flag after full fade sequence
  utils.timers.setTimeout(() => {
    isCompleting = false
  }, TOTAL_DURATION)
}

/**
 * Check if wave dialogue is active
 */
export function isWaveDialogueActiveCheck(): boolean {
  return isWaveDialogueActive
}

/**
 * Handle skip wave dialogue
 */
export function handleSkipWaveDialogue(): void {
  if (isWaveDialogueActive) {
    skipWaveDialogue()
  }
}

/**
 * Get fade overlay (for rendering in MainUI)
 */
export function getFadeOverlay() {
  return FadeOverlay()
}

/**
 * Wave dialogue system - checks game state and shows dialogue when needed
 */
export function waveDialogueSystem(dt: number): void {
  const gameState = GameState.get(gameStateEntity)

  // Check if we need to show wave dialogue (only if not already active or completing)
  if (gameState.phase === 'waveDialogue' && !isWaveDialogueActive && !isCompleting) {
    const nextWave = gameState.currentWave + 1
    startWaveDialogue(nextWave)
  }
}
