/**
 * Barricade Manager for Neural Collapse
 * Handles barricade placement, repair, and destruction
 */

import { engine, Transform, MeshRenderer, MeshCollider, Entity, Material } from '@dcl/sdk/ecs'
import { Vector3, Quaternion, Color4 } from '@dcl/sdk/math'
import { Barricade, GameState } from '../components/GameComponents'
import { gameStateEntity } from '../core/GameState'
import {
  BARRICADE_POSITIONS,
  BARRICADE_HEALTH,
  BARRICADE_BUILD_COST,
  BARRICADE_REPAIR_COST,
  BARRICADE_REPAIR_AMOUNT,
  MAX_BARRICADES
} from '../utils/constants'
import { playSound } from '../audio/SoundManager'

// Track active barricades
const activeBarricades = new Map<number, Entity>()

/**
 * Initialize barricade (spawn automatically on game start)
 */
export function initializeTestBarricades() {
  console.log('🛡️ Creating barricade...')

  // Create ONE big barricade in front of player
  const position = Vector3.create(-15, 1, 0) // Closer to player (player is at X=-20)

  const entity = engine.addEntity()

  Transform.create(entity, {
    position: position,
    rotation: Quaternion.fromEulerDegrees(0, 90, 0),
    scale: Vector3.create(15, 3, 0.5) // Wide (15 units), tall (3), thicker (0.5)
  })

  MeshRenderer.setBox(entity)
  Material.setPbrMaterial(entity, {
    albedoColor: Color4.create(0.4, 0.25, 0.15, 1) // Brown
  })
  MeshCollider.setBox(entity)

  Barricade.create(entity, {
    health: BARRICADE_HEALTH, // 400 HP base
    maxHealth: BARRICADE_HEALTH,
    position: position,
    slotIndex: 0 // Only one barricade
  })

  activeBarricades.set(0, entity)
  console.log(`🛡️ Barricade created at (${position.x}, ${position.y}, ${position.z})`)
}

/**
 * Create a barricade at a specific position
 */
export function createBarricade(slotIndex: number): Entity | null {
  if (slotIndex < 0 || slotIndex >= BARRICADE_POSITIONS.length) {
    console.error(`Invalid barricade slot: ${slotIndex}`)
    return null
  }

  // Check if barricade already exists at this slot
  if (activeBarricades.has(slotIndex)) {
    console.log(`Barricade already exists at slot ${slotIndex}`)
    return null
  }

  // Check if player has enough points
  const gameState = GameState.get(gameStateEntity)
  if (gameState.score < BARRICADE_BUILD_COST) {
    console.log('Not enough points to build barricade')
    playSound('noPoints', 'sounds/no-points.mp3')
    return null
  }

  const position = BARRICADE_POSITIONS[slotIndex]
  const barricadeEntity = engine.addEntity()

  // Create barricade as a stretched brown cube
  Transform.create(barricadeEntity, {
    position: Vector3.create(position.x, 1, position.z), // Raise it up 1m so it's visible
    rotation: Quaternion.fromEulerDegrees(0, 0, 0),
    scale: Vector3.create(3, 2, 0.3) // Wide (3m) x Tall (2m) x Thin (0.3m)
  })

  // Use a simple cube mesh - stretched to look like a wall/barricade
  MeshRenderer.setBox(barricadeEntity)

  // Make it bright red for now so it's VERY visible (testing)
  Material.setPbrMaterial(barricadeEntity, {
    albedoColor: Color4.create(1, 0, 0, 1) // Bright RED for visibility testing
  })

  // Add collision
  MeshCollider.setBox(barricadeEntity)

  console.log(`🛡️ BARRICADE CREATED at position: (${position.x}, ${position.y}, ${position.z})`)
  console.log(`🛡️ Barricade slot ${slotIndex} - Check if you can see a BIG RED WALL!`)

  // Add barricade component
  Barricade.create(barricadeEntity, {
    health: BARRICADE_HEALTH,
    maxHealth: BARRICADE_HEALTH,
    position: position,
    slotIndex: slotIndex
  })

  // Deduct points
  const mutableGameState = GameState.getMutable(gameStateEntity)
  mutableGameState.score -= BARRICADE_BUILD_COST

  // Track barricade
  activeBarricades.set(slotIndex, barricadeEntity)

  console.log(`Created barricade at slot ${slotIndex}`)
  playSound('sale', 'sounds/sale.mp3')

  return barricadeEntity
}

/**
 * Repair a damaged barricade
 */
