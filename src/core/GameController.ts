/**
 * Game Controller for Neural Collapse
 * Manages game lifecycle and state transitions
 */

import { engine, InputModifier } from '@dcl/sdk/ecs'
import { ReactEcsRenderer } from '@dcl/sdk/react-ecs'
import * as utils from '@dcl-sdk/utils'
import {
  gameStateEntity,
  playerEntity,
  resetGameState,
  setGamePhase,
  weaponAmmo,
  updateLastShotTime
} from './GameState'
import {
  GameState,
  Health,
  Player,
  Weapon,
  PlayerBuffs,
  DoubleTapMachine,
  RoyalArmorMachine,
  QuickReloadMachine,
  ExecutionersChestMachine,
  PowerUp,
  Zombie
} from '../components/GameComponents'
import { createWeapon } from '../entities/WeaponFactory'
import { removeAllZombies } from '../entities/ZombieFactory'
import { removeAllPowerUps } from '../features/PowerUpManager'
import { removeAllBarricades, initializeTestBarricades } from '../features/BarricadeManager'
import { spawnNextWave } from '../features/WaveManager'
import { playSound } from '../audio/SoundManager'
import { resetAllySystem } from '../systems/AllyZombieSystem'
import { resetFighterWeapon } from '../systems/FighterWeaponSystem'
import { resetWeaponBoxSystem } from '../systems/WeaponBoxSystem'
import { startStoryWave } from '../systems/StoryWaveManager'
import {
  doubleTapMachineEntity,
  royalArmorMachineEntity,
  quickReloadMachineEntity,
  executionersChestMachineEntity,
  resetPerkMachines
} from '../features/PerkMachineManager'
import { MainUI, StartMenu, GameOverMenu } from '../ui/GameUI.js'
import { Vector3 } from '@dcl/sdk/math'

/**
 * Start the game
 */
export function startGame() {
  console.log('Starting Neural Collapse...')

  // Unfreeze player - REPLACE with enabled state
  console.log('Enabling all player controls...')
  InputModifier.createOrReplace(engine.PlayerEntity, {
    mode: {
      $case: 'standard',
      standard: {
        disableWalk: false,
        disableRun: false,
        disableJog: false,
        disableJump: false
      }
    }
  })
  console.log('✅ Controls ENABLED')

  // Delete after a frame
  utils.timers.setTimeout(() => {
    try {
      InputModifier.deleteFrom(engine.PlayerEntity)
      console.log('✅ InputModifier deleted')
    } catch (e) {}
  }, 50)

  // Switch to main game UI
  ReactEcsRenderer.setUiRenderer(MainUI)

  // Reset game state
  resetGameState()

  const gameState = GameState.getMutable(gameStateEntity)
  gameState.phase = 'storyDialog' // Start with story dialog for wave 1
  gameState.currentWave = 0 // Will be set to 1 when story starts
  gameState.score = 0
  gameState.paused = false
  gameState.storyMode = true // Enable story mode
  gameState.zombiesKilledThisWave = 0
  gameState.bossSpawned = false
  gameState.bossAlive = false

  // Reset weapon ammo to default values
  weaponAmmo.pistol = 10
  weaponAmmo.shotgun = 5
  weaponAmmo.rifle = 30

  // Reset last shot time
  updateLastShotTime(Date.now())

  // Reset perk machines
  resetPerkMachines()

  // Reset player buffs
  const playerBuffs = PlayerBuffs.getMutable(engine.PlayerEntity)
  playerBuffs.damageMultiplier = 1
  playerBuffs.damageExpiry = 0
  playerBuffs.reloadSpeedMultiplier = 1
  playerBuffs.reloadSpeedExpiry = 0

  // Reset player health
  const playerHealth = Health.getMutable(engine.PlayerEntity)
  playerHealth.max = 100
  playerHealth.current = 100

  // Remove current weapon if it exists
  const player = Player.getOrNull(playerEntity)
  if (player && player.weapons.length > 0) {
    for (const weapon of player.weapons) {
      engine.removeEntity(weapon)
    }
    const mutablePlayer = Player.getMutable(playerEntity)
    mutablePlayer.weapons = []
    mutablePlayer.currentWeaponIndex = -1
  }

  // Create and equip pistol with full ammo
  const pistol = createWeapon('pistol', Vector3.Zero())
  const pistolWeapon = Weapon.getMutable(pistol)
  pistolWeapon.ammo = weaponAmmo.pistol

  // Initialize player with pistol
  const mutablePlayer = Player.getMutable(playerEntity)
  mutablePlayer.weapons = [pistol]
  mutablePlayer.currentWeaponIndex = 0

  // Create the barricade
  initializeTestBarricades()

  // Start the first wave
  spawnNextWave()

  console.log('Game started!')
}

