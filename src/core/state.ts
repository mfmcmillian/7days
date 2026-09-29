import { BARRICADE, HERO, PickupKind, WeaponId } from '../config/balance'
import { CENTER_LANE } from '../config/geometry'

export type Phase =
  | 'boot'
  | 'intro'
  | 'briefing'
  | 'dialogue'
  | 'night'
  | 'night_complete'
  | 'day_plan'
  | 'day_results'
  | 'game_over'
  | 'outro'
  | 'victory'

export interface ActiveEffect {
  kind: PickupKind
  remaining: number
  duration: number
}

export interface DayPlan {
  barricade: number
  allies: number
  scavenge: number
}

export interface DayResults {
  repairedPercent: number
  alliesGained: number
  alliesTotal: number
  weaponFound: WeaponId | null
  scavengeLabel: string
  alreadyOwned: boolean
}

export interface NightStats {
  kills: number
  spawned: number
  toSpawn: number
  bossAlive: boolean
  bossHealth: number
  bossMaxHealth: number
  scoreAtStart: number
  barricadeAtStart: number
  elapsed: number
}

export interface Toast {
  text: string
  color: [number, number, number]
  remaining: number
}

export interface GameState {
  phase: Phase
  night: number
  score: number
  totalKills: number
  hero: {
    health: number
    lane: number
    weapon: WeaponId
    ammo: number
    reloading: boolean
    reloadRemaining: number
    underAttack: boolean
  }
  barricade: { health: number }
  allies: number
  inventory: WeaponId[]
  effects: ActiveEffect[]
  nightStats: NightStats
  dayPlan: DayPlan
  dayResults: DayResults | null
  toasts: Toast[]
  killsSinceDrop: number
  dialogueQueue: number
  /** Which UI dialogue set is playing: a night number, or 'outro'. */
  dialogueFor: number | 'outro'
  gameOverLine: string
  runsCompleted: number
  bestScore: number
  audioUnlocked: boolean
  muted: boolean
}

function freshNightStats(): NightStats {
  return {
    kills: 0,
    spawned: 0,
    toSpawn: 0,
    bossAlive: false,
    bossHealth: 0,
    bossMaxHealth: 0,
    scoreAtStart: 0,
    barricadeAtStart: 0,
    elapsed: 0
  }
}

export const state: GameState = {
  phase: 'boot',
  night: 1,
  score: 0,
  totalKills: 0,
  hero: {
    health: HERO.maxHealth,
    lane: CENTER_LANE,
    weapon: 'pistol',
    ammo: 12,
    reloading: false,
    reloadRemaining: 0,
    underAttack: false
  },
  barricade: { health: BARRICADE.maxHealth },
  allies: 0,
  inventory: ['pistol'],
  effects: [],
  nightStats: freshNightStats(),
  dayPlan: { barricade: 6, allies: 3, scavenge: 3 },
  dayResults: null,
  toasts: [],
  killsSinceDrop: 0,
  dialogueQueue: 0,
  dialogueFor: 1,
  gameOverLine: '',
  runsCompleted: 0,
  bestScore: 0,
  audioUnlocked: false,
  muted: false
}

/** Reset everything that belongs to a single run (keeps meta like bestScore). */
export function resetRun(): void {
  state.night = 1
  state.score = 0
  state.totalKills = 0
  state.hero.health = HERO.maxHealth
  state.hero.lane = CENTER_LANE
  state.hero.weapon = 'pistol'
  state.hero.ammo = 12
  state.hero.reloading = false
  state.hero.reloadRemaining = 0
  state.hero.underAttack = false
  state.barricade.health = BARRICADE.maxHealth
  state.allies = 0
  state.inventory = ['pistol']
  state.effects = []
  state.nightStats = freshNightStats()
  state.dayPlan = { barricade: 6, allies: 3, scavenge: 3 }
  state.dayResults = null
  state.toasts = []
  state.killsSinceDrop = 0
}

export function resetNightStats(): void {
  state.nightStats = freshNightStats()
  state.nightStats.scoreAtStart = state.score
  state.nightStats.barricadeAtStart = state.barricade.health
}

export function hasEffect(kind: PickupKind): boolean {
  return state.effects.some((e) => e.kind === kind)
}

export function pushToast(text: string, color: [number, number, number] = [1, 1, 1], seconds = 2.2): void {
  state.toasts.push({ text, color, remaining: seconds })
  if (state.toasts.length > 3) state.toasts.shift()
}

export function isPlaying(): boolean {
  return state.phase === 'night'
}
