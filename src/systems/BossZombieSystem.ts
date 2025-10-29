/**
 * Boss Zombie System
 * Handles spawning and management of mini-bosses and big bosses
 */

import { engine, Entity, Transform, GltfContainer, Animator, MeshCollider } from '@dcl/sdk/ecs'
import { Vector3, Quaternion, Color4 } from '@dcl/sdk/math'
import { Zombie, Health, AnimationState, GameState } from '../components/GameComponents'
import { BossZombie, type BossType } from '../components/BossComponents'
import { gameStateEntity } from '../core/GameState'
import { ZOMBIE_BASE_HEALTH, ZOMBIE_BASE_SPEED, ZOMBIE_BASE_DAMAGE, ZOMBIE_SPAWNS } from '../utils/constants'
import { getBossHealth, MINI_BOSS_SCALE, BIG_BOSS_SCALE } from '../utils/nightConfig'

/**
 * Create a boss zombie
 */
export function createBossZombie(position: Vector3, bossType: BossType, wave: number): Entity {
  const entity = engine.addEntity()

  const gameState = GameState.get(gameStateEntity)
  const isBigBoss = bossType === 'big'
  const scale = isBigBoss ? BIG_BOSS_SCALE : MINI_BOSS_SCALE

  // Position and scale
  Transform.create(entity, {
    position,
    rotation: Quaternion.fromEulerDegrees(0, 270, 0), // Face toward player
    scale: Vector3.create(scale, scale, scale)
  })

  // Add the GLTF model
  GltfContainer.create(entity, {
    src: 'models/zombie.glb'
  })

  // Add collision
  MeshCollider.setBox(entity, [2 * scale])

  // Calculate boss stats
  const bossHealth = getBossHealth(wave, isBigBoss)
  const bossSpeed = ZOMBIE_BASE_SPEED * (isBigBoss ? 0.8 : 1.0) // Big bosses slower
  const bossDamage = ZOMBIE_BASE_DAMAGE * (isBigBoss ? 3 : 2) // More damage

  // Add Zombie component
  Zombie.create(entity, {
    health: bossHealth,
    speed: bossSpeed,
    damage: bossDamage,
    target: engine.PlayerEntity,
    spawnPositionX: position.x,
    hasTurned: false
  })

  // Add Health component
  Health.create(entity, {
    current: bossHealth,
    max: bossHealth,
    lastDamageTime: 0
  })

  // Add BossZombie component
  BossZombie.create(entity, {
    isBigBoss,
    maxHealth: bossHealth,
    currentHealth: bossHealth
  })

  // Add Animator component
  const movementClip = 'walk' // Bosses walk menacingly
  Animator.create(entity, {
    states: [
      { clip: 'walk', playing: true, loop: true, weight: 1 },
      { clip: 'run', playing: false, loop: true, weight: 0 },
      { clip: 'attack', playing: false, loop: true, weight: 0 },
      { clip: 'die', playing: false, loop: false, weight: 0 }
    ]
  })

  // Add AnimationState component
  AnimationState.create(entity, {
    currentClip: movementClip,
    nextClip: movementClip
  })

  const bossTypeText = isBigBoss ? 'BIG BOSS' : 'MINI-BOSS'
  console.log(`👹 ${bossTypeText} spawned at wave ${wave} with ${bossHealth} HP`)

  return entity
}

/**
 * Spawn mini-bosses for the current wave
 */
export function spawnMiniBosses(count: number, wave: number): void {
  for (let i = 0; i < count; i++) {
    // Use random spawn points
    const spawnPoint = ZOMBIE_SPAWNS[Math.floor(Math.random() * ZOMBIE_SPAWNS.length)]
    createBossZombie(spawnPoint, 'mini', wave)
  }
  console.log(`👹 Spawned ${count} mini-bosses for wave ${wave}`)
}

/**
 * Spawn the big boss for the current wave
 */
export function spawnBigBoss(wave: number): void {
  // Spawn big boss at center spawn point
  const centerSpawn = ZOMBIE_SPAWNS[Math.floor(ZOMBIE_SPAWNS.length / 2)]
  createBossZombie(centerSpawn, 'big', wave)

  // Update game state
  const gameState = GameState.getMutable(gameStateEntity)
  gameState.bossSpawned = true
  gameState.bossAlive = true

  console.log(`👹👹👹 BIG BOSS spawned for wave ${wave}!`)
}

/**
 * Check if there are any bosses alive
 */
export function areBossesAlive(): boolean {
  for (const [entity] of engine.getEntitiesWith(BossZombie)) {
    return true
  }
  return false
}

/**
 * Get the big boss entity (for HP bar)
 */
export function getBigBossEntity(): Entity | null {
  for (const [entity, boss] of engine.getEntitiesWith(BossZombie)) {
    if (boss.isBigBoss) {
      return entity
    }
  }
  return null
}
