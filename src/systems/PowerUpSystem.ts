/**
 * PowerUp System for Neural Collapse
 * Handles power-up collection and effects
 */

import { engine, Transform, Animator } from '@dcl/sdk/ecs'
import { Vector3 } from '@dcl/sdk/math'
import { PowerUp, PlayerBuffs, Zombie, Weapon, Player, DyingZombie, AnimationState } from '../components/GameComponents'
import { gameStateEntity, getGamePhase, isPaused, playerEntity, weaponAmmo, addScore } from '../core/GameState'
import { GameState } from '../components/GameComponents'
import { playSound, playZombieDeathSound } from '../audio/SoundManager'
import { spawnNextWave, checkWaveCompletion } from '../features/WaveManager'
import { cleanupZombieSounds } from './ZombieSystem'
import { SCORE_ZOMBIE_KILL } from '../utils/constants'
import * as utils from '@dcl-sdk/utils'

/**
 * PowerUp System - handles collection and effects
 */
export function powerUpSystem(dt: number) {
  if (getGamePhase() !== 'playing') return
  if (isPaused()) return

  const playerTransform = Transform.getOrNull(engine.PlayerEntity)
  if (!playerTransform) return

  const playerPosition = playerTransform.position
  const playerBuffs = PlayerBuffs.getOrNull(engine.PlayerEntity)
  if (!playerBuffs) return

  const currentTime = Date.now()

  // Check for expired buffs
  const mutableBuffs = PlayerBuffs.getMutable(engine.PlayerEntity)
  if (currentTime >= playerBuffs.fireRateExpiry) {
    mutableBuffs.fireRateMultiplier = 1
  }
  if (currentTime >= playerBuffs.pointsExpiry) {
    mutableBuffs.pointsMultiplier = 1
  }

  // Check for power-up collection
  for (const [entity, powerUp] of engine.getEntitiesWith(PowerUp)) {
    if (!powerUp.active) continue

    const powerUpTransform = Transform.getOrNull(entity)
    if (!powerUpTransform) continue

    // Check if power-up lifetime has expired
    const timeElapsed = currentTime - powerUp.spawnTime
    if (timeElapsed >= powerUp.lifetime) {
      engine.removeEntity(entity)
      continue
    }

    // Blink effect during last 8 seconds
    if (timeElapsed >= powerUp.lifetime - 8000) {
      const blinkInterval = timeElapsed >= powerUp.lifetime - 3000 ? 125 : 250
      const shouldShow = Math.floor(timeElapsed / blinkInterval) % 2 === 0
      const transform = Transform.getMutable(entity)
      if (shouldShow) {
        transform.scale = Vector3.create(0.5, 0.5, 0.5)
      } else {
        transform.scale = Vector3.create(0, 0, 0)
      }
    }

    // Check for collection
    const distance = Vector3.distance(playerPosition, powerUpTransform.position)
    if (distance < 1.5) {
      // Remove power-up entity immediately
      PowerUp.getMutable(entity).active = false
      engine.removeEntity(entity)

      // Apply effect and play sound on next frame to avoid stutter
      const effectType = powerUp.type
      const effectDuration = powerUp.duration
      const effectValue = powerUp.value

      utils.timers.setTimeout(() => {
        applyPowerUpEffect(effectType, effectDuration, effectValue, mutableBuffs)

        // Play power-up sound
        const soundPath =
          effectType === 'maxReload'
            ? 'sounds/powerups/max-ammo.mp3'
            : effectType === 'doublePoints'
            ? 'sounds/powerups/double-points.mp3'
            : `sounds/powerups/${effectType}.mp3`

        playSound('powerup', soundPath)
      }, 10) // 10ms delay to next frame
    }
  }
}

/**
 * Apply power-up effect
 */
