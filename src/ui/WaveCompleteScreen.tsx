/**
 * Wave Complete Screen
 * Shows between wave end and next wave (displays barricade stats)
 */

import ReactEcs, { UiEntity, Label } from '@dcl/sdk/react-ecs'
import { Color4 } from '@dcl/sdk/math'
import { UITheme } from './UITheme'
import { getAllBarricades } from '../features/BarricadeManager'
import { Barricade } from '../components/GameComponents'

export interface WaveCompleteProps {
  waveNumber: number
  onComplete: () => void
}

let startTime = 0
let shouldComplete = false

export function WaveCompleteScreen({ waveNumber, onComplete }: WaveCompleteProps) {
  const currentTime = Date.now()
  
  // Initialize on first render
  if (startTime === 0) {
    startTime = currentTime
    shouldComplete = false
    console.log(`🎉 Wave ${waveNumber} Complete screen showing (press E to continue)...`)
  }
  
  // Check if player triggered completion
  if (shouldComplete) {
    console.log(`✅ Wave complete screen finished (player pressed E)`)
    startTime = 0
    shouldComplete = false
    onComplete()
    return null
  }
  
  const elapsed = currentTime - startTime
  
  // Fade in effect
  const fadeTime = 500
  let opacity = 1
  if (elapsed < fadeTime) {
    opacity = elapsed / fadeTime
  }

  // Get barricade stats
  const barricadeEntities = getAllBarricades()
  const barricadeCount = barricadeEntities.length
  
  let totalHealthPercent = 0
  barricadeEntities.forEach(entity => {
    const barricade = Barricade.getOrNull(entity)
    if (barricade) {
      totalHealthPercent += (barricade.health / barricade.maxHealth)
    }
  })
  
  const barricadeHealthPercent = barricadeCount > 0 
    ? Math.round((totalHealthPercent / barricadeCount) * 100)
    : 0

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
        color: Color4.create(0, 0, 0, 0.9)
      }}
    >
      {/* Main text */}
      <UiEntity
        uiTransform={{
          width: 'auto',
          height: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <Label
          value={`WAVE ${waveNumber}`}
          fontSize={48}
          color={Color4.create(1, 0.8, 0, opacity)}
          textAlign="middle-center"
          uiTransform={{
            margin: { bottom: 20 }
          }}
        />
        <Label
          value="COMPLETE"
          fontSize={72}
          color={Color4.create(0, 1, 0.5, opacity)}
          textAlign="middle-center"
          uiTransform={{
            margin: { bottom: 40 }
          }}
        />
        
        {/* Barricade Stats */}
        <Label
          value="DEFENSES"
          fontSize={24}
          color={Color4.create(0.5, 0.8, 1, opacity)}
          textAlign="middle-center"
          uiTransform={{
            margin: { bottom: 10 }
          }}
        />
        <Label
          value={`Barricades: ${barricadeCount}/6`}
          fontSize={20}
          color={Color4.create(1, 1, 1, opacity)}
          textAlign="middle-center"
          uiTransform={{
            margin: { bottom: 5 }
          }}
        />
        <Label
          value={`Average Health: ${barricadeHealthPercent}%`}
          fontSize={20}
          color={Color4.create(
            barricadeHealthPercent > 66 ? 0 : (barricadeHealthPercent > 33 ? 1 : 1),
            barricadeHealthPercent > 66 ? 1 : (barricadeHealthPercent > 33 ? 1 : 0),
            0,
            opacity
          )}
          textAlign="middle-center"
        />
      </UiEntity>

      {/* Continue prompt */}
      <UiEntity
        uiTransform={{
          width: 'auto',
          height: 'auto',
          positionType: 'absolute',
          position: { bottom: UITheme.spacing.large }
        }}
      >
        <Label
          value="Press E to Continue"
          fontSize={UITheme.fontSize.large}
          color={Color4.create(1, 1, 1, opacity * 0.8)}
          textAlign="middle-center"
        />
      </UiEntity>
    </UiEntity>
  )
}

/**
 * Trigger wave complete to finish
 */
export function triggerWaveComplete() {
  console.log('🚀 Wave complete continue triggered')
  shouldComplete = true
}

/**
 * Reset wave complete screen
 */
export function resetWaveComplete() {
  startTime = 0
  shouldComplete = false
}

