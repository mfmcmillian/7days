import { engine } from '@dcl/sdk/ecs'
import { BARRICADE, DAY, EnemyKind, HERO, NIGHTS, SCORE, TOTAL_NIGHTS, WeaponId } from '../config/balance'
import { GAME_OVER_LINES } from '../config/dialogue'
import { LANE_COUNT } from '../config/geometry'
import { CUTSCENE_TIMEOUT, VIDEOS } from '../config/media'
import { anyEnemiesAlive, clearEnemies, spawnEnemy } from '../systems/enemies'
import { equipWeapon, readyHeroForNight } from '../systems/hero'
import { clearPickups } from '../systems/pickups'
import { clearProjectiles } from '../systems/projectiles'
import { syncAllies } from '../systems/allies'
import { updateBarricadeVisual } from '../world/barricade'
import { playVideo, stopVideo } from '../world/cinema'
import { applyMute, playAmbience, playMusic, playNarration, playSfx, setMusicVolume, stopAmbience, stopNarration } from './audio'
import { setCameraPose } from './camera'
import { pushToast, resetNightStats, resetRun, state } from './state'
import { clearAllTimers, setTimer } from './timers'

/**
 * The game's state machine. UI screens call into these functions; systems read
 * `state.phase` to know whether to simulate.
 */

let spawnQueue: EnemyKind[] = []
let spawnTimer = 0
let lastLane = -1
let nightEnding = false

export function bootGame(): void {
  state.phase = 'intro'
  setCameraPose('cinema')
  playVideo(VIDEOS.intro, { loop: true, volume: 0.6 })
  engine.addSystem(nightSystem, 70, 'night-director')
  engine.addSystem(toastSystem, 300, 'toasts')
}

/** First tap: unlocks audio (mobile browsers need a gesture) and starts the briefing. */
export function startFromIntro(): void {
  if (state.phase !== 'intro') return
  state.audioUnlocked = true
  resetRun()
  state.phase = 'briefing'
  playMusic(0.2)
  playVideo(VIDEOS.briefing, {
    loop: false,
    volume: 1,
    timeout: CUTSCENE_TIMEOUT.briefing,
    onEnded: () => beginNightDialogue(1)
  })
}

export function skipCutscene(): void {
  if (state.phase === 'briefing') beginNightDialogue(1)
  else if (state.phase === 'outro') beginOutroDialogue()
}

export function beginNightDialogue(night: number): void {
  stopVideo()
  state.night = night
  state.dialogueFor = night
  state.phase = 'dialogue'
  setCameraPose('play')
  setMusicVolume(0.3)
  syncAllies()
  updateBarricadeVisual(state.barricade.health / BARRICADE.maxHealth)
  equipWeapon(state.hero.weapon, true)
}

export function dialogueFinished(): void {
  if (state.dialogueFor === 'outro') {
    state.phase = 'victory'
    state.runsCompleted++
    return
  }
  startNight()
}

function buildSpawnQueue(night: number): EnemyKind[] {
  const def = NIGHTS[night - 1]
  const runners = Math.round(def.horde * def.runnerRatio)
  const horde: EnemyKind[] = []
  for (let i = 0; i < def.horde; i++) horde.push(i < runners ? 'runner' : 'walker')
  // Shuffle, but keep the first three spawns walkers so each night opens readable.
  for (let i = horde.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[horde[i], horde[j]] = [horde[j], horde[i]]
  }
  for (let i = 0; i < Math.min(3, horde.length); i++) {
    if (horde[i] !== 'runner') continue
    const swap = horde.findIndex((k, j) => j >= 3 && k === 'walker')
    if (swap > 0) [horde[i], horde[swap]] = [horde[swap], horde[i]]
  }
  // Brutes arrive in the middle third.
  for (let b = 0; b < def.brutes; b++) {
    const idx = Math.floor(horde.length * (0.35 + (0.3 * (b + 1)) / (def.brutes + 1)))
    horde.splice(idx, 0, 'brute')
  }
  if (def.boss) {
    const idx = Math.min(horde.length, Math.floor(horde.length * def.bossAt))
    horde.splice(idx, 0, 'boss')
  }
  return horde
}