export function repairBarricade(entity: Entity): boolean {
  const barricade = Barricade.getOrNull(entity)
  if (!barricade) return false

  // Check if barricade needs repair
  if (barricade.health >= barricade.maxHealth) {
    console.log('Barricade is already at full health')
    return false
  }

  // Check if player has enough points
  const gameState = GameState.get(gameStateEntity)
  if (gameState.score < BARRICADE_REPAIR_COST) {
    console.log('Not enough points to repair barricade')
    playSound('noPoints', 'sounds/no-points.mp3')
    return false
  }

  // Repair barricade
  const mutableBarricade = Barricade.getMutable(entity)
  mutableBarricade.health = Math.min(barricade.health + BARRICADE_REPAIR_AMOUNT, barricade.maxHealth)

  // Deduct points
  const mutableGameState = GameState.getMutable(gameStateEntity)
  mutableGameState.score -= BARRICADE_REPAIR_COST

  console.log(`Repaired barricade to ${mutableBarricade.health}/${mutableBarricade.maxHealth} health`)
  playSound('sale', 'sounds/sale.mp3')

  return true
}

/**
 * Repair barricade by a percentage (used during daytime)
 * @param healthPercent - Percentage to restore (0-100)
 */
export function repairAllBarricades(healthPercent: number): void {
  const entity = activeBarricades.get(0) // Get THE barricade

  if (entity) {
    // Barricade exists - repair it
    const barricade = Barricade.getOrNull(entity)
    if (!barricade) return

    const repairAmount = (barricade.maxHealth * healthPercent) / 100
    const mutableBarricade = Barricade.getMutable(entity)
    const oldHealth = barricade.health
    mutableBarricade.health = Math.min(barricade.health + repairAmount, barricade.maxHealth)

    console.log(
      `🛡️  repaired: ${Math.round(oldHealth)} → ${Math.round(mutableBarricade.health)}/${barricade.maxHealth}`
    )
  } else if (healthPercent >= 50) {
    // Barricade destroyed - rebuild it if 50%+ allocated
    const position = Vector3.create(-15, 1, 0) // Closer to player
    const newEntity = engine.addEntity()

    // Create all components fresh
    Transform.create(newEntity, {
      position: position,
      rotation: Quaternion.fromEulerDegrees(0, 90, 0),
      scale: Vector3.create(15, 3, 0.5) // Wide, tall, thick
    })

    MeshRenderer.setBox(newEntity)

    Material.setPbrMaterial(newEntity, {
      albedoColor: Color4.create(0.4, 0.25, 0.15, 1) // Brown
    })

    MeshCollider.setBox(newEntity)

    const initialHealth = (BARRICADE_HEALTH * healthPercent) / 100

    Barricade.create(newEntity, {
      health: initialHealth,
      maxHealth: BARRICADE_HEALTH,
      position: position,
      slotIndex: 0
    })

    activeBarricades.set(0, newEntity)
    console.log(`🛡️ Barricade REBUILT with ${Math.round(initialHealth)}/${BARRICADE_HEALTH} HP`)
  }
}

/**
 * Damage a barricade (called by zombie attacks)
 */
export function damageBarricade(entity: Entity, damage: number): boolean {
  const barricade = Barricade.getOrNull(entity)
  if (!barricade) return false

  const mutableBarricade = Barricade.getMutable(entity)
  mutableBarricade.health = Math.max(0, barricade.health - damage)

  console.log(`Barricade damaged! Health: ${mutableBarricade.health}/${barricade.maxHealth}`)

  // Destroy barricade if health reaches 0
  if (mutableBarricade.health <= 0) {
    destroyBarricade(entity)
    return true
  }

  return false
}

/**
 * Destroy a barricade
 */
export function destroyBarricade(entity: Entity) {
  const barricade = Barricade.getOrNull(entity)
  if (!barricade) return

  console.log(`Barricade at slot ${barricade.slotIndex} destroyed!`)

  // Remove from tracking
  activeBarricades.delete(barricade.slotIndex)

  // Remove entity
  engine.removeEntity(entity)
}

/**
 * Get barricade at a specific slot
 */
export function getBarricadeAtSlot(slotIndex: number): Entity | null {
  return activeBarricades.get(slotIndex) || null
}

/**
 * Get all active barricades
 */
export function getAllBarricades(): Entity[] {
  return Array.from(activeBarricades.values())
}

/**
 * Get number of active barricades
 */
export function getActiveBarricadeCount(): number {
  return activeBarricades.size
}

/**
 * Check if a barricade exists at a position
 */
export function hasBarricadeAtSlot(slotIndex: number): boolean {
  return activeBarricades.has(slotIndex)
}

/**
 * Remove all barricades (called on game reset)
 */
export function removeAllBarricades() {
  for (const entity of activeBarricades.values()) {
    engine.removeEntity(entity)
  }
  activeBarricades.clear()
  console.log('All barricades removed')
}

/**
 * Get nearest barricade to a position
 */
export function getNearestBarricade(position: Vector3): { entity: Entity; distance: number } | null {
  let nearestBarricade: Entity | null = null
  let nearestDistance = Infinity

  for (const [entity] of engine.getEntitiesWith(Barricade, Transform)) {
    const transform = Transform.get(entity)
    const distance = Vector3.distance(position, transform.position)

    if (distance < nearestDistance) {
      nearestDistance = distance
      nearestBarricade = entity
    }
  }

  if (nearestBarricade) {
    return { entity: nearestBarricade, distance: nearestDistance }
  }

  return null
}
