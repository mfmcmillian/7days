/**
 * Barricade System for Neural Collapse
 * Handles barricade interactions and visual updates
 */

import { engine, Transform, inputSystem, PointerEventType, InputAction } from '@dcl/sdk/ecs'
import { Vector3 } from '@dcl/sdk/math'
import { Barricade } from '../components/GameComponents'
import { getGamePhase, isPaused } from '../core/GameState'
import { createBarricade, repairBarricade, getNearestBarricade, hasBarricadeAtSlot } from '../features/BarricadeManager'
import { BARRICADE_POSITIONS, BARRICADE_BUILD_COST, BARRICADE_REPAIR_COST } from '../utils/constants'

// Track which barricade slot the player is looking at
let currentBarricadeSlot: number = -1
let isLookingAtBarricade: boolean = false

/**
 * Barricade Interaction System
 * Handles building and repairing barricades
 */
export function barricadeSystem(dt: number) {
  if (getGamePhase() !== 'playing') return
  if (isPaused()) return

  // Get player position
  const playerTransform = Transform.getOrNull(engine.PlayerEntity)
  if (!playerTransform) return

  const playerPosition = playerTransform.position

  // Check if player is near a barricade slot
  currentBarricadeSlot = -1
  isLookingAtBarricade = false

  for (let i = 0; i < BARRICADE_POSITIONS.length; i++) {
    const barricadePos = BARRICADE_POSITIONS[i]
    const distance = Vector3.distance(playerPosition, barricadePos)

    // If player is within 3 meters of a barricade slot
    if (distance < 3) {
      currentBarricadeSlot = i
      isLookingAtBarricade = true
      break
    }
  }

  // Handle barricade interaction (F key)
  if (isLookingAtBarricade && inputSystem.isPressed(InputAction.IA_ACTION_3)) {
    if (hasBarricadeAtSlot(currentBarricadeSlot)) {
      // Repair existing barricade
      const barricadeEntity = getNearestBarricade(BARRICADE_POSITIONS[currentBarricadeSlot])
      if (barricadeEntity) {
        repairBarricade(barricadeEntity.entity)
      }
    } else {
      // Build new barricade
      createBarricade(currentBarricadeSlot)
    }
  }
}

/**
 * Barricade Visual System
 * Updates barricade visuals based on health
 */
export function barricadeVisualSystem(dt: number) {
  if (getGamePhase() !== 'playing') return

  for (const [entity, barricade, transform] of engine.getEntitiesWith(Barricade, Transform)) {
    // Calculate health percentage
    const healthPercent = barricade.health / barricade.maxHealth

    // Update scale based on health (visual feedback)
    const mutableTransform = Transform.getMutable(entity)

    // Reduce height as health decreases (looks like it's breaking down)
    const baseScale = Vector3.create(15, 3, 0.5) // Base size
    const healthScale = Math.max(0.3, healthPercent) // Don't go below 30% scale

    mutableTransform.scale = Vector3.create(
      baseScale.x, // Keep width the same
      baseScale.y * healthScale, // Reduce height as it takes damage
      baseScale.z
    )
  }
}

/**
 * Get current barricade prompt text
 */
export function getCurrentBarricadePrompt(): string | null {
  if (!isLookingAtBarricade || currentBarricadeSlot === -1) return null

  if (hasBarricadeAtSlot(currentBarricadeSlot)) {
    return `[F] Repair Barricade (${BARRICADE_REPAIR_COST} points)`
  } else {
    return `[F] Build Barricade (${BARRICADE_BUILD_COST} points)`
  }
}
