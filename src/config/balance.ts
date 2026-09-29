/**
 * All tunable numbers live here. Nothing in the systems should hard-code balance.
 */

export type WeaponId = 'pistol' | 'shotgun' | 'rifle' | 'assault'

export interface WeaponDef {
  id: WeaponId
  name: string
  /** Shots per second. */
  fireRate: number
  damage: number
  magSize: number
  reloadSeconds: number
  range: number
  projectileSpeed: number
  /** How many enemies a single shot can pass through. */
  pierce: number
  /** Tier used for auto-equip ordering and daytime scavenging. */
  tier: number
  tracerColor: [number, number, number]
  shotSfx: 'shot' | 'shotgun-shot'
  reloadSfx: 'pistol-reload' | 'rifle-reload' | 'shotgun-reload'
  blurb: string
}

export const WEAPONS: Record<WeaponId, WeaponDef> = {
  pistol: {
    id: 'pistol',
    name: 'Sidearm',
    fireRate: 2.4,
    damage: 14,
    magSize: 12,
    reloadSeconds: 1.1,
    range: 44,
    projectileSpeed: 48,
    pierce: 1,
    tier: 0,
    tracerColor: [0.55, 0.9, 1.0],
    shotSfx: 'shot',
    reloadSfx: 'pistol-reload',
    blurb: 'Reliable. Never runs out of reasons to reload.'
  },
  shotgun: {
    id: 'shotgun',
    name: 'Riot Shotgun',
    fireRate: 1.05,
    damage: 34,
    magSize: 6,
    reloadSeconds: 1.9,
    range: 24,
    projectileSpeed: 40,
    pierce: 3,
    tier: 1,
    tracerColor: [1.0, 0.75, 0.3],
    shotSfx: 'shotgun-shot',
    reloadSfx: 'shotgun-reload',
    blurb: 'Short reach, shreds anything stacked in the lane.'
  },
  rifle: {
    id: 'rifle',
    name: 'Marksman Rifle',
    fireRate: 1.5,
    damage: 48,
    magSize: 8,
    reloadSeconds: 1.6,
    range: 70,
    projectileSpeed: 75,
    pierce: 2,
    tier: 1,
    tracerColor: [1.0, 0.35, 0.35],
    shotSfx: 'shot',
    reloadSfx: 'rifle-reload',
    blurb: 'Reaches the spawn line. Punches through two.'
  },
  assault: {
    id: 'assault',
    name: 'Assault Rifle',
    fireRate: 6.5,
    damage: 11,
    magSize: 32,
    reloadSeconds: 2.0,
    range: 50,
    projectileSpeed: 62,
    pierce: 1,
    tier: 2,
    tracerColor: [1.0, 0.85, 0.35],
    shotSfx: 'shot',
    reloadSfx: 'rifle-reload',
    blurb: 'A wall of lead. Empties fast, hits everything.'
  }
}

export const WEAPON_ORDER: WeaponId[] = ['pistol', 'shotgun', 'rifle', 'assault']

export type EnemyKind = 'walker' | 'runner' | 'brute' | 'boss'

export interface EnemyDef {
  kind: EnemyKind
  baseHealth: number
  healthPerNight: number
  speed: number
  /** Damage per second while attacking the barricade or hero. */
  dps: number
  score: number
  scale: number
  /** Animator clip used while moving. */
  moveClip: 'walk' | 'run'
}

export const ENEMIES: Record<EnemyKind, EnemyDef> = {
  walker: { kind: 'walker', baseHealth: 42, healthPerNight: 9, speed: 1.7, dps: 7, score: 100, scale: 1.0, moveClip: 'walk' },
  runner: { kind: 'runner', baseHealth: 26, healthPerNight: 5, speed: 3.4, dps: 5, score: 130, scale: 0.92, moveClip: 'run' },
  brute: { kind: 'brute', baseHealth: 190, healthPerNight: 45, speed: 1.25, dps: 16, score: 500, scale: 1.45, moveClip: 'walk' },
  boss: { kind: 'boss', baseHealth: 420, healthPerNight: 130, speed: 1.05, dps: 32, score: 1500, scale: 1.9, moveClip: 'walk' }
}

export interface NightDef {
  night: number
  /** Regular horde size (walkers + runners). */
  horde: number
  runnerRatio: number
  brutes: number
  boss: boolean
  /** Seconds between regular spawns. */
  spawnInterval: number
  /** Fraction of the horde that must have spawned before the boss walks in. */
  bossAt: number
  /** Chance a spawn is a 2-3 zombie burst. */
  burstChance: number
}

