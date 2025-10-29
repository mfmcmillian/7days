/**
 * Interaction Prompt Component for Neural Collapse
 * Modern design with better visual hierarchy
 */

import ReactEcs, { UiEntity, Label } from '@dcl/sdk/react-ecs'
import { Color4 } from '@dcl/sdk/math'
import { UITheme } from '../UITheme'

export interface InteractionPromptProps {
  condition: boolean
  text: string
  color?: Color4
  icon?: string
  pulse?: boolean
}

export function InteractionPrompt({ 
  condition, 
  text, 
  color,
  icon = '►',
  pulse = false
}: InteractionPromptProps) {
  if (!condition) return null

  const promptColor = color || UITheme.colors.accent

  return (
    <UiEntity
      uiTransform={{
        width: '100%',
        height: 'auto',
        margin: { top: UITheme.spacing.xs },
        padding: UITheme.spacing.small,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center'
      }}
      uiBackground={{
        color: Color4.create(promptColor.r, promptColor.g, promptColor.b, 0.15)
      }}
    >
      {/* Pulse effect for important prompts */}
      {pulse && (
        <UiEntity
          uiTransform={{
            width: '100%',
            height: '100%',
            positionType: 'absolute',
            position: { top: 0, left: 0 }
          }}
          uiBackground={{
            color: Color4.create(promptColor.r, promptColor.g, promptColor.b, 0.2)
          }}
        />
      )}
      
      {/* Left border accent */}
      <UiEntity
        uiTransform={{
          width: 3,
          height: '100%',
          positionType: 'absolute',
          position: { left: 0, top: 0 }
        }}
        uiBackground={{
          color: promptColor
        }}
      />
      
      {/* Icon */}
      <Label
        value={icon}
        fontSize={UITheme.fontSize.medium}
        color={promptColor}
        textAlign="middle-left"
        uiTransform={{
          margin: { right: UITheme.spacing.small }
        }}
      />
      
      {/* Text */}
      <Label
        value={text}
        fontSize={UITheme.fontSize.base}
        color={UITheme.colors.text}
        textAlign="middle-left"
      />
    </UiEntity>
  )
}

