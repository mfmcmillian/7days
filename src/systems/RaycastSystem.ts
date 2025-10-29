/**
 * Raycast System for Neural Collapse
 * Handles hit detection and damage calculation
 */

import { engine, RaycastResult, Transform, GltfContainer, Animator, MeshRenderer, Material, Entity } from '@dcl/sdk/ecs'
import { Vector3, Color4, Quaternion } from '@dcl/sdk/math'
import {
  Zombie,
  Health,
  DyingZombie,
  Weapon,
  Player,
  PlayerBuffs,
  GameState,
  ScoreIndicator,
  PowerUp,
  ExecutionersChestMachine,
  AnimationState
} from '../components/GameComponents'
import { playerEntity, gameStateEntity, addScore, isPaused } from '../core/GameState'
import { playZombieDeathSound } from '../audio/SoundManager'
import { cleanupZombieSounds } from './ZombieSystem'
import { createPowerUp, getRandomPowerUpType } from '../features/PowerUpManager'
import { checkWaveCompletion } from '../features/WaveManager'
import { executionersChestMachineEntity } from '../features/PerkMachineManager.js'
import { SCORE_BODY_SHOT, SCORE_HEADSHOT, POWERUP_SPAWN_FREQUENCY } from '../utils/constants'
import { createBloodEffect } from './VisualEffectsSystem'

/**
 * Raycast Result System - processes shooting hits
 */
export function raycastResultSystem(dt: number) {
  if (isPaused()) return

  const playerBuffs = PlayerBuffs.getOrNull(engine.PlayerEntity)
  if (!playerBuffs) return

  for (const [entity] of engine.getEntitiesWith(RaycastResult)) {
    const raycastResult = RaycastResult.get(entity)

    if (raycastResult && raycastResult.hits && raycastResult.hits.length > 0) {
      const hit = raycastResult.hits[0]

      if (hit.entityId !== undefined && hit.position) {
        const hitEntity = hit.entityId as Entity

        // Check for power-up collection
        if (PowerUp.getOrNull(hitEntity)) {
          engine.removeEntity(hitEntity)
          engine.removeEntity(entity)
          return
        }

        const hasZombie = Zombie.getOrNull(hitEntity)
        const health = Health.getMutableOrNull(hitEntity)
        const isDying = DyingZombie.getOrNull(hitEntity)

        // Don't allow shooting dead/dying zombies for points
        if (health && hasZombie && !isDying) {
          const zombieTransform = Transform.get(hitEntity)
          const hitPosition = hit.position

          // Calculate distance for dynamic headshot threshold
          const distanceToZombie = Vector3.distance(
            Vector3.create(hitPosition.x, 0, hitPosition.z),
            Vector3.create(zombieTransform.position.x, 0, zombieTransform.position.z)
          )

          const minThreshold = 0.4
          const maxThreshold = 1.2
          const minDistance = 5
          const maxDistance = 10

          const headshotThreshold = Math.min(
            maxThreshold,
            Math.max(
              minThreshold,
              minThreshold +
                (maxThreshold - minThreshold) * (1 - (distanceToZombie - minDistance) / (maxDistance - minDistance))
            )
          )

          // Get current weapon
          const player = Player.getOrNull(playerEntity)
          if (!player || player.weapons.length === 0) {
            engine.removeEntity(entity)
            return
          }

          const currentWeapon = player.weapons[player.currentWeaponIndex] as Entity
          const weapon = Weapon.getOrNull(currentWeapon)
          if (!weapon) {
            engine.removeEntity(entity)
            return
          }

          // Determine if headshot
          let damage = weapon.damage * playerBuffs.damageMultiplier
          let score = SCORE_BODY_SHOT

          const isHeadshot = hitPosition.y > zombieTransform.position.y + headshotThreshold

          if (isHeadshot) {
            damage = weapon.damage * 5 * playerBuffs.damageMultiplier
            score = SCORE_HEADSHOT
            console.log(`🎯 HEADSHOT! on zombie ${hitEntity}`)
          }

          // Update score
          addScore(score)

          // Create score indicator
          createScoreIndicator(hitPosition, score)

          // Apply damage
          health.current -= damage
          console.log(`Hit zombie ${hitEntity}, health: ${health.current}`)

          // Create blood effect at hit position
          createBloodEffect(hitPosition)

          // Handle zombie death
          if (health.current <= 0 && !DyingZombie.getOrNull(hitEntity)) {
            handleZombieDeath(hitEntity, zombieTransform.position, isHeadshot)
          }
        }
      }
    }

    // Clean up raycast entity
    engine.removeEntity(entity)
  }
}

