/**
 * Daytime Results Screen
 * Shows the outcome of daytime activities
 */

import ReactEcs, { Label, UiEntity, Button } from '@dcl/sdk/react-ecs'
import { Color4 } from '@dcl/sdk/math'
import { UITheme } from './UITheme'

export interface DaytimeResultsProps {
  alliesFound: number
  weaponFound: string | null
  barricadeHealth: number
  weaponInventory: string[]
  onContinue: (selectedWeapon: string) => void
}

let startTime = 0
let selectedWeapon: string | null = null
const MIN_DISPLAY_TIME = 2000 // Must show for at least 2 seconds

export function DaytimeResultsScreen({
  alliesFound,
  weaponFound,
  barricadeHealth,
  weaponInventory,
  onContinue
}: DaytimeResultsProps) {
  const currentTime = Date.now()

  // Initialize on first render
  if (startTime === 0) {
    startTime = currentTime
    // Default to first weapon in inventory (current weapon)
    selectedWeapon = weaponInventory[0] || 'Pistol'
    console.log(`📊 Results: Allies=${alliesFound}, Weapon=${weaponFound}, Barricade=${barricadeHealth}%`)
  }

  const elapsed = currentTime - startTime
  const canContinue = elapsed >= MIN_DISPLAY_TIME

  // Fade in effect
  const fadeTime = 500
  let opacity = 1
  if (elapsed < fadeTime) {
    opacity = elapsed / fadeTime
  }

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
        color: Color4.create(0, 0, 0, 0.95)
      }}
    >
      {/* Title */}
      <UiEntity
        uiTransform={{
          width: 'auto',
          height: 'auto',
          margin: { bottom: 50 }
        }}
      >
        <Label
          value="DAY'S END - RESULTS"
          fontSize={42}
          color={Color4.create(1, 0.8, 0, opacity)}
          textAlign="middle-center"
        />
      </UiEntity>

      {/* Results Container */}
      <UiEntity
        uiTransform={{
          width: 700,
          height: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: 30
        }}
        uiBackground={{
          color: Color4.create(0.1, 0.1, 0.1, 0.9)
        }}
      >
        {/* Allies Result */}
        <ResultItem
          icon=""
          label="SURVIVORS FOUND"
          value={alliesFound > 0 ? `+${alliesFound} Ally${alliesFound > 1 ? 's' : ''}` : 'None'}
          valueColor={alliesFound > 0 ? Color4.Green() : Color4.create(0.7, 0.7, 0.7, 1)}
          opacity={opacity}
        />

        {/* Weapon Result */}
        <ResultItem
          icon=""
          label="WEAPONS SCAVENGED"
          value={weaponFound || 'None'}
          valueColor={weaponFound ? Color4.create(0, 0.8, 1, 1) : Color4.create(0.7, 0.7, 0.7, 1)}
          opacity={opacity}
        />

        {/* Barricade Result */}
        <ResultItem
          icon=""
          label="BARRICADE HEALTH"
          value={`${barricadeHealth}%`}
          valueColor={
            barricadeHealth >= 80
              ? Color4.Green()
              : barricadeHealth >= 50
              ? Color4.Yellow()
              : Color4.Red()
          }
          opacity={opacity}
        />
      </UiEntity>

      {/* Weapon Selection Section */}
      <UiEntity
        uiTransform={{
          width: 700,
          height: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: 20,
          margin: { top: 30 }
        }}
        uiBackground={{
          color: Color4.create(0.15, 0.15, 0.15, 0.9)
        }}
      >
        <Label
          value="SELECT YOUR WEAPON"
          fontSize={24}
          color={Color4.create(1, 0.8, 0, opacity)}
          textAlign="middle-center"
          uiTransform={{ margin: { bottom: 15 } }}
        />

        {/* Weapon buttons */}
        <UiEntity
          uiTransform={{
            width: '100%',
            height: 'auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          {weaponInventory.map((weapon, index) => {
            const isSelected = weapon === selectedWeapon
            const isNewWeapon = weapon === weaponFound

            return (
              <UiEntity
                key={`weapon-${index}`}
                uiTransform={{
                  width: '90%',
                  height: 60,
                  margin: { bottom: 10 },
                  padding: 10,
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
                uiBackground={{
                  color: isSelected
                    ? Color4.create(0, 0.6, 0.2, 0.8)
                    : Color4.create(0.25, 0.25, 0.25, 0.6)
                }}
              >
                <Label
                  value={`${weapon}${isNewWeapon ? ' [NEW!]' : ''}`}
                  fontSize={20}
                  color={Color4.White()}
                  textAlign="middle-left"
                />

                <Button
                  value={isSelected ? '✓ EQUIPPED' : 'SELECT'}
                  variant="primary"
                  uiTransform={{ width: 150, height: 45 }}
                  fontSize={18}
                  disabled={isSelected}
                  onMouseDown={() => {
                    selectedWeapon = weapon
                    console.log(`🔫 Selected weapon: ${weapon}`)
                  }}
                />
              </UiEntity>
            )
          })}
        </UiEntity>
      </UiEntity>

      {/* Continue Button */}
      <UiEntity
        uiTransform={{
          width: 350,
          height: 70,
          margin: { top: 30 }
        }}
      >
        <Button
          value={canContinue ? 'PREPARE FOR THE NIGHT' : `...`}
          variant="primary"
          uiTransform={{ width: '100%', height: '100%' }}
          fontSize={24}
          disabled={!canContinue}
          onMouseDown={() => {
            if (canContinue && selectedWeapon) {
              console.log('🌙 Proceeding to night...')
              const weapon = selectedWeapon
              startTime = 0 // Reset for next use
              selectedWeapon = null
              onContinue(weapon)
            }
          }}
        />
      </UiEntity>

      {/* Wait hint */}
      {!canContinue && (
        <UiEntity
          uiTransform={{
            width: 'auto',
            height: 'auto',
            margin: { top: 15 }
          }}
        >
          <Label
            value="Processing results..."
            fontSize={16}
            color={Color4.create(0.7, 0.7, 0.7, opacity)}
            textAlign="middle-center"
          />
        </UiEntity>
      )}
    </UiEntity>
  )
}

/**
 * Result Item Component
 */
function ResultItem({
  icon,
  label,
  value,
  valueColor,
  opacity
}: {
  icon: string
  label: string
  value: string
  valueColor: Color4
  opacity: number
}) {
  return (
    <UiEntity
      uiTransform={{
        width: '100%',
        height: 80,
        margin: { bottom: 20 },
        padding: 15,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}
      uiBackground={{
        color: Color4.create(0.2, 0.2, 0.2, 0.6)
      }}
    >
      {/* Left: Icon & Label */}
      <UiEntity
        uiTransform={{
          width: 'auto',
          height: 'auto',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center'
        }}
      >
        <Label
          value={icon}
          fontSize={32}
          textAlign="middle-left"
          uiTransform={{ margin: { right: 15 } }}
        />
        <Label
          value={label}
          fontSize={20}
          color={Color4.create(1, 1, 1, opacity)}
          textAlign="middle-left"
        />
      </UiEntity>

      {/* Right: Value */}
      <Label
        value={value}
        fontSize={28}
        color={Color4.create(valueColor.r, valueColor.g, valueColor.b, opacity)}
        textAlign="middle-right"
      />
    </UiEntity>
  )
}

/**
 * Reset results screen state
 */
export function resetDaytimeResults() {
  startTime = 0
  selectedWeapon = null
  console.log('✅ Daytime results reset')
}

