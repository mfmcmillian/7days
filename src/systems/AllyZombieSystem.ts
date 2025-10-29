/**
 * Ally Zombie System
 * Manages ally zombies that fight alongside the player
 */

import { engine, Transform, GltfContainer, Animator, Entity, Schemas } from '@dcl/sdk/ecs'
import { Vector3, Quaternion } from '@dcl/sdk/math'
import { PlayerFighter } from './PlayerFighterSystem'
import { Health, AnimationState, DyingZombie, GameState } from '../components/GameComponents'
import { getGamePhase, isPaused, gameStateEntity } from '../core/GameState'
import { playSound } from '../audio/SoundManager'
import { showGameOver } from '../core/GameController'

const MAX_ALLIES = 15
const ALLY_FORMATION_SPACING = 1.5 // Space between allies
const MAX_ALLIES_PER_ROW = 10 // Max allies in first row before starting second row
const ALLY_HEALTH = 30 // Same as enemy zombies

// Component for ally zombies
export const AllyZombie = engine.defineComponent('ally::zombie', {
  health: Schemas.Number,
  maxHealth: Schemas.Number,
  formationIndex: Schemas.Int // Position in formation
})

let allyEntities: Entity[] = []
let allyCount = 0 // Current number of allies (not including player)

/**
 * Get current ally count
 */
export function getAllyCount(): number {
  return allyCount
}

/**
 * Get total zombie count (player + allies)
 */
export function getTotalZombieCount(): number {
  return 1 + allyCount // Player + allies
}

/**
 * Add allies
 */
export function addAllies(count: number): void {
  const newCount = Math.min(allyCount + count, MAX_ALLIES)
  const toAdd = newCount - allyCount

  console.log(`➕ Adding ${toAdd} allies (current: ${allyCount}, max: ${MAX_ALLIES})`)

  for (let i = 0; i < toAdd; i++) {
    createAllyZombie(allyCount)
    allyCount++
  }

  console.log(`✅ Now have ${allyCount} allies (${getTotalZombieCount()} total)`)
}

/**
 * Remove allies
 */
export function removeAllies(count: number): void {
  const toRemove = Math.min(count, allyCount)

  console.log(`➖ Removing ${toRemove} allies (current: ${allyCount})`)

  // Remove from the end of the formation
  for (let i = 0; i < toRemove; i++) {
    if (allyEntities.length > 0) {
      const ally = allyEntities.pop()
      if (ally) {
        engine.removeEntity(ally)
        allyCount--
      }
    }
  }

  console.log(`✅ Now have ${allyCount} allies (${getTotalZombieCount()} total)`)

  // Check for game over
  if (getTotalZombieCount() <= 0) {
    console.log('💀 No zombies left! Game Over!')
    showGameOver()
  }
}

/**
 * Create an ally zombie
 */
function createAllyZombie(formationIndex: number): Entity {
  const ally = engine.addEntity()

  // Start at player position (will be updated by formation system)
  Transform.create(ally, {
    position: Vector3.create(0, 0, 0),
    rotation: Quaternion.fromEulerDegrees(0, 90, 0), // Face right like player
    scale: Vector3.create(0.9, 0.9, 0.9) // Slightly smaller than player
  })

  // Add zombie model
  GltfContainer.create(ally, {
    src: 'models/zombie.glb',
    invisibleMeshesCollisionMask: 0,
    visibleMeshesCollisionMask: 0
  })

  // Add ally component
  AllyZombie.create(ally, {
    health: ALLY_HEALTH,
    maxHealth: ALLY_HEALTH,
    formationIndex
  })

  // Add animations
  Animator.create(ally, {
    states: [
      { clip: 'idle', playing: true, loop: true },
      { clip: 'walk', playing: false, loop: true },
      { clip: 'run', playing: false, loop: true },
      { clip: 'die', playing: false, loop: false }
    ]
  })

  AnimationState.create(ally, {
    currentClip: 'idle',
    nextClip: ''
  })

  allyEntities.push(ally)
  console.log(`🧟 Created ally zombie #${formationIndex + 1}`)

  return ally
}

/**
 * Update ally positions to follow player in formation
 */
