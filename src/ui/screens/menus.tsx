import ReactEcs, { Label, UiEntity } from '@dcl/sdk/react-ecs'
import { BARRICADE, TOTAL_NIGHTS } from '../../config/balance'
import { GAME_NAME, NIGHT_TITLES } from '../../config/dialogue'
import { continueToDayPlan, restartRun, retryNight, skipCutscene, startFromIntro } from '../../core/game'
import { state } from '../../core/state'
import { Btn, Overlay, Panel, Row, Spacer, Stat, Text, Title } from '../components'
import { C, F, fmt } from '../theme'
import { MuteButton } from './hud'

export function IntroScreen() {
  return (
    <Overlay color={C.transparent} justify="flex-end">
      <UiEntity
        uiTransform={{ width: '100%', height: 420, flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', padding: { bottom: 36 } }}
        uiBackground={{ color: C.bg }}
      >
        <Label value={GAME_NAME.toUpperCase()} fontSize={F.hero} color={C.accent} textAlign="middle-center" uiTransform={{ width: '100%', height: 110 }} />
        <Text value="Seven nights. One barricade. Hold the line until extraction." size={F.body} color={C.textDim} />
        <Spacer h={10} />
        <Btn label="TAP TO START" width={440} height={90} fontSize={F.h2} onClick={startFromIntro} />
        <Text value="Tap a lane to move  ·  You fire automatically  ·  Keep the wall standing" size={F.small} color={C.textFaint} />
        {state.bestScore > 0 ? <Text value={`Best score ${fmt(state.bestScore)}`} size={F.small} color={C.gold} /> : null}
      </UiEntity>
      <UiEntity uiTransform={{ positionType: 'absolute', position: { top: 16, right: 20 } }}>
        <MuteButton />
      </UiEntity>
    </Overlay>
  )
}

export function CutsceneScreen(p: { label: string }) {
  return (
    <UiEntity uiTransform={{ positionType: 'absolute', position: { bottom: 24, right: 24 }, flexDirection: 'row', alignItems: 'center' }}>
      <Label value={p.label} fontSize={F.small} color={C.textDim} textAlign="middle-right" uiTransform={{ height: 64, margin: { right: 16 } }} />
      <Btn label="SKIP" width={200} height={64} color={C.btnSecondary} fontSize={F.body} onClick={skipCutscene} margin={{}} />
    </UiEntity>
  )
}

export function NightCompleteScreen() {
  const s = state.nightStats
  const gained = state.score - s.scoreAtStart
  const barPct = Math.round((state.barricade.health / BARRICADE.maxHealth) * 100)
  return (
    <Overlay>
      <Panel width={900}>
        <Text value={`NIGHT ${state.night} SURVIVED`} size={F.small} color={C.accent} />
        <Title value={NIGHT_TITLES[state.night]?.toUpperCase() ?? 'DAWN'} />
        <Row margin={{ top: 10, bottom: 10 }}>
          <Stat label="KILLS" value={`${s.kills}`} />
          <Stat label="BARRICADE" value={`${barPct}%`} color={barPct < 35 ? C.red : C.barricade} />
          <Stat label="TIME" value={`${Math.floor(s.elapsed / 60)}:${Math.floor(s.elapsed % 60).toString().padStart(2, '0')}`} />
          <Stat label="NIGHT SCORE" value={`+${fmt(gained)}`} color={C.gold} />
        </Row>
        <Text value={`Total ${fmt(state.score)}`} size={F.h3} color={C.text} />
        <Spacer h={8} />
        <Text value="The sun is coming up. You have 12 hours before they return." color={C.textDim} />
        <Btn label="PLAN THE DAY" width={420} onClick={continueToDayPlan} />
      </Panel>
    </Overlay>
  )
}

export function GameOverScreen() {
  return (
    <Overlay>
      <Panel width={900}>
        <Text value={`NIGHT ${state.night} OF ${TOTAL_NIGHTS}`} size={F.small} color={C.textFaint} />
        <Title value="YOU DIDN’T MAKE IT" color={C.red} />
        <Text value={state.gameOverLine} color={C.textDim} />
        <Row margin={{ top: 12, bottom: 12 }}>
          <Stat label="SCORE" value={fmt(state.score)} color={C.gold} />
          <Stat label="KILLS THIS RUN" value={`${state.totalKills}`} />
          <Stat label="BEST" value={fmt(state.bestScore)} />
        </Row>
        <Row>
          <Btn label={`RETRY NIGHT ${state.night}`} sub="wall patched to 50%" width={400} onClick={retryNight} margin={{ right: 12 }} />
          <Btn label="START OVER" width={300} color={C.btnSecondary} onClick={restartRun} margin={{ left: 12 }} />
        </Row>
      </Panel>
    </Overlay>
  )
}

export function VictoryScreen() {
  return (
    <Overlay>
      <Panel width={940}>
        <Text value="SEVEN NIGHTS" size={F.small} color={C.accent} />
        <Title value="EXTRACTION CONFIRMED" color={C.gold} />
        <Text value="Delta-1 held the line. Command is already counting down the next seven days." color={C.textDim} />
        <Row margin={{ top: 12, bottom: 12 }}>
          <Stat label="FINAL SCORE" value={fmt(state.score)} color={C.gold} />
          <Stat label="KILLS" value={`${state.totalKills}`} />
          <Stat label="SURVIVORS SAVED" value={`${state.allies}`} color={C.green} />
          <Stat label="BEST" value={fmt(state.bestScore)} />
        </Row>
        <Btn label="PLAY AGAIN" width={420} onClick={restartRun} />
      </Panel>
    </Overlay>
  )
}
