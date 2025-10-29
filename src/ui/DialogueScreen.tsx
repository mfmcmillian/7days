/**
 * Dialogue Screen Component
 * Pre-game conversation between Alara and Doctor Yan
 */

import ReactEcs, { UiEntity, Label } from '@dcl/sdk/react-ecs'
import { Color4 } from '@dcl/sdk/math'
import { UITheme } from './UITheme'

export interface DialogueLine {
  speaker: string
  text: string
  duration: number // milliseconds
}

export interface DialogueScreenProps {
  onComplete: () => void
}

// Dialogue sequence - 7 Wave Survival (Cinematic Zombie Horror Opening)
const DIALOGUE: DialogueLine[] = [
  { speaker: 'HQ', text: 'Delta-1, come in. Do you copy?', duration: 2500 },
  { speaker: 'SOLDIER', text: 'Copy, Command. Streets are quiet... too quiet.', duration: 2500 },
  { speaker: 'HQ', text: 'Not for long. You’re surrounded by infected hostiles.\nYour mission is simple, survive seven waves.', duration: 3500 },
  { speaker: 'SOLDIER', text: 'Seven waves? What the hell happened here?', duration: 2500 },
  { speaker: 'HQ', text: 'Containment failed. The infection spread across the city overnight.\nThey move fast, they hunt in packs. Treat them as lost.', duration: 4000 },
  { speaker: 'SOLDIER', text: 'How many are we dealing with?', duration: 2500 },
  { speaker: 'HQ', text: 'Wave one starts light, fifteen infected. Each wave doubles in strength.\nBy wave seven, expect forty-five… plus the evolved ones.', duration: 4000 },
  { speaker: 'SOLDIER', text: 'Any defenses left out here?', duration: 2000 },
  { speaker: 'HQ', text: 'You can build barricades.\nThey’ll slow the horde, but nothing holds forever.', duration: 3500 },
  { speaker: 'SOLDIER', text: 'And weapons? I’m running low already.', duration: 2500 },
  { speaker: 'HQ', text: 'Starting pistol only. Use your kills to earn points.\nPurchase upgrades, shotgun and rifle at supply stations.', duration: 3500 },
  { speaker: 'SOLDIER', text: 'Copy. Any last words of wisdom, Command?', duration: 2500 },
  { speaker: 'HQ', text: 'Barricades buy you time. Headshots drop them faster.\nKeep moving, if you stop, you’re dead.', duration: 3500 },
  { speaker: 'SOLDIER', text: 'Understood. I’ll hold until the last round.', duration: 2500 },
  { speaker: 'HQ', text: 'We’ll try to get eyes on you again after wave one.\nUntil then… good luck, Delta-1.', duration: 3000 },
  { speaker: '—', text: '[Radio static... distant screams in the background]', duration: 2500 },
  { speaker: 'HQ', text: 'Wave 1 incoming. Make them pay.', duration: 2500 }
]

// Track current line
let currentLineIndex = 0
let lineStartTime = 0
let isSkipped = false
let completionCallback: (() => void) | null = null

export function DialogueScreen({ onComplete }: DialogueScreenProps) {
  const currentTime = Date.now()
  
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
    console.log('⏭️ Dialogue skipped - completing immediately')
    // Reset for next time
    currentLineIndex = 0
    lineStartTime = 0
    isSkipped = false
    const callback = completionCallback
    completionCallback = null
    callback()
    return null
  }
  
  // Check if current line should advance
  const currentLine = DIALOGUE[currentLineIndex]
  const elapsed = currentTime - lineStartTime
  
  if (elapsed >= currentLine.duration) {
    currentLineIndex++
    lineStartTime = currentTime
    
    // Check if dialogue is complete
    if (currentLineIndex >= DIALOGUE.length) {
      console.log('✅ Dialogue completed naturally')
      // Reset for next time
      currentLineIndex = 0
      lineStartTime = 0
      const callback = completionCallback
      completionCallback = null
      callback()
      return null
    }
  }
  
  // Calculate fade effect for smoother transitions
  const fadeTime = 500 // ms
  let opacity = 1
  if (elapsed < fadeTime) {
    opacity = elapsed / fadeTime
  } else if (elapsed > currentLine.duration - fadeTime) {
    opacity = (currentLine.duration - elapsed) / fadeTime
  }
  
  // Determine speaker color
  const isHQ = currentLine.speaker === 'HQ'
  const speakerColor = isHQ ? UITheme.colors.cyan : UITheme.colors.accent
  
  // Special effect for "barricade" or "wave" keywords
  const hasKeyword = currentLine.text.toLowerCase().includes('barricade') || currentLine.text.toLowerCase().includes('wave 7')
  const textColor = hasKeyword 
    ? Color4.create(1, 0.8, 0.3, opacity) // Orange highlight for important info
    : Color4.create(1, 1, 1, opacity)

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
            width: `${((currentLineIndex + 1) / DIALOGUE.length) * 100}%`,
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
 * Skip the entire dialogue sequence
 */
export function skipDialogue() {
  console.log('🚀 Skip dialogue triggered')
  isSkipped = true
}

/**
 * Reset dialogue state (for replaying)
 */
export function resetDialogue() {
  currentLineIndex = 0
  lineStartTime = 0
  isSkipped = false
}

