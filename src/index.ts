/**
 * Neural Collapse - Main Entry Point
 * A zombie survival horror game for Decentraland
 * NOW IN SIDE-SCROLLING SURVIVAL MODE (Last War Survival style)
 */

import { engine, Transform } from '@dcl/sdk/ecs'
import { ReactEcsRenderer } from '@dcl/sdk/react-ecs'
import { Vector3 } from '@dcl/sdk/math'

// Core
import { initializeGameState, initializePlayer } from './core/GameState'

// Scene
import { Landscape } from './scene/Landscape'

// Audio
import { initializeSoundPools } from './audio/SoundManager'

// Features
import { initializeWeaponMachines } from './features/WeaponMachineManager'
import { initializePerkMachines } from './features/PerkMachineManager'

// Systems
import { zombieSystem, dyingZombieSystem } from './systems/ZombieSystem'
import { shootingSystem, weaponRecoilSystem, weaponSwitchSystem, weaponReloadSystem } from './systems/WeaponSystem'
import { raycastResultSystem, scoreIndicatorSystem } from './systems/RaycastSystem'
import { powerUpSystem } from './systems/PowerUpSystem'
import { weaponMachineSystem, perkMachineSystem } from './systems/MachineSystem'
import { animationSystem } from './systems/AnimationSystem'
import { waveSpawnSystem } from './systems/WaveSpawnSystem'
import { gameStateSystem } from './systems/GameStateSystem'
import { backgroundSirenSoundSystem, backgroundMusicSystem } from './systems/BackgroundSoundSystem'
import { muzzleFlashSystem, bloodEffectSystem } from './systems/VisualEffectsSystem'
import { setupSideViewCamera } from './systems/SideViewCameraSystem'
import { createPlayerFighter } from './systems/PlayerFighterSystem'
import { enableFighterMovement } from './systems/FighterMovementSystem'
import { lockAvatar } from './systems/AvatarLockSystem'
import { createSpawnDebugBoxes } from './systems/SpawnDebugSystem'
import { fighterAutoFireSystem, projectileUpdateSystem } from './systems/FighterWeaponSystem'
import { upgradeBoxSpawnSystem, upgradeBoxUpdateSystem } from './systems/UpgradeBoxSystem'
import { allyFormationSystem, dyingAllySystem } from './systems/AllyZombieSystem'
import { powerUpSpawnSystem, powerUpUpdateSystem } from './systems/MovingPowerUpSystem'
import { weaponBoxSpawnSystem, weaponBoxUpdateSystem } from './systems/WeaponBoxSystem'
import { storyModeSystem } from './systems/StoryModeSystem'
import { storyZombieSpawnSystem } from './systems/StoryZombieSpawner'
import { waveDialogueSystem } from './systems/WaveDialogueManager'
import { nightCompleteSystem } from './systems/WaveCompleteManager'
import { daytimeSystem } from './systems/DaytimeManager'
import { victorySystem } from './systems/VictoryManager'
import { barricadeSystem, barricadeVisualSystem } from './systems/BarricadeSystem'

// UI
import { StartMenu } from './ui/GameUI.js'
import { startIntroCutscene } from './ui/CutsceneManager'
import { updateEntryCutsceneFade } from './ui/EntryCutscene'

// Constants
import { PLAYER_START_POSITION } from './utils/constants'

/**
 * Main initialization function
 */
export function main() {
  console.log('Initializing Neural Collapse...')

  // Initialize game state
  initializeGameState()
  initializePlayer()

  // Initialize landscape (buildings, walls, floor, props)
  console.log('Creating landscape...')
  new Landscape()

  // SIDE-SCROLLING MODE: Setup locked camera and movement
  console.log('🎮 Setting up side-scrolling survival mode...')

  // 1. Setup static side-view camera
  setupSideViewCamera()

  // 2. Create player's fighter entity (zombie you control)
  createPlayerFighter()

  // 3. Hide and lock the actual player avatar (like Fright Night)
  lockAvatar()

  // 4. Enable fighter movement system (WASD controls the zombie fighter)
  enableFighterMovement()

  // 5. Create debug spawn point boxes (for testing) - DISABLED
  // createSpawnDebugBoxes()

  console.log('✅ Side-scrolling mode active!')
  console.log('   → Camera: Locked side-view')
  console.log('   → Fighter: Zombie (controllable with WASD)')
  console.log('   → Avatar: Hidden and locked')
  console.log('   → Zombies: Spawn ahead and advance')

  // Initialize weapon machines
  initializeWeaponMachines()

  // Initialize perk machines
  initializePerkMachines()

  // Initialize sound pools
  initializeSoundPools()

  // Register all game systems
  console.log('Registering game systems...')

  // Core gameplay systems
  engine.addSystem(shootingSystem)
  engine.addSystem(raycastResultSystem)
  engine.addSystem(zombieSystem)
  engine.addSystem(dyingZombieSystem)
  engine.addSystem(waveSpawnSystem)

  // Barricade systems
  engine.addSystem(barricadeSystem)
  engine.addSystem(barricadeVisualSystem)

  // Weapon systems
  engine.addSystem(weaponRecoilSystem)
  // engine.addSystem(weaponSwitchSystem) // DISABLED for side-scrolling mode
  engine.addSystem(weaponReloadSystem)

  // Fighter weapon systems (side-scrolling auto-fire)
  engine.addSystem(fighterAutoFireSystem)
  engine.addSystem(projectileUpdateSystem)

  // Upgrade box systems (red/blue boxes for ally zombies)
  engine.addSystem(upgradeBoxSpawnSystem)
  engine.addSystem(upgradeBoxUpdateSystem)

  // Ally zombie systems
  engine.addSystem(allyFormationSystem)
  engine.addSystem(dyingAllySystem)

  // Moving powerup systems (Last War style)
  engine.addSystem(powerUpSpawnSystem)
  engine.addSystem(powerUpUpdateSystem)

  // Weapon box systems (weapon pickups)
  engine.addSystem(weaponBoxSpawnSystem)
  engine.addSystem(weaponBoxUpdateSystem)

  // Story mode system (boss spawning and wave completion)
  engine.addSystem(storyModeSystem)

  // Story mode zombie spawner (spawns zombies for story waves)
  engine.addSystem(storyZombieSpawnSystem)

  // Wave dialogue system (shows dialogue between waves)
  engine.addSystem(waveDialogueSystem)

  // Night complete system (shows completion screen)
  engine.addSystem(nightCompleteSystem)

  // Daytime system (allocation and results)
  engine.addSystem(daytimeSystem)

  // Victory system (shows victory screen after Night 18)
  engine.addSystem(victorySystem)

  // Machine interaction systems
  engine.addSystem(weaponMachineSystem)
  engine.addSystem(perkMachineSystem)

  // Power-up and effects systems
  engine.addSystem(powerUpSystem)
  engine.addSystem(animationSystem)

  // Visual effects systems
  engine.addSystem(muzzleFlashSystem)
  engine.addSystem(bloodEffectSystem)

  // UI and game state systems
  engine.addSystem(gameStateSystem)
  engine.addSystem(scoreIndicatorSystem)

  // Background ambient sounds and music
  engine.addSystem(backgroundMusicSystem)
  engine.addSystem(backgroundSirenSoundSystem)

  // Cutscene fade system
  engine.addSystem(updateEntryCutsceneFade)

  console.log('All systems registered')

  // Setup UI - start with intro cutscene
  startIntroCutscene()
  console.log('UI initialized with intro cutscene')

  console.log('Neural Collapse initialization complete!')
}

// Start the game
main()
