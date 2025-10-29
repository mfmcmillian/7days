/**
 * Central Game State Management for Neural Collapse
 */

import { engine } from '@dcl/sdk/ecs'
import { GameState, Player, PlayerBuffs, Health } from '../components/GameComponents'
import { WEAPON_AMMO } from '../utils/constants'
import type { WeaponAmmoState } from '../utils/types'

// Singleton entity for game state
export const gameStateEntity = engine.addEntity()

// Singleton entity for player
export const playerEntity = engine.addEntity()

// Global weapon ammo state
export const weaponAmmo: WeaponAmmoState = { ...WEAPON_AMMO }

// Last shot time for fire rate control
export let lastShotTime: number = 0

/**
 * Initialize game state entity
 */
export function initializeGameState() {
  // Use createOrReplace to avoid duplicate component errors
  GameState.createOrReplace(gameStateEntity, {
    score: 0,
    phase: 'menu',
    currentWave: 1,
    zombiesRemaining: 0,
    paused: false,
    totalZombiesForWave: 0,
    nextSpawnTime: 0,
    kills: 0,
    headshots: 0,
    waveTransitionTime: 0
  })
}

/**
 * Initialize player entity
 */
export function initializePlayer() {
  // Player component for tracking weapons (use createOrReplace)
  Player.createOrReplace(playerEntity, {
    weapons: [],
    currentWeaponIndex: -1
  })

  // Player health (use createOrReplace)
  Health.createOrReplace(engine.PlayerEntity, {
    current: 100,
    max: 100,
    lastDamageTime: 0
  })

  // Player buffs/debuffs (use createOrReplace)
  PlayerBuffs.createOrReplace(engine.PlayerEntity, {
    damageMultiplier: 1,
    fireRateMultiplier: 1,
    pointsMultiplier: 1,
    reloadSpeedMultiplier: 1,
    damageExpiry: 0,
    fireRateExpiry: 0,
    pointsExpiry: 0,
    reloadSpeedExpiry: 0
  })
}

/**
 * Reset game state for new game
 */
export function resetGameState() {
  const gameState = GameState.getMutable(gameStateEntity)
  gameState.score = 0
  gameState.currentWave = 0
  gameState.zombiesRemaining = 0
  gameState.totalZombiesForWave = 0
  gameState.kills = 0
  gameState.headshots = 0
  gameState.paused = false
  gameState.waveTransitionTime = 0

  // Reset weapon ammo
  weaponAmmo.pistol = WEAPON_AMMO.pistol
  weaponAmmo.shotgun = WEAPON_AMMO.shotgun
  weaponAmmo.rifle = WEAPON_AMMO.rifle

  // Reset player health
  const playerHealth = Health.getMutable(engine.PlayerEntity)
  playerHealth.current = 100
  playerHealth.max = 100

  // Reset player buffs
  const playerBuffs = PlayerBuffs.getMutable(engine.PlayerEntity)
  playerBuffs.damageMultiplier = 1
  playerBuffs.fireRateMultiplier = 1
  playerBuffs.pointsMultiplier = 1
  playerBuffs.reloadSpeedMultiplier = 1
  playerBuffs.damageExpiry = 0
  playerBuffs.fireRateExpiry = 0
  playerBuffs.pointsExpiry = 0
  playerBuffs.reloadSpeedExpiry = 0
}

/**
 * Update last shot time
 */
export function updateLastShotTime(time: number = Date.now()) {
  lastShotTime = time
}

/**
 * Get current game phase
 */
export function getGamePhase(): string {
  return GameState.get(gameStateEntity).phase
}

/**
 * Set game phase
 */
export function setGamePhase(phase: string) {
  GameState.getMutable(gameStateEntity).phase = phase
}

/**
 * Get current score
 */
export function getScore(): number {
  return GameState.get(gameStateEntity).score
}

/**
 * Add to score
 */
export function addScore(points: number) {
  const gameState = GameState.getMutable(gameStateEntity)
  const playerBuffs = PlayerBuffs.get(engine.PlayerEntity)
  gameState.score += points * playerBuffs.pointsMultiplier
}

/**
 * Check if game is paused
 */
export function isPaused(): boolean {
  return GameState.get(gameStateEntity).paused
}

/**
 * Set pause state
 */
export function setPaused(paused: boolean) {
  GameState.getMutable(gameStateEntity).paused = paused
}