export function allyFormationSystem(dt: number): void {
  if (getGamePhase() !== 'playing') return
  if (isPaused()) return

  // Get player fighter position
  const playerData = getPlayerFighterData()
  if (!playerData) return

  const playerPos = playerData.position
  const playerFighter = PlayerFighter.get(playerData.entity)

  // Arrange allies in formation next to player
  for (const [entity] of engine.getEntitiesWith(AllyZombie, Transform)) {
    const ally = AllyZombie.get(entity)
    const transform = Transform.getMutable(entity)

    // Calculate formation position
    // First 10 allies: line up on alternating sides (row 1)
    // Next 5 allies: line up behind (row 2)
    const index = ally.formationIndex

    let offsetZ = 0
    let offsetX = 0

    if (index < MAX_ALLIES_PER_ROW) {
      // First row: Allies line up on alternating sides of player
      const side = index % 2 === 0 ? 1 : -1 // Alternate left/right
      const positionInRow = Math.floor(index / 2) + 1 // How far from player
      offsetZ = side * positionInRow * ALLY_FORMATION_SPACING
      offsetX = 0 // Same X as player
    } else {
      // Second row: In front of player (higher X)
      const indexInSecondRow = index - MAX_ALLIES_PER_ROW
      const side = indexInSecondRow % 2 === 0 ? 1 : -1
      const positionInRow = Math.floor(indexInSecondRow / 2) + 1
      offsetZ = side * positionInRow * ALLY_FORMATION_SPACING
      offsetX = 2 // 2 units in front of player
    }

    // Position: Same or behind player X, offset Z based on formation
    const targetPos = Vector3.create(playerPos.x + offsetX, playerPos.y, playerPos.z + offsetZ)

    // Smooth movement toward formation position
    const lerpSpeed = 8.0 * dt
    transform.position = Vector3.lerp(transform.position, targetPos, lerpSpeed)

    // Face same direction as player (right, toward enemies)
    transform.rotation = Quaternion.fromEulerDegrees(0, 90, 0)

    // Play walk animation if moving, idle if player is idle
    const animator = Animator.getMutableOrNull(entity)
    if (animator && !DyingZombie.getOrNull(entity)) {
      const animState = AnimationState.getMutableOrNull(entity)
      if (animState) {
        const targetClip = playerFighter.isMoving ? 'walk' : 'idle'
        if (animState.currentClip !== targetClip) {
          Animator.playSingleAnimation(entity, targetClip, true)
          animState.currentClip = targetClip
        }
      }
    }
  }
}

/**
 * Get player fighter data
 */
function getPlayerFighterData(): { entity: Entity; position: Vector3 } | null {
  for (const [entity] of engine.getEntitiesWith(PlayerFighter, Transform)) {
    const transform = Transform.get(entity)
    return { entity, position: transform.position }
  }
  return null
}

/**
 * Handle ally taking damage
 */
export function damageAlly(allyEntity: Entity, damage: number): void {
  const ally = AllyZombie.getMutableOrNull(allyEntity)
  if (!ally || DyingZombie.getOrNull(allyEntity)) return

  ally.health -= damage

  if (ally.health <= 0) {
    handleAllyDeath(allyEntity)
  }
}

/**
 * Handle ally death
 */
function handleAllyDeath(allyEntity: Entity): void {
  console.log(`💀 Ally zombie died!`)

  // Play death sound
  playSound('die')

  // Play death animation
  const animator = Animator.getOrNull(allyEntity)
  if (animator) {
    Animator.stopAllAnimations(allyEntity, false)
    Animator.playSingleAnimation(allyEntity, 'die', true)

    const animState = AnimationState.getMutableOrNull(allyEntity)
    if (animState) {
      animState.currentClip = 'die'
      animState.nextClip = ''
    }
  }

  // Mark as dying
  DyingZombie.create(allyEntity, {
    deathStartTime: Date.now()
  })

  // Remove from allies list
  const index = allyEntities.indexOf(allyEntity)
  if (index !== -1) {
    allyEntities.splice(index, 1)
    allyCount--

    // Reindex remaining allies
    reindexAllies()
  }

  console.log(`❌ Ally died. Remaining: ${allyCount} allies (${getTotalZombieCount()} total)`)

  // Check for game over
  if (getTotalZombieCount() <= 0) {
    console.log('💀 No zombies left! Game Over!')
    showGameOver()
  }
}

/**
 * Reindex allies after one is removed
 */
function reindexAllies(): void {
  for (let i = 0; i < allyEntities.length; i++) {
    const ally = allyEntities[i]
    const allyComp = AllyZombie.getMutableOrNull(ally)
    if (allyComp) {
      allyComp.formationIndex = i
    }
  }
}

/**
 * Dying ally system - removes allies after death animation
 */
export function dyingAllySystem(dt: number): void {
  const currentTime = Date.now()
  const deathAnimationDuration = 2000 // 2 seconds

  for (const [entity] of engine.getEntitiesWith(AllyZombie, DyingZombie)) {
    const dyingZombie = DyingZombie.get(entity)

    // Remove ally after death animation completes
    if (currentTime - dyingZombie.deathStartTime >= deathAnimationDuration) {
      console.log(`Removing dead ally entity`)
      engine.removeEntity(entity)
    }
  }
}

/**
 * Reset ally system
 */
export function resetAllySystem(): void {
  // Remove all allies
  for (const ally of allyEntities) {
    engine.removeEntity(ally)
  }
  allyEntities = []
  allyCount = 0
  console.log('✅ Ally system reset')
}

/**
 * Remove all allies (for scene cleanup)
 */
export function removeAllAllies(): void {
  for (const ally of allyEntities) {
    engine.removeEntity(ally)
  }
  allyEntities = []
  allyCount = 0
  console.log('🧹 All allies removed')
}
