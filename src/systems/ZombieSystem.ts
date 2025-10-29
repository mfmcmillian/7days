/**
 * Zombie AI System for Neural Collapse
 * Handles zombie movement, pathfinding, and attacks
 * NOW TARGETS THE PLAYER FIGHTER (zombie) instead of player avatar
 * Zombies will attack barricades if they're in the way
 */

import { engine, Transform, Animator, Entity } from '@dcl/sdk/ecs'
import { Vector3, Quaternion } from '@dcl/sdk/math'
import { Zombie, Health, DyingZombie, GameState, AnimationState, Barricade } from '../components/GameComponents'
import { gameStateEntity, getGamePhase, isPaused } from '../core/GameState'
import { playZombieAttackSound } from '../audio/SoundManager'
import { showGameOver } from '../core/GameController'
import { PlayerFighter } from './PlayerFighterSystem'
import { getNearestBarricade, damageBarricade } from '../features/BarricadeManager'

// Track zombie attack cooldowns and active sounds
const zombieAttackCooldowns = new Map<number, number>()
const activeZombieAttackSounds = new Map<number, number>()

/**
 * Get the player fighter entity (zombie we control)
 */
function getPlayerFighterEntity(): { entity: Entity; position: Vector3 } | null {
  for (const [entity, fighter] of engine.getEntitiesWith(PlayerFighter, Transform)) {
    const transform = Transform.get(entity)
    return { entity, position: transform.position }
  }
  return null
}

/**
 * Zombie AI System - handles movement and attacks
 * NOW ATTACKS THE FIGHTER ZOMBIE, NOT THE PLAYER AVATAR
 */
