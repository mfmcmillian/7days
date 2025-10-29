/**
 * Story Wave Dialogue Screen
 * Shows dialogue between waves
 */

import ReactEcs, { UiEntity, Label } from '@dcl/sdk/react-ecs'
import { Color4 } from '@dcl/sdk/math'
import { UITheme } from './UITheme'
import { DialogueLine } from './DialogueScreen'
import { WAVE_DIALOGUES } from '../utils/waveDialogues'

export interface WaveDialogueProps {
  waveNumber: number
  onComplete: () => void
}

// Track current line
let currentLineIndex = 0
let lineStartTime = 0
let isSkipped = false
let completionCallback: (() => void) | null = null

export function WaveDialogueScreen({ waveNumber, onComplete }: WaveDialogueProps) {
  const currentTime = Date.now()
  
  // Get dialogue for this wave
  const dialogue = WAVE_DIALOGUES[waveNumber]
  if (!dialogue) {
    console.log(`⚠️ No dialogue for wave ${waveNumber}, skipping`)
    onComplete()
    return null
  }
  
  // Store completion callback
  if (completionCallback === null) {
    completionCallback = onComplete
  }
  
  // Initialize on first render
  if (lineStartTime === 0) {
    lineStartTime = currentTime
  }
  
  // Handle skip immediately
  if (isSkipped) {
    console.log('⏭️ Wave dialogue skipped')
    currentLineIndex = 0
    lineStartTime = 0
    isSkipped = false
    const callback = completionCallback
    completionCallback = null
    callback()
    return null
  }
  
  // Check if current line should advance
  const currentLine = dialogue[currentLineIndex]
  const elapsed = currentTime - lineStartTime
  
  if (elapsed >= currentLine.duration) {
    currentLineIndex++
    lineStartTime = currentTime
    
    // Check if dialogue is complete
    if (currentLineIndex >= dialogue.length) {
      console.log('✅ Wave dialogue completed')
      currentLineIndex = 0
      lineStartTime = 0
      const callback = completionCallback
      completionCallback = null
      callback()
      return null
    }
  }
  
  // Calculate fade effect
  const fadeTime = 500
  let opacity = 1
  if (elapsed < fadeTime) {
    opacity = elapsed / fadeTime
  } else if (elapsed > currentLine.duration - fadeTime) {
    opacity = (currentLine.duration - elapsed) / fadeTime
  }
  
  // Determine speaker color
  const isDrYan = currentLine.speaker === 'DR. YAN'
  const speakerColor = isDrYan ? UITheme.colors.cyan : UITheme.colors.accent
  
  const textColor = Color4.create(1, 1, 1, opacity)

  return (
    <UiEntity
      uiTransform={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      uiBackground={{
        color: Color4.Black()
      }}
    >
      {/* Dialogue container */}
      <UiEntity
        uiTransform={{
          width: 800,
          height: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        {/* Speaker name */}
        <Label
          value={currentLine.speaker}
          fontSize={UITheme.fontSize.small}
          color={Color4.create(speakerColor.r, speakerColor.g, speakerColor.b, opacity)}
          textAlign="middle-center"
          uiTransform={{
            margin: { bottom: UITheme.spacing.medium }
          }}
        />
        
        {/* Dialogue text */}
        <Label
          value={currentLine.text}
          fontSize={UITheme.fontSize.large}
          color={textColor}
          textAlign="middle-center"
        />
      </UiEntity>
      
      {/* Skip indicator */}
      <UiEntity
        uiTransform={{
          width: 'auto',
          height: 'auto',
          positionType: 'absolute',
          position: { bottom: UITheme.spacing.large, right: UITheme.spacing.large }
        }}
      >
        <Label
          value="Press E to Skip"
          fontSize={UITheme.fontSize.small}
          color={Color4.create(0.5, 0.5, 0.5, 0.7)}
          textAlign="middle-right"
        />
      </UiEntity>
      
      {/* Progress indicator */}
      <UiEntity
        uiTransform={{
          width: 400,
          height: 2,
          positionType: 'absolute',
          position: { bottom: UITheme.spacing.xl }
        }}
        uiBackground={{
          color: Color4.create(0.2, 0.2, 0.2, 0.5)
        }}
      >
        {/* Progress bar */}
        <UiEntity
          uiTransform={{
            width: `${((currentLineIndex + 1) / dialogue.length) * 100}%`,
            height: '100%'
          }}
          uiBackground={{
            color: UITheme.colors.accent
          }}
        />
      </UiEntity>
    </UiEntity>
  )
}

/**
 * Skip the wave dialogue
 */
export function skipWaveDialogue() {
  console.log('🚀 Skip wave dialogue triggered')
  isSkipped = true
}

/**
 * Reset wave dialogue state
 */
export function resetWaveDialogue() {
  currentLineIndex = 0
  lineStartTime = 0
  isSkipped = false
  completionCallback = null
}


