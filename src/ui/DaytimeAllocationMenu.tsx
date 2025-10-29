/**
 * Daytime Allocation Menu
 * Allocate 12 hours to Barricade, Allies, or Scavenge
 */

import ReactEcs, { Label, UiEntity, Button } from '@dcl/sdk/react-ecs'
import { Color4 } from '@dcl/sdk/math'
import { UITheme } from './UITheme'

export interface DaytimeAllocationProps {
  onComplete: (barricadeHours: number, allyHours: number, scavengeHours: number) => void
}

const TOTAL_HOURS = 12

// State variables
let barricadeHours = 0
let allyHours = 0
let scavengeHours = 0
let forceUpdateCounter = 0 // Force re-render on changes

export function DaytimeAllocationMenu({ onComplete }: DaytimeAllocationProps) {
  // Recalculate every render
  const hoursUsed = barricadeHours + allyHours + scavengeHours
  const hoursRemaining = TOTAL_HOURS - hoursUsed
  const canContinue = hoursRemaining === 0

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
          margin: { bottom: 40 }
        }}
      >
        <Label
          value="DAYTIME - PREPARE FOR THE NIGHT"
          fontSize={36}
          color={Color4.create(1, 0.8, 0, 1)}
          textAlign="middle-center"
        />
      </UiEntity>

      {/* Hours Remaining */}
      <UiEntity
        uiTransform={{
          width: 'auto',
          height: 'auto',
          margin: { bottom: 30 }
        }}
      >
        <Label
          value={`Hours Remaining: ${hoursRemaining} / ${TOTAL_HOURS}`}
          fontSize={28}
          color={hoursRemaining === 0 ? Color4.Green() : hoursRemaining < 0 ? Color4.Red() : Color4.White()}
          textAlign="middle-center"
        />
      </UiEntity>

      {/* Activities Container */}
      <UiEntity
        uiTransform={{
          width: 800,
          height: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: 20
        }}
        uiBackground={{
          color: Color4.create(0.1, 0.1, 0.1, 0.8)
        }}
      >
        {/* Barricade */}
        <ActivityRow
          title="FORTIFY BARRICADE"
          description="Strengthen defenses (Placeholder)"
          hours={barricadeHours}
          canIncrement={hoursRemaining > 0}
          canDecrement={barricadeHours > 0}
          onIncrement={() => {
            barricadeHours++
            forceUpdateCounter++
          }}
          onDecrement={() => {
            barricadeHours--
            forceUpdateCounter++
          }}
        />

        {/* Allies */}
        <ActivityRow
          title="SEARCH FOR SURVIVORS"
          description="Find allies to fight alongside you"
          hours={allyHours}
          canIncrement={hoursRemaining > 0}
          canDecrement={allyHours > 0}
          onIncrement={() => {
            allyHours++
            forceUpdateCounter++
          }}
          onDecrement={() => {
            allyHours--
            forceUpdateCounter++
          }}
        />

        {/* Scavenge */}
        <ActivityRow
          title="SCAVENGE FOR WEAPONS"
          description="Raid buildings for better guns"
          hours={scavengeHours}
          canIncrement={hoursRemaining > 0}
          canDecrement={scavengeHours > 0}
          onIncrement={() => {
            scavengeHours++
            forceUpdateCounter++
          }}
          onDecrement={() => {
            scavengeHours--
            forceUpdateCounter++
          }}
        />
      </UiEntity>

      {/* Continue Button */}
      <UiEntity
        uiTransform={{
          width: 300,
          height: 60,
          margin: { top: 40 }
        }}
      >
        <Button
          value={
            canContinue
              ? 'CONTINUE'
              : hoursRemaining > 0
              ? `Allocate ${hoursRemaining} more hours`
              : `Remove ${Math.abs(hoursRemaining)} hours`
          }
          variant="primary"
          uiTransform={{ width: '100%', height: '100%' }}
          fontSize={24}
          disabled={!canContinue}
          onMouseDown={() => {
            if (canContinue) {
              console.log(`📊 Allocation: Barricade=${barricadeHours}, Allies=${allyHours}, Scavenge=${scavengeHours}`)
              onComplete(barricadeHours, allyHours, scavengeHours)
            }
          }}
        />
      </UiEntity>

      {/* Instructions */}
      <UiEntity
        uiTransform={{
          width: 'auto',
          height: 'auto',
          margin: { top: 20 }
        }}
      >
        <Label
          value="Allocate all 12 hours to continue"
          fontSize={16}
          color={Color4.create(0.7, 0.7, 0.7, 1)}
          textAlign="middle-center"
        />
      </UiEntity>

      {/* Hidden element that changes to force re-render */}
      <UiEntity
        uiTransform={{
          width: 0,
          height: 0,
          display: 'none'
        }}
      >
        <Label value={`${forceUpdateCounter}`} fontSize={1} />
      </UiEntity>
    </UiEntity>
  )
}

/**
 * Activity Row Component
 */
function ActivityRow({
  title,
  description,
  hours,
  canIncrement,
  canDecrement,
  onIncrement,
  onDecrement
}: {
  title: string
  description: string
  hours: number
  canIncrement: boolean
  canDecrement: boolean
  onIncrement: () => void
  onDecrement: () => void
}) {
  return (
    <UiEntity
      uiTransform={{
        width: '100%',
        height: 100,
        margin: { bottom: 15 },
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
      {/* Left: Title & Description */}
      <UiEntity
        uiTransform={{
          width: 400,
          height: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start'
        }}
      >
        <Label
          value={title}
          fontSize={20}
          color={Color4.White()}
          textAlign="middle-left"
          uiTransform={{ margin: { bottom: 5 } }}
        />
        <Label
          value={description}
          fontSize={14}
          color={Color4.create(0.7, 0.7, 0.7, 1)}
          textAlign="middle-left"
        />
      </UiEntity>

      {/* Right: Controls */}
      <UiEntity
        uiTransform={{
          width: 200,
          height: 'auto',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-end'
        }}
      >
        {/* Minus Button */}
        <Button
          value="-"
          variant="primary"
          uiTransform={{ width: 50, height: 50, margin: { right: 10 } }}
          fontSize={28}
          disabled={!canDecrement}
          onMouseDown={onDecrement}
        />

        {/* Hours Display */}
        <UiEntity
          uiTransform={{
            width: 60,
            height: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          uiBackground={{
            color: Color4.create(0, 0, 0, 0.8)
          }}
        >
          <Label
            value={`${hours}h`}
            fontSize={22}
            color={Color4.create(0, 1, 0.5, 1)}
            textAlign="middle-center"
          />
        </UiEntity>

        {/* Plus Button */}
        <Button
          value="+"
          variant="primary"
          uiTransform={{ width: 50, height: 50, margin: { left: 10 } }}
          fontSize={28}
          disabled={!canIncrement}
          onMouseDown={onIncrement}
        />
      </UiEntity>
    </UiEntity>
  )
}

/**
 * Reset allocation state
 */
export function resetDaytimeAllocation() {
  barricadeHours = 0
  allyHours = 0
  scavengeHours = 0
  forceUpdateCounter = 0
  console.log('✅ Daytime allocation reset')
}
