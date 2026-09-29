import ReactEcs, { ReactEcsRenderer, UiEntity } from '@dcl/sdk/react-ecs'
import { state } from '../core/state'
import { onConfirm } from '../core/input'
import { continueFromResults, continueToDayPlan, resolveDay, restartRun, retryNight, skipCutscene, startFromIntro } from '../core/game'
import { DayPlanScreen, DayResultsScreen } from './screens/day'
import { DialogueScreen } from './screens/dialogue'
import { Hud, Toasts } from './screens/hud'
import { CutsceneScreen, GameOverScreen, IntroScreen, NightCompleteScreen, VictoryScreen } from './screens/menus'
import { VH, VW } from './theme'

function Root() {
  switch (state.phase) {
    case 'intro':
      return <IntroScreen />
    case 'briefing':
      return <CutsceneScreen label="MISSION BRIEFING" />
    case 'dialogue':
      return <DialogueScreen />
    case 'night':
      return <Hud />
    case 'night_complete':
      return <NightCompleteScreen />
    case 'day_plan':
      return <DayPlanScreen />
    case 'day_results':
      return <DayResultsScreen />
    case 'game_over':
      return (
        <UiEntity uiTransform={{ positionType: 'absolute', position: { top: 0, left: 0 }, width: '100%', height: '100%' }}>
          <GameOverScreen />
          <Toasts />
        </UiEntity>
      )
    case 'outro':
      return <CutsceneScreen label="EXTRACTION" />
    case 'victory':
      return <VictoryScreen />
    default:
      return null
  }
}

export function installUi(): void {
  ReactEcsRenderer.setUiRenderer(Root, { virtualWidth: VW, virtualHeight: VH })

  // Keyboard "E" / space mirrors whatever the primary button on the current screen does.
  onConfirm(() => {
    switch (state.phase) {
      case 'intro':
        startFromIntro()
        break
      case 'briefing':
      case 'outro':
        skipCutscene()
        break
      case 'night_complete':
        continueToDayPlan()
        break
      case 'day_plan':
        resolveDay()
        break
      case 'day_results':
        continueFromResults()
        break
      case 'game_over':
        retryNight()
        break
      case 'victory':
        restartRun()
        break
      default:
        break
    }
  })
}
