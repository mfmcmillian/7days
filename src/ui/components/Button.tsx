/**
 * Button Component - Modern interactive button
 */

import ReactEcs, { UiEntity, Label } from '@dcl/sdk/react-ecs'
import { Color4 } from '@dcl/sdk/math'
import { UITheme } from '../UITheme'

export interface ButtonProps {
  text: string
  onClick?: () => void
  size?: 'small' | 'medium' | 'large'
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'ghost'
  disabled?: boolean
  fullWidth?: boolean
  icon?: string
}

export function Button({ 
  text, 
  onClick, 
  size = 'medium', 
  variant = 'primary',
  disabled = false,
  fullWidth = false,
  icon
}: ButtonProps) {
  
  const dimensions = UITheme.dimensions.button[size]
  
  // Color based on variant
  const getColors = () => {
    switch (variant) {
      case 'success':
        return { bg: UITheme.colors.success, glow: UITheme.colors.successGlow }
      case 'warning':
        return { bg: UITheme.colors.warning, glow: UITheme.colors.warningGlow }
      case 'danger':
        return { bg: UITheme.colors.danger, glow: UITheme.colors.dangerGlow }
      case 'ghost':
        return { bg: Color4.create(0, 0, 0, 0), glow: UITheme.colors.accentGlow }
      default:
        return { bg: UITheme.colors.glass, glow: UITheme.colors.accentGlow }
    }
  }
  
  const colors = getColors()
  const textColor = disabled ? UITheme.colors.textMuted : UITheme.colors.text
  
  return (
    <UiEntity
      uiTransform={{
        width: fullWidth ? '100%' : dimensions.width,
        height: dimensions.height,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
      uiBackground={{
        color: disabled ? UITheme.colors.glassDark : colors.bg
      }}
      onMouseDown={disabled ? undefined : onClick}
    >
      {/* Hover glow effect */}
      {!disabled && (
        <UiEntity
          uiTransform={{
            width: '102%',
            height: '102%',
            positionType: 'absolute',
            position: { top: -1, left: -1 }
          }}
          uiBackground={{
            color: colors.glow
          }}
        />
      )}
      
      {/* Border accent */}
      {variant !== 'ghost' && (
        <UiEntity
          uiTransform={{
            width: '100%',
            height: '100%',
            positionType: 'absolute',
            position: { top: 0, left: 0 }
          }}
        >
          <UiEntity
            uiTransform={{
              width: '100%',
              height: UITheme.dimensions.border.medium,
              positionType: 'absolute',
              position: { top: 0, left: 0 }
            }}
            uiBackground={{ 
              color: disabled ? UITheme.colors.border : UITheme.colors.accent 
            }}
          />
          <UiEntity
            uiTransform={{
              width: '100%',
              height: UITheme.dimensions.border.medium,
              positionType: 'absolute',
              position: { bottom: 0, left: 0 }
            }}
            uiBackground={{ 
              color: disabled ? UITheme.colors.border : UITheme.colors.accent 
            }}
          />
        </UiEntity>
      )}
      
      {/* Button content */}
      <UiEntity
        uiTransform={{
          width: '100%',
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'row'
        }}
      >
        {icon && (
          <Label
            value={icon}
            fontSize={size === 'small' ? 14 : size === 'large' ? 20 : 16}
            color={textColor}
            textAlign="middle-center"
            uiTransform={{
              margin: { right: UITheme.spacing.xs }
            }}
          />
        )}
        <Label
          value={text}
          fontSize={size === 'small' ? 14 : size === 'large' ? 20 : 16}
          color={textColor}
          textAlign="middle-center"
        />
      </UiEntity>
    </UiEntity>
  )
}

