/**
 * Game Components for Neural Collapse
 * All ECS component definitions for the game
 */

import { Schemas, engine } from '@dcl/sdk/ecs'

// ============================================
// ZOMBIE COMPONENTS
// ============================================

export const Zombie = engine.defineComponent('zombie', {
  health: Schemas.Number,
  speed: Schemas.Number,
  damage: Schemas.Number,
  target: Schemas.Entity,
  spawnPositionX: Schemas.Number, // Track spawn X position for straight-run behavior
  hasTurned: Schemas.Boolean // Track if zombie has started turning toward player
})

export const DyingZombie = engine.defineComponent('dyingZombie', {
  deathStartTime: Schemas.Number
})

// ============================================
// PLAYER COMPONENTS
// ============================================

export const Player = engine.defineComponent('player', {
  weapons: Schemas.Array(Schemas.Entity),
  currentWeaponIndex: Schemas.Number
})

export const Health = engine.defineComponent('health', {
  current: Schemas.Number,
  max: Schemas.Number,
  lastDamageTime: Schemas.Number
})

export const PlayerBuffs = engine.defineComponent('playerBuffs', {
  damageMultiplier: Schemas.Number,
  fireRateMultiplier: Schemas.Number,
  pointsMultiplier: Schemas.Number,
  reloadSpeedMultiplier: Schemas.Number,
  damageExpiry: Schemas.Number,
  fireRateExpiry: Schemas.Number,
  pointsExpiry: Schemas.Number,
  reloadSpeedExpiry: Schemas.Number
})

// ============================================
// WEAPON COMPONENTS
// ============================================

export const Weapon = engine.defineComponent('weapon', {
  damage: Schemas.Number,
  fireRate: Schemas.Number,
  ammo: Schemas.Number,
  maxAmmo: Schemas.Number,
  storedAmmo: Schemas.Number,
  type: Schemas.String,
  active: Schemas.Boolean,
  recoilFactor: Schemas.Number,
  recoilSpeed: Schemas.Number,
  recoilPosition: Schemas.Vector3,
  restPosition: Schemas.Vector3,
  restRotation: Schemas.Quaternion,
  recoilRotation: Schemas.Quaternion,
  reloadTime: Schemas.Number,
  isReloading: Schemas.Boolean,
  reloadStartTime: Schemas.Number,
  modelPath: Schemas.String
})

// ============================================
// GAME STATE COMPONENTS
// ============================================

export const GameState = engine.defineComponent('gameState', {
  phase: Schemas.String, // 'menu', 'playing', 'gameOver', 'victory', 'storyDialog', 'waveDialogue', 'waveComplete'
  score: Schemas.Number,
  currentWave: Schemas.Number,
  zombiesRemaining: Schemas.Number,
  totalZombiesForWave: Schemas.Number,
  nextSpawnTime: Schemas.Number,
  paused: Schemas.Boolean,
  kills: Schemas.Number,
  headshots: Schemas.Number,
  waveTransitionTime: Schemas.Number,
  // Story mode fields
  storyMode: Schemas.Boolean, // true if in story mode (waves 1-5), false if endless
  zombiesKilledThisWave: Schemas.Number, // Track kills to spawn boss
  bossSpawned: Schemas.Boolean, // Has boss spawned this wave?
  bossAlive: Schemas.Boolean // Is boss still alive?
})

// ============================================
// MACHINE COMPONENTS
// ============================================

export const WeaponMachine = engine.defineComponent('weaponMachine', {
  position: Schemas.Vector3,
  shotgunPrice: Schemas.Number,
  riflePrice: Schemas.Number,
  pistolAmmoPrice: Schemas.Number,
  shotgunAmmoPrice: Schemas.Number,
  rifleAmmoPrice: Schemas.Number,
  pistolAmmoAmount: Schemas.Number,
  shotgunAmmoAmount: Schemas.Number,
  rifleAmmoAmount: Schemas.Number
})

export const DoubleTapMachine = engine.defineComponent('doubleTapMachine', {
  position: Schemas.Vector3,
  price: Schemas.Number,
  purchased: Schemas.Boolean
})

export const RoyalArmorMachine = engine.defineComponent('royalArmorMachine', {
  position: Schemas.Vector3,
  price: Schemas.Number,
  purchased: Schemas.Boolean
})

export const QuickReloadMachine = engine.defineComponent('quickReloadMachine', {
  position: Schemas.Vector3,
  price: Schemas.Number,
  purchased: Schemas.Boolean
})

export const ExecutionersChestMachine = engine.defineComponent('executionersChestMachine', {
  position: Schemas.Vector3,
  price: Schemas.Number,
  purchased: Schemas.Boolean,
  upgradedWeapons: Schemas.Array(Schemas.String)
})

// ============================================
// POWERUP COMPONENTS
// ============================================

export const PowerUp = engine.defineComponent('powerUp', {
  type: Schemas.String,
  duration: Schemas.Number,
  value: Schemas.Number,
  active: Schemas.Boolean,
  spawnTime: Schemas.Number,
  lifetime: Schemas.Number
})

// ============================================
// UTILITY COMPONENTS
// ============================================

export const AnimationState = engine.defineComponent('animationState', {
  currentClip: Schemas.String,
  nextClip: Schemas.String
})

export const ScoreIndicator = engine.defineComponent('scoreIndicator', {
  creationTime: Schemas.Number,
  score: Schemas.Number
})

export const DebugSphere = engine.defineComponent('debugSphere', {
  creationTime: Schemas.Number
})

export const MuzzleFlash = engine.defineComponent('muzzleFlash', {
  creationTime: Schemas.Number,
  duration: Schemas.Number
})

export const BloodEffect = engine.defineComponent('bloodEffect', {
  creationTime: Schemas.Number,
  duration: Schemas.Number
})

// ============================================
// BARRICADE COMPONENTS
// ============================================

export const Barricade = engine.defineComponent('barricade', {
  health: Schemas.Number,
  maxHealth: Schemas.Number,
  position: Schemas.Vector3,
  slotIndex: Schemas.Number // Which barricade slot this is in (0-5)
})