/**
 * Handle zombie death
 */
function handleZombieDeath(hitEntity: Entity, position: Vector3, isHeadshot: boolean) {
  const gameState = GameState.getMutable(gameStateEntity)
  gameState.zombiesRemaining -= 1
  gameState.kills += 1

  if (isHeadshot) {
    gameState.headshots += 1
  }

  console.log(`Zombie ${hitEntity} killed! Zombies remaining: ${gameState.zombiesRemaining}`)

  // Play death sound at zombie's position
  playZombieDeathSound(position)

  // Clean up zombie sounds
  cleanupZombieSounds(hitEntity)

  // Play death animation
  const animator = Animator.getOrNull(hitEntity)
  if (animator) {
    Animator.stopAllAnimations(hitEntity, false)

    const walkClip = Animator.getClip(hitEntity, 'walk')
    const dieClip = Animator.getClip(hitEntity, 'die')

    walkClip.weight = 0
    dieClip.weight = 1
    dieClip.playing = true

    Animator.playSingleAnimation(hitEntity, 'die', true)

    const animState = AnimationState.getMutable(hitEntity)
    animState.currentClip = 'die'
    animState.nextClip = ''
  }

  // Mark zombie as dying
  DyingZombie.create(hitEntity, {
    deathStartTime: Date.now()
  })

  // Spawn power-up every POWERUP_SPAWN_FREQUENCY kills
  if (gameState.zombiesRemaining % POWERUP_SPAWN_FREQUENCY === 0) {
    const type = getRandomPowerUpType()
    createPowerUp(position, type)
    console.log(`Spawned ${type} power-up at zombie death location`)
  }

  // Check if wave is complete
  if (gameState.zombiesRemaining <= 0 && gameState.phase === 'playing') {
    checkWaveCompletion()
  }
}

/**
 * Create score indicator
 */
function createScoreIndicator(position: Vector3, score: number) {
  const scoreIndicator = engine.addEntity()

  // Get player position for rotation
  const playerTransform = Transform.get(engine.PlayerEntity)
  const playerPosition = playerTransform.position

  // Calculate rotation to face player
  const direction = Vector3.create(playerPosition.x - position.x, 0, playerPosition.z - position.z)
  const rotation = Quaternion.lookRotation(direction, Vector3.Up())

  Transform.create(scoreIndicator, {
    position: Vector3.create(position.x, position.y + 0.5, position.z),
    scale: Vector3.create(0.5, 0.5, 0.5),
    rotation: rotation
  })

  const modelPath = score === SCORE_HEADSHOT ? 'models/scoreFifty.glb' : 'models/scoreTen.glb'

  GltfContainer.create(scoreIndicator, {
    src: modelPath,
    visibleMeshesCollisionMask: 1,
    invisibleMeshesCollisionMask: 1
  })

  ScoreIndicator.create(scoreIndicator, {
    creationTime: Date.now(),
    score: score
  })
}

/**
 * Score Indicator System - removes score indicators after timeout
 */
export function scoreIndicatorSystem(dt: number) {
  const currentTime = Date.now()
  for (const [entity, indicator] of engine.getEntitiesWith(ScoreIndicator)) {
    if (currentTime - indicator.creationTime > 1000) {
      engine.removeEntity(entity)
    }
  }
}
