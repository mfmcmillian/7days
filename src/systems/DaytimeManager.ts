/**
 * Daytime Manager
 * Handles daytime UI flow and calculations
 */

import { ReactEcsRenderer } from '@dcl/sdk/react-ecs'
import { GameState } from '../components/GameComponents'
import { gameStateEntity } from '../core/GameState'
import { DaytimeAllocationMenu, resetDaytimeAllocation } from '../ui/DaytimeAllocationMenu'
import { DaytimeResultsScreen, resetDaytimeResults } from '../ui/DaytimeResultsScreen'
import { MainUI } from '../ui/GameUI'
import { addAllies } from '../systems/AllyZombieSystem'
import { setFighterWeapon } from '../systems/FighterWeaponSystem'
import { repairAllBarricades } from '../features/BarricadeManager'
import type { FighterWeaponType } from '../systems/FighterWeaponSystem'
import * as utils from '@dcl-sdk/utils'

// Daytime state
let isDaytimeActive = false
let isAllocationActive = false
let isResultsActive = false
let currentNight = 0

// Weapon inventory - tracks all weapons found
let weaponInventory: string[] = ['Pistol'] // Start with pistol

// Results data
let alliesFound = 0
let weaponFound: string | null = null
let barricadeHealth = 100

/**
 * Start daytime allocation phase
 */
export function startDaytimeAllocation(nightNumber: number): void {
  console.log(`🌅 Starting daytime allocation for Night ${nightNumber}...`)

  isDaytimeActive = true
  isAllocationActive = true
  isResultsActive = false
  currentNight = nightNumber
  resetDaytimeAllocation()

  // Set UI to allocation menu
  ReactEcsRenderer.setUiRenderer(() =>
    DaytimeAllocationMenu({
      onComplete: handleAllocationComplete
    })
  )
}

/**
 * Handle allocation complete - calculate results
 */
function handleAllocationComplete(barricadeHours: number, allyHours: number, scavengeHours: number): void {
  console.log(`📊 Allocation complete: Barricade=${barricadeHours}h, Allies=${allyHours}h, Scavenge=${scavengeHours}h`)

  // Calculate results
  alliesFound = calculateAllies(allyHours)
  weaponFound = calculateWeapon(scavengeHours)
  barricadeHealth = calculateBarricade(barricadeHours)

  // Add new weapon to inventory if found
  if (weaponFound && !weaponInventory.includes(weaponFound)) {
    weaponInventory.push(weaponFound)
    console.log(`🔫 New weapon added to inventory: ${weaponFound}`)
  }

  console.log(`✅ Results: Allies=${alliesFound}, Weapon=${weaponFound}, Barricade=${barricadeHealth}%`)

  // Switch to results screen
  isAllocationActive = false
  isResultsActive = true
  resetDaytimeResults()

  ReactEcsRenderer.setUiRenderer(() =>
    DaytimeResultsScreen({
      alliesFound,
      weaponFound,
      barricadeHealth,
      weaponInventory: [...weaponInventory], // Pass copy of inventory
      onContinue: handleResultsContinue
    })
  )
}

/**
 * Handle results continue - apply changes and start night
 */
function handleResultsContinue(selectedWeapon: string): void {
  console.log(`🌙 Applying daytime results and starting night...`)
  console.log(`🔫 Selected weapon: ${selectedWeapon}`)

  // Apply allies
  if (alliesFound > 0) {
    addAllies(alliesFound)
    console.log(`👥 Added ${alliesFound} allies`)
  }

  // Apply selected weapon (from inventory)
  const weaponType = mapWeaponNameToType(selectedWeapon)
  if (weaponType) {
    setFighterWeapon(weaponType)
    console.log(`🔫 Equipped ${selectedWeapon}`)
  }

  // Apply barricade repair
  if (barricadeHealth > 0) {
    repairAllBarricades(barricadeHealth)
    console.log(`🛡️ Barricades repaired by ${barricadeHealth}%`)
  }

  // Switch back to main UI
  isDaytimeActive = false
  isAllocationActive = false
  isResultsActive = false
  ReactEcsRenderer.setUiRenderer(MainUI)

  // Trigger next night
  const gameState = GameState.getMutable(gameStateEntity)
  // IMPORTANT: Increment wave counter BEFORE triggering dialogue
  // (Dialogue system reads currentWave + 1, so we need to set it correctly)
  gameState.currentWave = currentNight
  gameState.phase = 'waveDialogue' // Will trigger dialogue, then night starts
}

/**
 * Calculate allies found
 * Formula: floor(hours / 4) + random(0-1)
 */
function calculateAllies(hours: number): number {
  if (hours === 0) return 0

  const base = Math.floor(hours / 4)
  const bonus = Math.random() < 0.5 ? 1 : 0
  return base + bonus
}

/**
 * Calculate weapon found
 * Tiered by hours: 0-3 = low, 4-6 = mid, 7+ = high
 */
function calculateWeapon(hours: number): string | null {
  if (hours === 0) return null

  let tier: 'low' | 'mid' | 'high'
  if (hours <= 3) {
    tier = 'low'
  } else if (hours <= 6) {
    tier = 'mid'
  } else {
    tier = 'high'
  }

  // Random weapon from tier
  const lowTier = ['Pistol']
  const midTier = ['Rifle', 'Shotgun']
  const highTier = ['Assault Rifle', 'Enhanced Rifle']

  let pool: string[]
  switch (tier) {
    case 'low':
      pool = lowTier
      break
    case 'mid':
      pool = midTier
      break
    case 'high':
      pool = highTier
      break
  }

  return pool[Math.floor(Math.random() * pool.length)]
}

/**
 * Calculate barricade health
 * Formula: 0% base + 20% per hour (max 100%)
 */
function calculateBarricade(hours: number): number {
  // 0 hours = 0% repair, each hour = 20% repair
  const health = Math.min(100, hours * 20)
  return health
}

/**
 * Map weapon name to FighterWeaponType
 */
function mapWeaponNameToType(weaponName: string): FighterWeaponType | null {
  switch (weaponName) {
    case 'Pistol':
      return 'pistol'
    case 'Rifle':
    case 'Enhanced Rifle':
      return 'rifle'
    case 'Assault Rifle':
    case 'Shotgun':
      return 'assault'
    default:
      return null
  }
}

/**
 * Check if daytime is active
 */
export function isDaytimeActiveCheck(): boolean {
  return isDaytimeActive
}

/**
 * Daytime system - checks game state and shows screens when needed
 */
export function daytimeSystem(dt: number): void {
  const gameState = GameState.get(gameStateEntity)

  // Check if we need to start daytime
  if (gameState.phase === 'daytime' && !isDaytimeActive) {
    startDaytimeAllocation(gameState.currentWave)
  }
}
