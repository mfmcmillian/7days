import { engine } from '@dcl/sdk/ecs'
import { Vector3 } from '@dcl/sdk/math'
import { movePlayerTo } from '~system/RestrictedActions'
import { BARRICADE } from './config/balance'
import { PLAYER_PARK } from './config/geometry'
import { installAudio } from './core/audio'
import { installCamera } from './core/camera'
import { bootGame } from './core/game'
import { installInput } from './core/input'
import { state } from './core/state'
import { installTimers } from './core/timers'
import { installAllies } from './systems/allies'
import { installEnemies } from './systems/enemies'
import { installHero } from './systems/hero'
import { installPickups } from './systems/pickups'
import { installProjectiles } from './systems/projectiles'
import { installVfx } from './systems/vfx'
import { installUi } from './ui'
import { installDialogue } from './ui/dialogueController'
import { buildBarricade, updateBarricadeVisual } from './world/barricade'
import { buildCinema } from './world/cinema'
import { buildEnvironment, buildSpawnMarkers } from './world/environment'

export function main(): void {
  installTimers()
  installAudio()
  installInput()

  buildEnvironment()
  buildBarricade()
  buildSpawnMarkers()
  buildCinema()

  installVfx()
  installProjectiles()
  installEnemies()
  installPickups()
  installHero()
  installAllies()

  installCamera()
  installDialogue()
  installUi()

  // Park the (hidden) real avatar out of the way. The camera rig owns the view.
  void movePlayerTo({
    newRelativePosition: Vector3.create(PLAYER_PARK.x, PLAYER_PARK.y, PLAYER_PARK.z),
    cameraTarget: Vector3.create(40, 1, 31)
  })

  engine.addSystem(() => {
    updateBarricadeVisual(state.barricade.health / BARRICADE.maxHealth)
  }, 130, 'barricade-visual')

  bootGame()
}
