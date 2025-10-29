/**
 * Fighter Weapon System
 * Handles automatic shooting for the player fighter (Last War style)
 */

import { engine, Transform, Material, MeshRenderer, Entity, Schemas, Animator } from '@dcl/sdk/ecs'
import { Vector3, Color4, Quaternion } from '@dcl/sdk/math'
import { PlayerFighter } from './PlayerFighterSystem'
import { Zombie, Health, DyingZombie, AnimationState, GameState } from '../components/GameComponents'
import { BossZombie } from '../components/BossComponents'
import { playSound } from '../audio/SoundManager'
import { getGamePhase, isPaused, gameStateEntity } from '../core/GameState'
import { AllyZombie } from './AllyZombieSystem'
import { FIGHTER_WEAPONS, type FighterWeaponType } from '../utils/fighterWeapons'
import { createBloodEffect } from './VisualEffectsSystem'

// Re-export FighterWeaponType for external use
export type { FighterWeaponType }

// Current weapon type (starts with pistol)
let currentWeapon: FighterWeaponType = 'pistol'

// Component for projectiles
export const Projectile = engine.defineComponent('fighter::projectile', {
  velocity: Schemas.Vector3,
  distanceTraveled: Schemas.Number,
  maxRange: Schemas.Number,
  damage: Schemas.Number
})

let lastFireTime = 0
let projectileEntities: Entity[] = []
let allyLastFireTimes = new Map<Entity, number>() // Track fire times per ally

/**
 * Auto-fire system - shoots automatically (player + allies)
 */
export function fighterAutoFireSystem(dt: number): void {
  if (getGamePhase() !== 'playing') return
  if (isPaused()) return

  const currentTime = Date.now() / 1000 // Convert to seconds
  const weaponStats = FIGHTER_WEAPONS[currentWeapon]

  // Player shooting
  if (currentTime - lastFireTime >= weaponStats.fireRate) {
    // Find the player fighter
    for (const [entity] of engine.getEntitiesWith(PlayerFighter, Transform)) {
      const transform = Transform.get(entity)
      fireProjectile(transform.position, weaponStats)
      lastFireTime = currentTime

      // Play very quiet shot sound
      playSound('shot')
      break
    }
  }

  // Ally shooting (allies use same weapon as player)
  for (const [entity] of engine.getEntitiesWith(AllyZombie, Transform)) {
    const lastFire = allyLastFireTimes.get(entity) || 0

    if (currentTime - lastFire >= weaponStats.fireRate) {
      const transform = Transform.get(entity)
      fireProjectile(transform.position, weaponStats)
      allyLastFireTimes.set(entity, currentTime)

      // Play very quiet shot sound
      playSound('shot')
    }
  }
}

/**
 * Create and fire a projectile
 */
function fireProjectile(startPosition: Vector3, weaponStats: typeof FIGHTER_WEAPONS[FighterWeaponType]): void {
  const projectile = engine.addEntity()

  // Position slightly in front of player fighter
  const spawnPos = Vector3.create(
    startPosition.x + 1, // Start 1 unit forward
    startPosition.y + 1, // At chest height
    startPosition.z
  )

  Transform.create(projectile, {
    position: spawnPos,
    scale: Vector3.create(weaponStats.projectileScale.x, weaponStats.projectileScale.y, weaponStats.projectileScale.z),
    rotation: Quaternion.fromEulerDegrees(0, 90, 0) // Point forward (toward +X)
  })

  // Create energy blast visual with weapon-specific color
  MeshRenderer.setBox(projectile)
  Material.setPbrMaterial(projectile, {
    albedoColor: Color4.create(weaponStats.color.r, weaponStats.color.g, weaponStats.color.b, weaponStats.color.a),
    emissiveColor: Color4.create(weaponStats.color.r, weaponStats.color.g, weaponStats.color.b),
    emissiveIntensity: 2
  })

  // Add projectile component
  Projectile.create(projectile, {
    velocity: { x: weaponStats.projectileSpeed, y: 0, z: 0 }, // Move forward (toward +X)
    distanceTraveled: 0,
    maxRange: weaponStats.range,
    damage: weaponStats.damage
  })

  projectileEntities.push(projectile)
}

/**
 * Update projectile movement and collision
 */
