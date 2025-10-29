/**
 * Card Component - Modern glass-morphism card
 * Note: This is a reference component - currently unused in main UI
 */

import ReactEcs, { UiEntity } from '@dcl/sdk/react-ecs'
import { Color4 } from '@dcl/sdk/math'
import { UITheme } from '../UITheme'

export interface CardProps {
  width?: number
  height?: number
  padding?: number
  variant?: 'glass' | 'solid' | 'outlined'
  glow?: boolean
  glowColor?: Color4
}

export function Card({ 
  width = 300, 
  height = 200, 
  padding = UITheme.spacing.medium,
  variant = 'glass',
  glow = false,
  glowColor
}: CardProps) {
  
  const backgroundColor = 
    variant === 'glass' ? UITheme.colors.glass :
    variant === 'solid' ? UITheme.colors.primary :
    Color4.create(0, 0, 0, 0)
  
  return (
    <UiEntity
      uiTransform={{
        width,
        height,
        padding,
        display: 'flex',
        flexDirection: 'column'
      }}
      uiBackground={{
        color: backgroundColor
      }}
    >
      {/* Glow effect (if enabled) */}
      {glow && (
        <UiEntity
          uiTransform={{
            width: '100%',
            height: '100%',
            positionType: 'absolute',
            position: { top: 0, left: 0 }
          }}
          uiBackground={{
            color: glowColor || UITheme.colors.accentGlow
          }}
        />
      )}
      
      {/* Border for outlined variant */}
      {variant === 'outlined' && (
        <UiEntity
          uiTransform={{
            width: '100%',
            height: '100%',
            positionType: 'absolute',
            position: { top: 0, left: 0 }
          }}
        >
          {/* Top border */}
          <UiEntity
            uiTransform={{
              width: '100%',
              height: UITheme.dimensions.border.thin,
              positionType: 'absolute',
              position: { top: 0, left: 0 }
            }}
            uiBackground={{ color: UITheme.colors.border }}
          />
          {/* Bottom border */}
          <UiEntity
            uiTransform={{
              width: '100%',
              height: UITheme.dimensions.border.thin,
              positionType: 'absolute',
              position: { bottom: 0, left: 0 }
            }}
            uiBackground={{ color: UITheme.colors.border }}
          />
          {/* Left border */}
          <UiEntity
            uiTransform={{
              width: UITheme.dimensions.border.thin,
              height: '100%',
              positionType: 'absolute',
              position: { top: 0, left: 0 }
            }}
            uiBackground={{ color: UITheme.colors.border }}
          />
          {/* Right border */}
          <UiEntity
            uiTransform={{
              width: UITheme.dimensions.border.thin,
              height: '100%',
              positionType: 'absolute',
              position: { top: 0, right: 0 }
            }}
            uiBackground={{ color: UITheme.colors.border }}
          />
        </UiEntity>
      )}
    </UiEntity>
  )
}

