/**
 * Health Bar Component for Neural Collapse
 * Modern glass-morphism design with smooth animations
 */

import ReactEcs, { UiEntity, Label } from '@dcl/sdk/react-ecs'
import { Color4 } from '@dcl/sdk/math'
import { UITheme } from '../UITheme'

export interface HealthBarProps {
  currentHealth: number
  maxHealth: number
}

export function HealthBar({ currentHealth, maxHealth }: HealthBarProps) {
  const healthPercentage = Math.max(0, (currentHealth / maxHealth) * 100)
  
  // Dynamic health color
  const healthColor = 
    healthPercentage > 60 ? UITheme.colors.success :
    healthPercentage > 30 ? UITheme.colors.warning :
    UITheme.colors.danger
  
  const healthGlow = 
    healthPercentage > 60 ? UITheme.colors.successGlow :
    healthPercentage > 30 ? UITheme.colors.warningGlow :
    UITheme.colors.dangerGlow

  return (
    <UiEntity
      uiTransform={{
        width: 420,
        height: 'auto',
        positionType: 'absolute',
        position: { bottom: UITheme.spacing.large, left: UITheme.spacing.large },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start'
      }}
    >
      {/* Glass card container */}
      <UiEntity
        uiTransform={{
          width: '100%',
          height: 'auto',
          padding: UITheme.spacing.medium,
          display: 'flex',
          flexDirection: 'column'
        }}
        uiBackground={{
          color: UITheme.colors.glass
        }}
      >
        {/* Top border accent */}
        <UiEntity
          uiTransform={{
            width: '100%',
            height: 2,
            positionType: 'absolute',
            position: { top: 0, left: 0 }
          }}
          uiBackground={{
            color: healthColor
          }}
        />
        
        {/* Header with icon and value */}
        <UiEntity
          uiTransform={{
            width: '100%',
            height: 24,
            margin: { bottom: UITheme.spacing.small },
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <UiEntity
            uiTransform={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center'
            }}
          >
            <Label
              value="♥"
              fontSize={UITheme.fontSize.large}
              color={healthColor}
              textAlign="middle-left"
              uiTransform={{
                margin: { right: UITheme.spacing.small }
              }}
            />
            <Label
              value="HEALTH"
              fontSize={UITheme.fontSize.small}
              color={UITheme.colors.textSecondary}
              textAlign="middle-left"
            />
          </UiEntity>
          
          <Label
            value={`${Math.max(0, Math.floor(currentHealth))} / ${maxHealth}`}
            fontSize={UITheme.fontSize.base}
            color={UITheme.colors.text}
            textAlign="middle-right"
          />
        </UiEntity>
        
        {/* Health bar container with border */}
        <UiEntity
          uiTransform={{
            width: '100%',
            height: 36
          }}
          uiBackground={{
            color: UITheme.colors.glassDark
          }}
        >
          {/* Health bar fill */}
          <UiEntity
            uiTransform={{
              width: `${healthPercentage}%`,
              height: '100%',
              padding: 2
            }}
            uiBackground={{
              color: healthColor
            }}
          >
            {/* Inner glow effect */}
            <UiEntity
              uiTransform={{
                width: '100%',
                height: '100%'
              }}
              uiBackground={{
                color: Color4.create(1, 1, 1, 0.2)
              }}
            />
          </UiEntity>
          
          {/* Pulse glow when low health */}
          {healthPercentage < 30 && (
            <UiEntity
              uiTransform={{
                width: '100%',
                height: '100%',
                positionType: 'absolute',
                position: { top: 0, left: 0 }
              }}
              uiBackground={{
                color: healthGlow
              }}
            />
          )}
          
          {/* Top border */}
          <UiEntity
            uiTransform={{
              width: '100%',
              height: 1,
              positionType: 'absolute',
              position: { top: 0, left: 0 }
            }}
            uiBackground={{
              color: UITheme.colors.border
            }}
          />
          
          {/* Bottom border */}
          <UiEntity
            uiTransform={{
              width: '100%',
              height: 1,
              positionType: 'absolute',
              position: { bottom: 0, left: 0 }
            }}
            uiBackground={{
              color: UITheme.colors.border
            }}
          />
        </UiEntity>
        
        {/* Low health warning */}
        {healthPercentage < 30 && (
          <UiEntity
            uiTransform={{
              width: '100%',
              height: 20,
              margin: { top: UITheme.spacing.small },
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <Label
              value="⚠ LOW HEALTH"
              fontSize={UITheme.fontSize.small}
              color={UITheme.colors.danger}
              textAlign="middle-center"
            />
          </UiEntity>
        )}
      </UiEntity>
    </UiEntity>
  )
}