function applyPowerUpEffect(type: string, duration: number, value: number, playerBuffs: any) {
  const currentTime = Date.now()

  switch (type) {
    case 'instantKill':
      // Kill all zombies with staggered timing for smooth performance
      applyInstantKillEffect()
      break

    case 'fireRate':
      playerBuffs.fireRateMultiplier = value
      playerBuffs.fireRateExpiry = currentTime + duration
      break

    case 'maxReload':
      // Refill all weapons with deferred updates for smooth performance
      const player = Player.getOrNull(playerEntity)
      if (player) {
        // Update weapons one at a time with tiny delays
        player.weapons.forEach((weapon, index) => {
          utils.timers.setTimeout(() => {
            const weaponComponent = Weapon.getOrNull(weapon)
            if (weaponComponent) {
              const mutableWeapon = Weapon.getMutable(weapon)
              mutableWeapon.ammo = mutableWeapon.maxAmmo
              mutableWeapon.storedAmmo = mutableWeapon.maxAmmo

              // Update global ammo state
              switch (weaponComponent.type) {
                case 'pistol':
                  weaponAmmo.pistol = weaponAmmo.maxPistol
                  break
                case 'shotgun':
                  weaponAmmo.shotgun = weaponAmmo.maxShotgun
                  break
                case 'rifle':
                  weaponAmmo.rifle = weaponAmmo.maxRifle
                  break
              }
            }
          }, index * 5) // 5ms delay between each weapon update
        })
      }
      break

    case 'doublePoints':
      playerBuffs.pointsMultiplier = value
      playerBuffs.pointsExpiry = currentTime + duration
      break
  }
}

/**
 * Apply instant kill effect with staggered zombie deaths for smooth performance
 */
function applyInstantKillEffect() {
  const gameState = GameState.getMutable(gameStateEntity)

  // Collect all alive zombies
  interface ZombieToKill {
    entity: number
    position: Vector3
  }

  const zombiesToKill: ZombieToKill[] = []

  for (const [zombieEntity, zombie, transform] of engine.getEntitiesWith(Zombie, Transform)) {
    // Skip if already dying
    if (DyingZombie.getOrNull(zombieEntity)) continue
    zombiesToKill.push({
      entity: zombieEntity,
      position: Vector3.clone(transform.position)
    })
  }

  if (zombiesToKill.length === 0) return

  console.log(`💀 Instant kill activating on ${zombiesToKill.length} zombies...`)

  // Kill zombies in batches with staggered timing for smooth performance
  const batchSize = 3 // Kill 3 zombies at a time
  const delayBetweenBatches = 50 // 50ms between batches

  let batchIndex = 0
  const totalBatches = Math.ceil(zombiesToKill.length / batchSize)

  function killNextBatch() {
    const startIdx = batchIndex * batchSize
    const endIdx = Math.min(startIdx + batchSize, zombiesToKill.length)

    // Kill this batch of zombies
    for (let i = startIdx; i < endIdx; i++) {
      const { entity: zombieEntity, position } = zombiesToKill[i]

      // Update game state
      addScore(SCORE_ZOMBIE_KILL)
      gameState.zombiesRemaining -= 1
      gameState.kills += 1

      // Play death sound at zombie's position
      playZombieDeathSound(position)

      // Clean up zombie sounds
      cleanupZombieSounds(zombieEntity as any)

      // Play death animation
      const animator = Animator.getOrNull(zombieEntity as any)
      if (animator) {
        Animator.stopAllAnimations(zombieEntity as any, false)

        const walkClip = Animator.getClip(zombieEntity as any, 'walk')
        const runClip = Animator.getClip(zombieEntity as any, 'run')
        const dieClip = Animator.getClip(zombieEntity as any, 'die')

        if (walkClip) walkClip.weight = 0
        if (runClip) runClip.weight = 0
        if (dieClip) {
          dieClip.weight = 1
          dieClip.playing = true
        }

        Animator.playSingleAnimation(zombieEntity as any, 'die', true)

        const animState = AnimationState.getMutableOrNull(zombieEntity as any)
        if (animState) {
          animState.currentClip = 'die'
          animState.nextClip = ''
        }
      }

      // Mark zombie as dying
      DyingZombie.create(zombieEntity as any, {
        deathStartTime: Date.now()
      })
    }

    batchIndex++

    // Schedule next batch or check wave completion
    if (batchIndex < totalBatches) {
      utils.timers.setTimeout(killNextBatch, delayBetweenBatches)
    } else {
      // All zombies killed, check wave completion
      console.log(`✅ Instant kill complete! All ${zombiesToKill.length} zombies eliminated.`)
      utils.timers.setTimeout(() => {
        checkWaveCompletion()
      }, 500) // Small delay before checking wave completion
    }
  }

  // Start killing zombies
  killNextBatch()
}
