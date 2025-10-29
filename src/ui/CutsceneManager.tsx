/**
 * Cutscene Manager for Neural Collapse
 * Manages cutscene state and UI rendering with dialogue sequence
 */

import ReactEcs from '@dcl/sdk/react-ecs'
import { ReactEcsRenderer } from '@dcl/sdk/react-ecs'
import { 
  playIntroCutscene, 
  skipCutscene, 
  handlePlayButton, 
  CutsceneOverlay,
  isCutscenePlaying,
  forceCleanupCutscene
} from './IntroCutscene'
import { 
  playEntryCutscene, 
  EntryCutsceneOverlay, 
  isEntryCutscenePlaying,
  forceCleanupEntryCutscene
} from './EntryCutscene'
import { DialogueScreen, skipDialogue, resetDialogue } from './DialogueScreen'
import { StartMenu } from './GameUI.js'
import { startGame } from '../core/GameController'
import { engine, InputAction, pointerEventsSystem } from '@dcl/sdk/ecs'

// Track sequence state
let cutsceneShown = false
let dialogueShown = false
let entryCutsceneShown = false
let isShowingDialogue = false
let isShowingEntryCutscene = false

/**
 * Start intro cutscene sequence
 * Flow: Intro video → Start menu → Dialogue → Entry video → Game
 */
export function startIntroCutscene() {
  if (cutsceneShown) {
    // Cutscene already shown, go straight to start menu
    ReactEcsRenderer.setUiRenderer(StartMenu)
    return
  }

  console.log('🎬 Initiating intro cutscene...')
  
  // Show cutscene UI overlay
  ReactEcsRenderer.setUiRenderer(CutsceneUI)
  
  // Start the cutscene
  playIntroCutscene(() => {
    // When cutscene ends, show start menu (with Press E to Start)
    cutsceneShown = true
    console.log('✅ Intro cutscene complete, showing start menu...')
    ReactEcsRenderer.setUiRenderer(StartMenu)
    
    // Setup E key listener for starting dialogue sequence
    setupStartGameListener()
  })
}

/**
 * Setup listener for E key to start dialogue sequence
 */
function setupStartGameListener() {
  console.log('⌨️ Waiting for E key to start dialogue...')
  
  // Listen for E key press
  pointerEventsSystem.onPointerDown(
    {
      entity: engine.RootEntity,
      opts: { button: InputAction.IA_PRIMARY, hoverText: '' }
    },
    () => {
      // This won't work perfectly, we need to use the input system
      // For now, we'll trigger from the start menu component
    }
  )
}

/**
 * Start the dialogue sequence (called after "Press E to Start")
 */
export function startDialogueSequence() {
  if (dialogueShown) {
    // Already shown dialogue, skip straight to entry cutscene
    console.log('⏭️ Dialogue already shown, playing entry cutscene...')
    startEntryCutsceneSequence()
    return
  }
  
  console.log('💬 Starting dialogue sequence...')
  isShowingDialogue = true
  resetDialogue()
  
  // Show dialogue screen
  ReactEcsRenderer.setUiRenderer(() => (
    <DialogueScreen 
      onComplete={() => {
        console.log('✅ Dialogue complete')
        dialogueShown = true
        isShowingDialogue = false
        
        // Play entry cutscene (loading screen)
        startEntryCutsceneSequence()
      }}
    />
  ))
}

/**
 * Start the entry cutscene (loading screen after dialogue)
 */
export function startEntryCutsceneSequence() {
  if (entryCutsceneShown) {
    // Already shown entry cutscene, go straight to game
    console.log('⏭️ Entry cutscene already shown, starting game...')
    startGame()
    return
  }
  
  console.log('🎬 Starting entry cutscene (loading screen)...')
  isShowingEntryCutscene = true
  
  // Show entry cutscene UI overlay
  ReactEcsRenderer.setUiRenderer(EntryCutsceneUI)
  
  // Play entry cutscene
  playEntryCutscene(() => {
    entryCutsceneShown = true
    isShowingEntryCutscene = false
    console.log('✅ Entry cutscene complete, starting game...')
    startGame()
  })
}

/**
 * Entry Cutscene UI Component
 */
const EntryCutsceneUI = () => {
  return <EntryCutsceneOverlay />
}

/**
 * Skip dialogue sequence (E key during dialogue)
 */
export function handleSkipDialogue() {
  if (isShowingDialogue) {
    console.log('⏭️ Skipping dialogue...')
    skipDialogue()
  }
}

/**
 * Cutscene UI Component
 * Renders the cutscene overlay with skip/play buttons
 */
const CutsceneUI = () => {
  return (
    <CutsceneOverlay
      onSkip={() => {
        skipCutscene(() => {
          cutsceneShown = true
          console.log('⏭️ Skipped intro, showing start menu...')
          ReactEcsRenderer.setUiRenderer(StartMenu)
          setupStartGameListener()
        })
      }}
      onPlay={() => {
        handlePlayButton(() => {
          cutsceneShown = true
          console.log('▶️ Play clicked, showing start menu...')
          ReactEcsRenderer.setUiRenderer(StartMenu)
          setupStartGameListener()
        })
      }}
    />
  )
}

/**
 * Check if currently showing dialogue
 */
export function isDialogueActive(): boolean {
  return isShowingDialogue
}

/**
 * Check if currently showing entry cutscene
 */
export function isEntryCutsceneActive(): boolean {
  return isShowingEntryCutscene
}

/**
 * Check if cutscene has been shown this session
 */
export function hasCutsceneBeenShown(): boolean {
  return cutsceneShown
}

/**
 * Reset cutscene state (for testing)
 */
export function resetCutscene() {
  cutsceneShown = false
  dialogueShown = false
  entryCutsceneShown = false
  isShowingDialogue = false
  isShowingEntryCutscene = false
  resetDialogue()
}


