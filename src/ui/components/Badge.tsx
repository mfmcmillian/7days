/**
 * Badge Component - Small status indicator
 */

import ReactEcs, { UiEntity, Label } from '@dcl/sdk/react-ecs'
import { Color4 } from '@dcl/sdk/math'
import { UITheme } from '../UITheme'

export interface BadgeProps {
  text: string
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral'
  pulse?: boolean
}

export function Badge({ 
  text, 
  variant = 'neutral',
  pulse = false
}: BadgeProps) {
  
  // Color based on variant
  const getColor = () => {
    switch (variant) {
      case 'success':
        return UITheme.colors.success
      case 'warning':
        return UITheme.colors.warning
      case 'danger':
        return UITheme.colors.danger
      case 'info':
        return UITheme.colors.accent
      default:
        return UITheme.colors.glass
    }
  }
  
  const color = getColor()
  
  return (
    <UiEntity
      uiTransform={{
        width: '100%',
        height: 24,
        padding: { left: UITheme.spacing.small, right: UITheme.spacing.small },
        margin: { bottom: UITheme.spacing.xs },
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center',
        flexDirection: 'row'
      }}
      uiBackground={{
        color: Color4.create(color.r, color.g, color.b, 0.3)
      }}
    >
      {/* Pulse effect */}
      {pulse && (
        <UiEntity
          uiTransform={{
            width: '110%',
            height: '110%',
            positionType: 'absolute',
            position: { top: -2, left: -2 }
          }}
          uiBackground={{
            color: Color4.create(color.r, color.g, color.b, 0.4)
          }}
        />
      )}
      
      {/* Left border accent */}
      <UiEntity
        uiTransform={{
          width: 2,
          height: '100%',
          positionType: 'absolute',
          position: { left: 0, top: 0 }
        }}
        uiBackground={{
          color
        }}
      />
      
      {/* Content */}
      <Label
        value={text}
        fontSize={UITheme.fontSize.small}
        color={color}
        textAlign="middle-left"
      />
    </UiEntity>
  )
}