export const NIGHTS: NightDef[] = [
  { night: 1, horde: 12, runnerRatio: 0.1, brutes: 0, boss: true, spawnInterval: 2.6, bossAt: 0.75, burstChance: 0.0 },
  { night: 2, horde: 16, runnerRatio: 0.15, brutes: 0, boss: true, spawnInterval: 2.3, bossAt: 0.75, burstChance: 0.08 },
  { night: 3, horde: 20, runnerRatio: 0.2, brutes: 1, boss: true, spawnInterval: 2.1, bossAt: 0.7, burstChance: 0.12 },
  { night: 4, horde: 24, runnerRatio: 0.25, brutes: 1, boss: true, spawnInterval: 1.9, bossAt: 0.7, burstChance: 0.16 },
  { night: 5, horde: 28, runnerRatio: 0.3, brutes: 1, boss: true, spawnInterval: 1.7, bossAt: 0.65, burstChance: 0.2 },
  { night: 6, horde: 32, runnerRatio: 0.35, brutes: 2, boss: true, spawnInterval: 1.5, bossAt: 0.65, burstChance: 0.25 },
  { night: 7, horde: 36, runnerRatio: 0.4, brutes: 2, boss: true, spawnInterval: 1.3, bossAt: 0.6, burstChance: 0.3 }
]

export const TOTAL_NIGHTS = NIGHTS.length

export const HERO = {
  maxHealth: 100,
  /** Seconds to slide one lane over. */
  laneSwitchSeconds: 0.18,
  /** Passive regen per second while no enemy is attacking the hero. */
  regenPerSecond: 1.5
}

export const BARRICADE = {
  maxHealth: 600,
  /** Barricade is rebuilt to at least this fraction after each survived night. */
  minAfterNight: 0.25
}

export const ALLIES = {
  max: 4,
  fireRate: 1.1,
  damage: 12,
  range: 40,
  projectileSpeed: 45
}

export type PickupKind = 'double_points' | 'fire_rate' | 'instant_kill' | 'max_ammo' | 'medkit' | 'repair'

export interface PickupDef {
  kind: PickupKind
  label: string
  /** Effect duration in seconds; 0 = instant. */
  duration: number
  color: [number, number, number]
  sfx: string
  weight: number
}

export const PICKUPS: Record<PickupKind, PickupDef> = {
  double_points: { kind: 'double_points', label: 'DOUBLE POINTS', duration: 12, color: [1.0, 0.85, 0.2], sfx: 'powerups/double-points', weight: 3 },
  fire_rate: { kind: 'fire_rate', label: 'RAPID FIRE', duration: 10, color: [1.0, 0.45, 0.15], sfx: 'powerups/fireRate', weight: 3 },
  instant_kill: { kind: 'instant_kill', label: 'INSTA-KILL', duration: 8, color: [0.9, 0.2, 0.9], sfx: 'powerups/instantKill', weight: 2 },
  max_ammo: { kind: 'max_ammo', label: 'MAX AMMO', duration: 10, color: [0.3, 0.9, 1.0], sfx: 'powerups/max-ammo', weight: 3 },
  medkit: { kind: 'medkit', label: 'MEDKIT +35', duration: 0, color: [0.35, 1.0, 0.45], sfx: 'sale', weight: 3 },
  repair: { kind: 'repair', label: 'REPAIR +120', duration: 0, color: [0.6, 0.7, 1.0], sfx: 'thunk', weight: 3 }
}

export const PICKUP_RULES = {
  dropChance: 0.16,
  guaranteedEveryKills: 9,
  driftSpeed: 3.2,
  fireRateMultiplier: 1.9,
  medkitHeal: 35,
  repairAmount: 120
}

export const SCORE = {
  nightClearBonus: 1000,
  barricadeBonusPerPercent: 10,
  fullHealthBonus: 500
}

/** Daytime: 12 hours to split between three jobs. */
export const DAY = {
  hours: 12,
  /** Barricade repair: min(100%, hours * 20%). */
  repairPerHour: 0.2,
  /** Survivors rallied: floor(hours / 4), plus a 50% chance of one more if hours > 0. */
  alliesPerHours: 4,
  allyBonusChance: 0.5,
  /** Scavenge tiers by hours. */
  scavenge: [
    { minHours: 7, finds: ['assault', 'rifle'] as WeaponId[], label: 'Military cache' },
    { minHours: 4, finds: ['rifle', 'shotgun'] as WeaponId[], label: 'Police armory' },
    { minHours: 1, finds: ['pistol'] as WeaponId[], label: 'Corner store' }
  ]
}
