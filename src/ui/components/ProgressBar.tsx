/**
 * ProgressBar Component - Modern progress indicator
 */

import ReactEcs, { UiEntity, Label } from '@dcl/sdk/react-ecs'
import { Color4 } from '@dcl/sdk/math'
import { UITheme } from '../UITheme'

export interface ProgressBarProps {
  current: number
  max: number
  label?: string
  showValue?: boolean
  color?: Color4
  height?: number
  animated?: boolean
}

export function ProgressBar({ 
  current, 
  max, 
  label,
  showValue = true,
  color,
  height = 30,
  animated = true
}: ProgressBarProps) {
  
  const percentage = Math.max(0, Math.min(100, (current / max) * 100))
  
  // Auto color based on percentage
  const fillColor = color || (
    percentage > 60 ? UITheme.colors.success :
    percentage > 30 ? UITheme.colors.warning :
    UITheme.colors.danger
  )
  
  return (
    <UiEntity
      uiTransform={{
        width: '100%',
        height: 'auto',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Label */}
      {(label || showValue) && (
        <UiEntity
          uiTransform={{
            width: '100%',
            height: 20,
            margin: { bottom: UITheme.spacing.xs },
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between'
          }}
        >
          {label && (
            <Label
              value={label}
              fontSize={UITheme.fontSize.small}
              color={UITheme.colors.textSecondary}
              textAlign="middle-left"
            />
          )}
          {showValue && (
            <Label
              value={`${Math.max(0, Math.floor(current))}/${max}`}
              fontSize={UITheme.fontSize.small}
              color={UITheme.colors.text}
              textAlign="middle-right"
            />
          )}
        </UiEntity>
      )}
      
      {/* Progress bar container */}
      <UiEntity
        uiTransform={{
          width: '100%',
          height
        }}
        uiBackground={{
          color: UITheme.colors.glassDark
        }}
      >
        {/* Progress bar fill */}
        <UiEntity
          uiTransform={{
            width: `${percentage}%`,
            height: '100%'
          }}
          uiBackground={{
            color: fillColor
          }}
        >
          {/* Glow effect */}
          {animated && (
            <UiEntity
              uiTransform={{
                width: '100%',
                height: '100%',
                positionType: 'absolute',
                position: { top: 0, left: 0 }
              }}
              uiBackground={{
                color: Color4.create(fillColor.r, fillColor.g, fillColor.b, 0.3)
              }}
            />
          )}
        </UiEntity>
        
        {/* Border */}
        <UiEntity
          uiTransform={{
            width: '100%',
            height: 2,
            positionType: 'absolute',
            position: { top: 0, left: 0 }
          }}
          uiBackground={{
            color: UITheme.colors.border
          }}
        />
        <UiEntity
          uiTransform={{
            width: '100%',
            height: 2,
            positionType: 'absolute',
            position: { bottom: 0, left: 0 }
          }}
          uiBackground={{
            color: UITheme.colors.border
          }}
        />
      </UiEntity>
    </UiEntity>
  )
}