export function startNight(): void {
  const night = state.night
  stopVideo()
  clearEnemies()
  clearProjectiles()
  clearPickups()
  resetNightStats()
  spawnQueue = buildSpawnQueue(night)
  state.nightStats.toSpawn = spawnQueue.length
  spawnTimer = 2.5
  lastLane = -1
  nightEnding = false
  readyHeroForNight()
  syncAllies()
  state.phase = 'night'
  setCameraPose('play')
  setMusicVolume(0.45)
  playAmbience(night)
  playNarration(night)
  playSfx('startRound', 0.8)
  pushToast(`NIGHT ${night}`, [1, 1, 1], 2.5)
}

function pickLane(): number {
  // Pressure the hero's lane a bit, otherwise spread out, never 3 in a row on the same lane.
  let lane: number
  if (Math.random() < 0.3) lane = state.hero.lane
  else lane = Math.floor(Math.random() * LANE_COUNT)
  if (lane === lastLane && Math.random() < 0.6) lane = (lane + 1 + Math.floor(Math.random() * (LANE_COUNT - 1))) % LANE_COUNT
  lastLane = lane
  return lane
}

function nightSystem(dt: number): void {
  if (state.phase !== 'night') return
  const def = NIGHTS[state.night - 1]
  state.nightStats.elapsed += dt

  if (state.hero.health <= 0) {
    gameOver()
    return
  }

  if (spawnQueue.length > 0) {
    spawnTimer -= dt
    if (spawnTimer <= 0) {
      const kind = spawnQueue.shift() as EnemyKind
      spawnEnemy(kind, pickLane())
      let count = 1
      if (kind !== 'boss' && Math.random() < def.burstChance) {
        const extra = 1 + Math.floor(Math.random() * 2)
        for (let i = 0; i < extra && spawnQueue.length > 0 && spawnQueue[0] !== 'boss'; i++) {
          spawnEnemy(spawnQueue.shift() as EnemyKind, pickLane())
          count++
        }
      }
      // Slightly longer breather after bursts and after the boss walks in.
      spawnTimer = def.spawnInterval * (kind === 'boss' ? 1.8 : 1) * (0.85 + Math.random() * 0.3) * (count > 1 ? 1.4 : 1)
    }
  } else if (!anyEnemiesAlive() && !nightEnding) {
    nightEnding = true
    setTimer(1.0, nightComplete)
  }
}

function nightComplete(): void {
  if (state.phase !== 'night') return
  const barricadePct = Math.round((state.barricade.health / BARRICADE.maxHealth) * 100)
  let bonus = SCORE.nightClearBonus + barricadePct * SCORE.barricadeBonusPerPercent
  if (state.hero.health >= HERO.maxHealth - 0.01) bonus += SCORE.fullHealthBonus
  state.score += bonus
  if (state.score > state.bestScore) state.bestScore = state.score
  clearProjectiles()
  clearPickups()
  stopAmbience()
  stopNarration()
  playSfx('levelup', 0.9)
  setMusicVolume(0.25)

  if (state.night >= TOTAL_NIGHTS) {
    state.phase = 'outro'
    setCameraPose('cinema')
    setMusicVolume(0.1)
    playVideo(VIDEOS.outro, { loop: false, volume: 1, timeout: CUTSCENE_TIMEOUT.outro, onEnded: beginOutroDialogue })
    return
  }
  state.phase = 'night_complete'
}

function beginOutroDialogue(): void {
  stopVideo()
  state.dialogueFor = 'outro'
  state.phase = 'dialogue'
  setCameraPose('play')
}

export function continueToDayPlan(): void {
  if (state.phase !== 'night_complete') return
  state.dayPlan = { barricade: 6, allies: 3, scavenge: 3 }
  state.phase = 'day_plan'
}

export function adjustDayPlan(key: keyof typeof state.dayPlan, delta: number): void {
  const plan = state.dayPlan
  const total = plan.barricade + plan.allies + plan.scavenge
  const next = plan[key] + delta
  if (next < 0) return
  if (delta > 0 && total >= DAY.hours) return
  plan[key] = next
  playSfx('tink', 0.3)
}

