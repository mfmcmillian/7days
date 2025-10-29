/**
 * Game Constants for 7 Days in Hell
 */

import { Vector3, Quaternion } from '@dcl/sdk/math'

// ============================================
// GAME CONSTANTS
// ============================================

export const GAME_NAME = '7 Days in Hell'

// ============================================
// SPAWN POINTS
// ============================================

// Side-scrolling spawn points - in front of gas station (spread out wide)
// Gas station is at (39.08, 3.55, -0.38)
// Zombies spawn in front of gas station (lower X values) and move toward player
export const ZOMBIE_SPAWNS: Vector3[] = [
  Vector3.create(32, 0, -6), // Far left lane
  Vector3.create(32, 0, -3), // Left lane
  Vector3.create(32, 0, 0), // Center lane
  Vector3.create(32, 0, 3), // Right lane
  Vector3.create(32, 0, 6), // Far right lane
  Vector3.create(30, 0, -4), // Left-center, closer
  Vector3.create(30, 0, 0), // Center, closer
  Vector3.create(30, 0, 4), // Right-center, closer
  Vector3.create(28, 0, -2), // Left, even closer
  Vector3.create(28, 0, 2) // Right, even closer
]

// Player starts in center of lane, can move left/right
export const PLAYER_START_POSITION = Vector3.create(8, 0, 8)

// ============================================
// WEAPON CONSTANTS
// ============================================

export const WEAPON_FPS_POSITION = Vector3.create(0.2, -0.2, 0.4)
export const WEAPON_FPS_SCALE = Vector3.create(0.2, 0.2, 0.2)
export const WEAPON_FPS_ROTATION = Quaternion.fromEulerDegrees(0, 180, 0)
export const WEAPON_RECOIL_AMOUNT = 0.1

export const WEAPON_AMMO = {
  pistol: 12,
  shotgun: 5,
  rifle: 30,
  maxPistol: 12,
  maxShotgun: 20,
  maxRifle: 90
}

export const WEAPON_STATS = {
  pistol: {
    damage: 20, // Higher damage for easier early game (was 15)
    fireRate: 0.5, // Even faster (was 0.6)
    ammo: 12,
    maxAmmo: 12,
    reloadTime: 2000, // Normal reload
    model: 'models/pistol.glb',
    upgradeModel: 'models/pistol-exe.glb'
  },
  shotgun: {
    damage: 60, // Higher damage for crowd control
    fireRate: 0.8, // Normal shotgun fire rate
    ammo: 6,
    maxAmmo: 6,
    reloadTime: 2500, // Normal reload
    model: 'models/Shotgun.glb',
    upgradeModel: 'models/shotgun-exe.glb'
  },
  rifle: {
    damage: 25, // Higher damage
    fireRate: 0.15, // Fast rifle fire rate (this one is fine)
    ammo: 25,
    maxAmmo: 25,
    reloadTime: 2000, // Normal reload
    model: 'models/rifle.glb',
    upgradeModel: 'models/rifle-exe.glb'
  }
}

// ============================================
// MACHINE PRICES & POSITIONS
// ============================================

export const WEAPON_MACHINES = {
  shotgun: {
    position: Vector3.create(22.07, 0.88, -19.57),
    rotation: Quaternion.fromEulerDegrees(0, 90, 0),
    weaponPrice: 500,
    ammoPrice: 200,
    ammoAmount: 50,
    model: 'models/weaponMachine/shotgunMachine.glb',
    floatingWeaponModel: 'models/Shotgun.glb',
    floatingPosition: Vector3.create(22.07, 2.38, -19.57)
  },
  rifle: {
    position: Vector3.create(39.01, 0.88, 8.93),
    rotation: Quaternion.fromEulerDegrees(0, 0, 0),
    weaponPrice: 750,
    ammoPrice: 300,
    ammoAmount: 50,
    model: 'models/weaponMachine/rifleMachine.glb',
    floatingWeaponModel: 'models/rifle.glb',
    floatingPosition: Vector3.create(39.01, 2.38, 8.93)
  }
}