export function projectileUpdateSystem(dt: number): void {
  if (getGamePhase() !== 'playing') return
  if (isPaused()) return

  for (const [entity] of engine.getEntitiesWith(Projectile, Transform)) {
    const projectile = Projectile.getMutable(entity)
    const transform = Transform.getMutable(entity)

    // Move projectile
    const movement = Vector3.create(projectile.velocity.x * dt, projectile.velocity.y * dt, projectile.velocity.z * dt)

    transform.position = Vector3.create(
      transform.position.x + movement.x,
      transform.position.y + movement.y,
      transform.position.z + movement.z
    )

    // Update distance traveled
    const distanceMoved = Math.sqrt(movement.x * movement.x + movement.y * movement.y + movement.z * movement.z)
    projectile.distanceTraveled += distanceMoved

    // Check if projectile exceeded range
    if (projectile.distanceTraveled >= projectile.maxRange) {
      engine.removeEntity(entity)
      projectileEntities = projectileEntities.filter((e) => e !== entity)
      continue
    }

    // Check collision with zombies
    let hitZombie = false
    for (const [zombieEntity] of engine.getEntitiesWith(Zombie, Transform)) {
      const zombieTransform = Transform.get(zombieEntity)
      const distance = Vector3.distance(transform.position, zombieTransform.position)

      // Simple sphere collision (within 1.5 units)
      if (distance < 1.5) {
        // Damage zombie
        const zombieHealth = Health.getMutable(zombieEntity)
        zombieHealth.current -= projectile.damage

        // Update boss health if this is a boss
        const boss = BossZombie.getMutableOrNull(zombieEntity)
        if (boss) {
          boss.currentHealth = zombieHealth.current
        }

        console.log(`💥 Hit zombie! Health: ${zombieHealth.current}/${zombieHealth.max}`)

        // Create dramatic green blood effect at zombie position
        createBloodEffect(zombieTransform.position)

        // Play headshot sound
        playSound('thunk')

        // Check if zombie died
        if (zombieHealth.current <= 0 && !DyingZombie.getOrNull(zombieEntity)) {
          handleZombieDeath(zombieEntity, zombieTransform.position)
        }

        // Remove projectile
        engine.removeEntity(entity)
        projectileEntities = projectileEntities.filter((e) => e !== entity)
        hitZombie = true
        break
      }
    }

    if (hitZombie) break
  }
}

/**
 * Reset weapon system
 */
export function resetFighterWeapon(): void {
  lastFireTime = 0
  allyLastFireTimes.clear()

  // Remove all projectiles
  for (const entity of projectileEntities) {
    engine.removeEntity(entity)
  }
  projectileEntities = []

  // Reset to pistol
  currentWeapon = 'pistol'

  console.log('✅ Fighter weapon system reset')
}

/**
 * Change the current weapon
 */
export function setFighterWeapon(weapon: FighterWeaponType): void {
  currentWeapon = weapon
  const weaponStats = FIGHTER_WEAPONS[weapon]
  console.log(`🔫 Weapon changed to: ${weaponStats.name}`)
  console.log(`   → Fire Rate: ${weaponStats.fireRate}s | Damage: ${weaponStats.damage} | Range: ${weaponStats.range}`)
}

/**
 * Get the current weapon type
 */
export function getCurrentWeapon(): FighterWeaponType {
  return currentWeapon
}

/**
 * Handle zombie death
 */
function handleZombieDeath(zombieEntity: Entity, position: Vector3): void {
  const gameState = GameState.getMutable(gameStateEntity)
  gameState.zombiesRemaining -= 1
  gameState.kills += 1

  // Track kills for story mode boss spawning
  if (gameState.storyMode) {
    gameState.zombiesKilledThisWave += 1
  }

  console.log(`💀 Zombie killed! Remaining: ${gameState.zombiesRemaining}`)

  // Play death sound using zombie death sound function
  playSound('die')

  // Play death animation using Animator.playSingleAnimation
  const animator = Animator.getOrNull(zombieEntity)
  if (animator) {
    Animator.stopAllAnimations(zombieEntity, false)
    Animator.playSingleAnimation(zombieEntity, 'die', true)

    const animState = AnimationState.getMutableOrNull(zombieEntity)
    if (animState) {
      animState.currentClip = 'die'
      animState.nextClip = ''
    }
  }

  // Mark zombie as dying
  DyingZombie.create(zombieEntity, {
    deathStartTime: Date.now()
  })
}

/**
 * Remove all projectiles (for scene cleanup)
 */
export function removeAllProjectiles(): void {
  for (const projectile of projectileEntities) {
    engine.removeEntity(projectile)
  }
  projectileEntities = []
  console.log('🧹 All projectiles removed')
}