export function hoursLeft(): number {
  const plan = state.dayPlan
  return DAY.hours - (plan.barricade + plan.allies + plan.scavenge)
}

export function resolveDay(): void {
  if (state.phase !== 'day_plan') return
  const plan = state.dayPlan
  // Barricade
  const repairFraction = Math.min(1, plan.barricade * DAY.repairPerHour)
  const missing = BARRICADE.maxHealth - state.barricade.health
  const repaired = missing * repairFraction
  state.barricade.health = Math.min(BARRICADE.maxHealth, state.barricade.health + repaired)
  // Survivors
  let gained = Math.floor(plan.allies / DAY.alliesPerHours)
  if (plan.allies > 0 && Math.random() < DAY.allyBonusChance) gained++
  const before = state.allies
  state.allies = Math.min(4, state.allies + gained)
  gained = state.allies - before
  // Scavenge
  let weaponFound: WeaponId | null = null
  let scavengeLabel = 'Stayed inside'
  let alreadyOwned = false
  for (const tier of DAY.scavenge) {
    if (plan.scavenge >= tier.minHours) {
      scavengeLabel = tier.label
      const candidates = tier.finds.filter((w) => !state.inventory.includes(w))
      if (candidates.length > 0) {
        weaponFound = candidates[Math.floor(Math.random() * candidates.length)]
        state.inventory.push(weaponFound)
      } else {
        alreadyOwned = true
        weaponFound = tier.finds[0]
      }
      break
    }
  }
  state.dayResults = {
    repairedPercent: Math.round(repairFraction * 100),
    alliesGained: gained,
    alliesTotal: state.allies,
    weaponFound,
    scavengeLabel,
    alreadyOwned
  }
  // A brand-new find is equipped automatically; the results screen lets the player switch.
  if (weaponFound && !alreadyOwned) equipWeapon(weaponFound, true)
  state.hero.health = HERO.maxHealth
  playSfx('sale', 0.8)
  state.phase = 'day_results'
}

export function chooseWeapon(weapon: WeaponId): void {
  equipWeapon(weapon)
}

export function continueFromResults(): void {
  if (state.phase !== 'day_results') return
  state.barricade.health = Math.max(state.barricade.health, BARRICADE.maxHealth * BARRICADE.minAfterNight)
  beginNightDialogue(state.night + 1)
}

function gameOver(): void {
  state.phase = 'game_over'
  state.gameOverLine = GAME_OVER_LINES[Math.floor(Math.random() * GAME_OVER_LINES.length)]
  if (state.score > state.bestScore) state.bestScore = state.score
  clearProjectiles()
  clearPickups()
  stopAmbience()
  stopNarration()
  setMusicVolume(0.15)
  playSfx('gameOver', 1)
}

/** Retry the same night with a patched-up barricade. Score from the failed attempt is dropped. */
export function retryNight(): void {
  if (state.phase !== 'game_over') return
  clearAllTimers()
  clearEnemies()
  state.score = state.nightStats.scoreAtStart
  state.hero.health = HERO.maxHealth
  state.barricade.health = Math.max(state.nightStats.barricadeAtStart, BARRICADE.maxHealth * 0.5)
  beginNightDialogue(state.night)
}

export function restartRun(): void {
  clearAllTimers()
  clearEnemies()
  clearProjectiles()
  clearPickups()
  resetRun()
  syncAllies()
  beginNightDialogue(1)
}

export function toggleMute(): void {
  state.muted = !state.muted
  applyMute()
}

function toastSystem(dt: number): void {
  for (let i = state.toasts.length - 1; i >= 0; i--) {
    state.toasts[i].remaining -= dt
    if (state.toasts[i].remaining <= 0) state.toasts.splice(i, 1)
  }
}

/** Data for the HUD: how much of the night is done. */
export function nightProgress(): number {
  const s = state.nightStats
  if (s.toSpawn <= 0) return 0
  return Math.min(1, s.kills / s.toSpawn)
}