/**
 * Show game over screen
 */
export function showGameOver() {
  console.log('Game Over!')

  // Play game over sound
  playSound('gameOver', 'sounds/zombie-sounds/gameOver.mp3')

  // Switch to game over UI
  ReactEcsRenderer.setUiRenderer(GameOverMenu)

  const gameState = GameState.getMutable(gameStateEntity)
  gameState.phase = 'gameOver'
  gameState.kills = 0
  gameState.headshots = 0

  // Remove all active power-ups
  removeAllPowerUps()

  // Remove all barricades
  removeAllBarricades()

  // Reset all allies (lose all zombies on death)
  resetAllySystem()

  // Reset fighter weapon back to pistol
  resetFighterWeapon()

  // Reset weapon boxes
  resetWeaponBoxSystem()

  // Reset executioner chest upgrades
  const executionersChestMachine = ExecutionersChestMachine.getMutable(executionersChestMachineEntity)
  executionersChestMachine.upgradedWeapons = []
  executionersChestMachine.purchased = false

  // Reset weapon damages and models to default values
  const player = Player.getOrNull(playerEntity)
  if (player) {
    for (const weapon of player.weapons) {
      const weaponComponent = Weapon.getOrNull(weapon)
      if (weaponComponent) {
        const mutableWeapon = Weapon.getMutable(weapon)

        // Reset to default stats
        switch (weaponComponent.type) {
          case 'pistol':
            mutableWeapon.damage = 10
            mutableWeapon.modelPath = 'models/pistol.glb'
            mutableWeapon.ammo = 12
            mutableWeapon.storedAmmo = 12
            break
          case 'shotgun':
            mutableWeapon.damage = 20
            mutableWeapon.modelPath = 'models/Shotgun.glb'
            mutableWeapon.ammo = 6
            mutableWeapon.storedAmmo = 6
            break
          case 'rifle':
            mutableWeapon.damage = 15
            mutableWeapon.modelPath = 'models/rifle.glb'
            mutableWeapon.ammo = 25
            mutableWeapon.storedAmmo = 25
            break
        }
      }
    }
  }
}

/**
 * Restart the game
 */
export function restartGame() {
  console.log('Restarting game...')

  // Unfreeze player
  try {
    InputModifier.deleteFrom(engine.PlayerEntity)
  } catch (e) {
    // Ignore
  }

  // Switch back to start menu
  ReactEcsRenderer.setUiRenderer(StartMenu)

  // Reset player health
  const playerHealth = Health.getMutable(engine.PlayerEntity)
  playerHealth.current = 100
  playerHealth.max = 100

  // Reset game state
  const gameState = GameState.getMutable(gameStateEntity)
  gameState.score = 0
  gameState.currentWave = 0
  gameState.zombiesRemaining = 0
  gameState.paused = false

  // Reset weapon ammo
  weaponAmmo.pistol = 10
  weaponAmmo.shotgun = 5
  weaponAmmo.rifle = 30

  // Reset last shot time
  updateLastShotTime(Date.now())

  // Remove current weapons
  const player = Player.getOrNull(playerEntity)
  if (player && player.weapons.length > 0) {
    for (const weapon of player.weapons) {
      engine.removeEntity(weapon)
    }
    const mutablePlayer = Player.getMutable(playerEntity)
    mutablePlayer.weapons = []
    mutablePlayer.currentWeaponIndex = -1
  }

  // Remove all zombies
  removeAllZombies()

  // Remove all barricades
  removeAllBarricades()

  // Set phase to menu
  gameState.phase = 'menu'

  console.log('Returned to main menu')
}