export const PERK_MACHINES = {
  doubleTap: {
    position: Vector3.create(38.81, 0.88, -11.25),
    displayPosition: Vector3.create(38.81, 1, -11.25),
    rotation: Quaternion.fromEulerDegrees(0, 180, 0),
    price: 1200, // Mid-game gate (was 1000)
    model: 'models/perkMachines/doubleTap.glb',
    sound: 'sounds/perkMachines/doubleTap.mp3'
  },
  royalArmor: {
    position: Vector3.create(-0.82, 0.88, -18.95),
    rotation: Quaternion.fromEulerDegrees(0, 270, 0),
    price: 800,
    model: 'models/perkMachines/royalArmorMachine.glb',
    sound: 'sounds/perkMachines/royalArmorMachine.mp3'
  },
  quickReload: {
    position: Vector3.create(-11.4, 0.88, 19.69),
    rotation: Quaternion.fromEulerDegrees(0, 180, 0),
    price: 600,
    model: 'models/perkMachines/quickReload.glb',
    sound: 'sounds/perkMachines/quickReload.mp3'
  },
  executionersChest: {
    position: Vector3.create(21.18, 0.88, 19.16),
    rotation: Quaternion.fromEulerDegrees(0, 0, 0),
    price: 100, // Slight cost bump (was 50)
    model: 'models/perkMachines/executionerChest.glb',
    sound: 'sounds/perkMachines/executionerChest.mp3'
  }
}

// ============================================
// ZOMBIE CONSTANTS (5-7 MIN TOTAL GAME)
// ============================================

export const ZOMBIE_BASE_HEALTH = 15 // Very easy to kill - 1 pistol shot
export const ZOMBIE_HEALTH_MULTIPLIER = 0.1 // Minimal health scaling
export const ZOMBIE_BASE_SPEED = 4.0 // Fast but manageable
export const ZOMBIE_SPEED_INCREMENT = 0.1 // Very slow speed scaling
export const ZOMBIE_BASE_DAMAGE = 5 // Very softened (was 8, doc said 8)
export const ZOMBIE_DAMAGE_INCREMENT = 0.5 // Much gentler scaling (was 0.8)
export const ZOMBIE_SPAWN_INTERVAL = 800 // 0.8 seconds - VERY fast spawning!
export const ZOMBIE_SPAWN_BATCH_SIZE = 10 // 10 zombies per batch - constant action!
export const ZOMBIE_DEATH_ANIMATION_DURATION = 2000 // 2 seconds - quick cleanup

// ============================================
// POWERUP CONSTANTS
// ============================================

export const POWERUP_LIFETIME = 15000
export const POWERUP_SPAWN_FREQUENCY = 4 // Every 4 kills (was 2 - less spam)
export const POWERUP_DURATION = 10000

export const POWERUP_MODELS = {
  instantKill: 'models/powerups/instantKill.glb',
  fireRate: 'models/powerups/fireRate.glb',
  maxReload: 'models/powerups/max-ammo.glb',
  doublePoints: 'models/powerups/doublePoints.glb'
}

// ============================================
// SCORE CONSTANTS
// ============================================

export const SCORE_BODY_SHOT = 10
export const SCORE_HEADSHOT = 50
export const SCORE_ZOMBIE_KILL = 100

// ============================================
// SOUND POOL SIZES
// ============================================

export const SOUND_POOL_SIZES = {
  shot: 5,
  shotFail: 3,
  zombieAttack: 3,
  zombieDeath: 3,
  reload: 3,
  shotgunShot: 3,
  weaponSwitch: 3,
  startRound: 3,
  backgroundSiren: 2,
  sale: 3,
  gameOver: 1,
  noPoints: 3,
  perk: 3,
  powerup: 4
}

// ============================================
// CAMERA CONSTANTS
// ============================================

export const CAMERA_AREA_SIZE = Vector3.create(40000, 80, 40000)
export const CAMERA_AREA_POSITION = Vector3.create(8, 1, 8)

// ============================================
// BARRICADE CONSTANTS
// ============================================

export const MAX_BARRICADES = 6 // Maximum number of barricades player can place
export const BARRICADE_HEALTH = 600 // Much stronger for 60-90s durability (was 400)
export const BARRICADE_BUILD_COST = 50 // Points to build a barricade
export const BARRICADE_REPAIR_COST = 25 // Points to repair a barricade
export const BARRICADE_REPAIR_AMOUNT = 50 // Health restored per repair

// Barricade placement positions (strategic defense points)
// Player fighter is at X=-20, zombies spawn at X=28-32
// So barricades should be between them at X=0 to X=15
export const BARRICADE_POSITIONS: Vector3[] = [
  Vector3.create(5, 0, -4), // Left lane defense (close to player)
  Vector3.create(5, 0, 0), // Center lane defense (close to player)
  Vector3.create(5, 0, 4), // Right lane defense (close to player)
  Vector3.create(15, 0, -6), // Far left secondary (further out)
  Vector3.create(15, 0, 0), // Center secondary (further out)
  Vector3.create(15, 0, 6) // Far right secondary (further out)
]