export function zombieSystem(dt: number) {
  if (getGamePhase() !== 'playing') return
  if (isPaused()) return

  // Get the player's fighter (zombie we control)
  const playerFighterData = getPlayerFighterEntity()
  if (!playerFighterData) return

  const playerPosition = playerFighterData.position
  const playerFighterEntity = playerFighterData.entity

  const gameState = GameState.get(gameStateEntity)
  const baseSpeed = 0.5 + gameState.currentWave * 0.2

  // Distance zombies run straight before turning toward player
  const STRAIGHT_RUN_DISTANCE = 10 // Run straight for 10 units before turning

  for (const [entity, zombie, transform] of engine.getEntitiesWith(Zombie, Transform)) {
    // Skip if zombie is dying
    if (DyingZombie.getOrNull(entity)) continue

    const mutableTransform = Transform.getMutable(entity)
    const mutableZombie = Zombie.getMutable(entity)

    // Calculate how far zombie has traveled from spawn
    const distanceTraveled = mutableZombie.spawnPositionX - mutableTransform.position.x

    // PRIORITY: Check if there's ANY barricade between zombie and player
    // Zombies MUST destroy barricades before they can reach player
    let nearestBarricadeInPath: { entity: Entity; distance: number } | null = null
    let minBarricadeDistance = Infinity

    for (const [barricadeEntity] of engine.getEntitiesWith(Barricade, Transform)) {
      const barricadeTransform = Transform.get(barricadeEntity)

      // Only consider barricades that are between the zombie and the player
      // Player is at X=-20, zombie is at higher X value
      if (barricadeTransform.position.x > mutableTransform.position.x) {
        continue // Barricade is behind zombie, ignore it
      }

      const distance = Vector3.distance(mutableTransform.position, barricadeTransform.position)
      if (distance < minBarricadeDistance) {
        minBarricadeDistance = distance
        nearestBarricadeInPath = { entity: barricadeEntity, distance }
      }
    }

    // If there's a barricade in the path (within 5 meters), zombie MUST attack it
    const isBarricadeBlocking = nearestBarricadeInPath && nearestBarricadeInPath.distance < 5

    if (isBarricadeBlocking && nearestBarricadeInPath) {
      const barricadeEntity = nearestBarricadeInPath.entity
      const barricadeTransform = Transform.get(barricadeEntity)

      // Move toward the barricade
      const directionToBarricade = Vector3.create(
        barricadeTransform.position.x - mutableTransform.position.x,
        0,
        barricadeTransform.position.z - mutableTransform.position.z
      )
      const distanceToBarricade = Vector3.length(directionToBarricade)

      if (distanceToBarricade > 1.5) {
        // Move toward barricade
        const normalizedDirection = Vector3.scale(directionToBarricade, 1 / distanceToBarricade)
        const zombieSpeed = zombie.speed || baseSpeed

        mutableTransform.position = Vector3.create(
          mutableTransform.position.x + normalizedDirection.x * zombieSpeed * dt,
          mutableTransform.position.y,
          mutableTransform.position.z + normalizedDirection.z * zombieSpeed * dt
        )

        // Face the barricade
        const angleToBarricade = Math.atan2(directionToBarricade.x, directionToBarricade.z)
        mutableTransform.rotation = Quaternion.fromEulerDegrees(0, angleToBarricade * (180 / Math.PI), 0)

        // Use walk animation
        const animState = AnimationState.getOrNull(entity)
        if (animState && animState.currentClip === 'attack') {
          const movementClip = animState.nextClip || 'walk'
          const moveAnim = Animator.getClip(entity, movementClip)
          const attackAnim = Animator.getClip(entity, 'attack')
          attackAnim.playing = false
          attackAnim.weight = 0
          moveAnim.playing = true
          moveAnim.weight = 1
          AnimationState.getMutable(entity).currentClip = movementClip
        }
      } else {
        // Close enough to barricade - ATTACK IT!
        const animState = AnimationState.getOrNull(entity)
        if (!animState) continue

        // Switch to attack animation
        if (animState.currentClip !== 'attack') {
          const movementClip = animState.nextClip || 'walk'
          const attackAnim = Animator.getClip(entity, 'attack')
          const moveAnim = Animator.getClip(entity, movementClip)
          moveAnim.playing = false
          moveAnim.weight = 0
          attackAnim.playing = true
          attackAnim.weight = 1
          AnimationState.getMutable(entity).currentClip = 'attack'
        }

        // Attack barricade
        const lastAttackTime = zombieAttackCooldowns.get(entity) || 0
        const currentTime = Date.now()
        const attackCooldown = 1000 // 1 second between attacks

        if (currentTime - lastAttackTime >= attackCooldown) {
          damageBarricade(barricadeEntity, zombie.damage)
          zombieAttackCooldowns.set(entity, currentTime)

          if (!activeZombieAttackSounds.has(entity)) {
            const soundEntity = playZombieAttackSound(mutableTransform.position)
            activeZombieAttackSounds.set(entity, soundEntity)
          }
        }
      }

      continue // Skip player targeting - barricade blocks the way
    }

    // NO BARRICADES IN THE WAY - now zombie can target player
    // Calculate direction to player
    const direction = Vector3.create(
      playerPosition.x - mutableTransform.position.x,
      0,
      playerPosition.z - mutableTransform.position.z
    )
    const distance = Vector3.length(direction)

    // Get zombie speed from component
    const zombieSpeed = zombie.speed || baseSpeed

    const animState = AnimationState.getOrNull(entity)
    if (!animState) continue

    if (distance > 1.5) {
      // Determine if zombie should run straight or turn toward player
      if (!mutableZombie.hasTurned && distanceTraveled < STRAIGHT_RUN_DISTANCE) {
        // PHASE 1: Run straight forward (toward lower X, which is toward camera/player area)
        const newPosition = Vector3.create(
          mutableTransform.position.x - zombieSpeed * dt, // Move forward (decrease X)
          mutableTransform.position.y, // Keep at ground level
          mutableTransform.position.z // Stay in lane
        )
        mutableTransform.position = newPosition

        // Keep facing straight forward (270° = toward player/camera)
        mutableTransform.rotation = Quaternion.fromEulerDegrees(0, 270, 0)
      } else {
        // PHASE 2: Turn and track player (after running straight)
        if (!mutableZombie.hasTurned) {
          mutableZombie.hasTurned = true
          console.log(`🧟 Zombie ${entity} switching to tracking mode`)
        }

        const normalizedDirection = Vector3.scale(direction, 1 / distance)

        // Move toward player in both X and Z
        const newPosition = Vector3.create(
          mutableTransform.position.x + normalizedDirection.x * zombieSpeed * dt,
          mutableTransform.position.y, // Keep at ground level
          mutableTransform.position.z + normalizedDirection.z * zombieSpeed * dt
        )

        mutableTransform.position = newPosition

        // Make zombies face the player fighter
        const angle = Math.atan2(direction.x, direction.z)
        mutableTransform.rotation = Quaternion.fromEulerDegrees(0, angle * (180 / Math.PI), 0)
      }

      // Switch back to movement animation if currently attacking
      if (animState.currentClip === 'attack') {
        const movementClip = animState.nextClip || 'walk'
        const moveAnim = Animator.getClip(entity, movementClip)
        const attackAnim = Animator.getClip(entity, 'attack')

        attackAnim.playing = false
        attackAnim.weight = 0
        moveAnim.playing = true
        moveAnim.weight = 1

        AnimationState.getMutable(entity).currentClip = movementClip
      }
    } else {
      // Switch to attack animation only if not already attacking
      if (animState.currentClip !== 'attack') {
        const movementClip = animState.nextClip || 'walk'
        const attackAnim = Animator.getClip(entity, 'attack')
        const moveAnim = Animator.getClip(entity, movementClip)

        moveAnim.playing = false
        moveAnim.weight = 0
        attackAnim.playing = true
        attackAnim.weight = 1

        AnimationState.getMutable(entity).currentClip = 'attack'
      }

      const lastAttackTime = zombieAttackCooldowns.get(entity) || 0
      const currentTime = Date.now()
      const attackCooldown = 1000 // 1 second between attacks

      if (currentTime - lastAttackTime >= attackCooldown) {
        // Deal damage to player FIGHTER (not avatar)
        // Use getMutable to modify health
        const mutableFighter = PlayerFighter.getMutable(playerFighterEntity)
        mutableFighter.health -= zombie.damage

        console.log(`Zombie ${entity} attacking fighter, health: ${mutableFighter.health}`)

        // Play attack sound - only if this zombie doesn't already have one playing
        if (!activeZombieAttackSounds.has(entity)) {
          const soundEntity = playZombieAttackSound(mutableTransform.position)
          activeZombieAttackSounds.set(entity, soundEntity)
        }

        // Update zombie's last attack time
        zombieAttackCooldowns.set(entity, currentTime)

        // Check for game over
        if (mutableFighter.health <= 0) {
          console.log('Fighter died! Showing game over...')
          showGameOver()
        }
      }
    }
  }
}

/**
 * Dying Zombie System - handles zombie death animations
 */
export function dyingZombieSystem(dt: number) {
  const currentTime = Date.now()
  const deathAnimationDuration = 2000 // 2 seconds

  for (const [entity, dyingZombie] of engine.getEntitiesWith(DyingZombie, Animator)) {
    const animator = Animator.get(entity)
    const dieClip = animator.states.find((state) => state.clip === 'die')

    if (!dieClip) continue

    // Ensure die animation is playing
    if (!dieClip.playing) {
      Animator.playSingleAnimation(entity, 'die', true)
    }

    // Remove zombie after death animation completes
    if (currentTime - dyingZombie.deathStartTime >= deathAnimationDuration) {
      console.log(`Removing zombie ${entity} after die animation`)
      Animator.stopAllAnimations(entity, true)
      engine.removeEntity(entity)
    }
  }
}

/**
 * Clean up zombie sounds when zombie is removed
 */
export function cleanupZombieSounds(entity: Entity) {
  activeZombieAttackSounds.delete(entity)
  zombieAttackCooldowns.delete(entity)
}
