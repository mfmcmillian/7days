import ReactEcs, { Label, UiEntity } from '@dcl/sdk/react-ecs'
import { state } from '../../core/state'
import { Bar, Btn } from '../components'
import { C, F } from '../theme'
import { advanceDialogue, currentIndex, currentLines, lineProgress, skipDialogue } from '../dialogueController'
import { LaneZones } from './hud'

const SPEAKER_COLOR: Record<string, typeof C.text> = {
  HQ: C.blue,
  SOLDIER: C.accent,
  SURVIVOR: C.green,
  '—': C.textFaint
}

export function DialogueScreen() {
  const lines = currentLines()
  const idx = currentIndex()
  const line = lines[idx]
  if (!line) return null
  const isLast = idx >= lines.length - 1
  const heading = state.dialogueFor === 'outro' ? 'INCOMING TRANSMISSION' : `NIGHT ${state.dialogueFor} — INCOMING TRANSMISSION`
  return (
    <UiEntity uiTransform={{ positionType: 'absolute', position: { top: 0, left: 0 }, width: '100%', height: '100%' }}>
      {/* Tapping anywhere advances; lanes still respond so players can pre-position. */}
      <UiEntity uiTransform={{ positionType: 'absolute', position: { top: 0, left: 0 }, width: '100%', height: '100%' }} uiBackground={{ color: C.ghost }} onMouseDown={advanceDialogue} />
      {state.dialogueFor !== 'outro' ? <LaneZones showPads={false} /> : null}

      <UiEntity
        uiTransform={{
          positionType: 'absolute',
          position: { bottom: 0, left: 0 },
          width: '100%',
          height: 250,
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-end',
          padding: { bottom: 22 }
        }}
        uiBackground={{ color: C.bg }}
        onMouseDown={advanceDialogue}
      >
        <UiEntity uiTransform={{ width: 1100, flexDirection: 'column' }}>
          <Label value={heading} fontSize={F.tiny} color={C.textFaint} textAlign="middle-left" uiTransform={{ width: '100%', height: 24 }} />
          <UiEntity uiTransform={{ width: '100%', flexDirection: 'row', alignItems: 'flex-start', margin: { top: 6 } }}>
            <UiEntity uiTransform={{ width: 170, height: 44, justifyContent: 'center', alignItems: 'center' }} uiBackground={{ color: C.panel }}>
              <Label value={line.speaker} fontSize={F.body} color={SPEAKER_COLOR[line.speaker] ?? C.text} textAlign="middle-center" uiTransform={{ width: '100%', height: '100%' }} />
            </UiEntity>
            <Label
              value={line.text}
              fontSize={F.h3}
              color={C.text}
              textAlign="middle-left"
              textWrap="wrap"
              uiTransform={{ width: 900, minHeight: 44, margin: { left: 18 } }}
            />
          </UiEntity>
          <UiEntity uiTransform={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', margin: { top: 14 } }}>
            <UiEntity uiTransform={{ width: 500, flexDirection: 'column' }}>
              <Bar fraction={lineProgress()} color={C.textFaint} width={220} height={6} />
              <Label value={`${idx + 1} / ${lines.length}  ·  tap to continue`} fontSize={F.tiny} color={C.textFaint} textAlign="middle-left" uiTransform={{ width: '100%', height: 24, margin: { top: 6 } }} />
            </UiEntity>
            <UiEntity uiTransform={{ flexDirection: 'row' }}>
              {!isLast ? <Btn label="SKIP" width={160} height={64} color={C.btnSecondary} fontSize={F.body} onClick={skipDialogue} margin={{ right: 12 }} /> : null}
              <Btn label={isLast ? (state.dialogueFor === 'outro' ? 'CONTINUE' : 'HOLD THE LINE') : 'NEXT'} width={isLast ? 300 : 200} height={64} fontSize={F.body} onClick={advanceDialogue} margin={{}} />
            </UiEntity>
          </UiEntity>
        </UiEntity>
      </UiEntity>
    </UiEntity>
  )
}
