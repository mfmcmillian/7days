import ReactEcs, { Label, UiEntity } from '@dcl/sdk/react-ecs'
import { ALLIES, BARRICADE, HERO, PICKUPS, WEAPONS } from '../../config/balance'
import { NIGHT_TITLES } from '../../config/dialogue'
import { LANE_COUNT } from '../../config/geometry'
import { nightProgress, toggleMute } from '../../core/game'
import { requestLane } from '../../core/input'
import { state } from '../../core/state'
import { Bar } from '../components'
import { C, F, fmt, rgba } from '../theme'

/**
 * Three full-height tap zones. Tapping a column moves the hero to that lane.
 * Rendered under the rest of the HUD so buttons on top still win.
 */
export function LaneZones(p: { showPads: boolean }) {
  return (
    <UiEntity
      uiTransform={{
        positionType: 'absolute',
        position: { top: 0, left: 0 },
        width: '100%',
        height: '100%',
        flexDirection: 'row'
      }}
    >
      {Array.from({ length: LANE_COUNT }).map((_, lane) => {
        const active = state.hero.lane === lane
        return (
          <UiEntity
            key={`lane-${lane}`}
            uiTransform={{ width: `${100 / LANE_COUNT}%`, height: '100%', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center' }}
            uiBackground={{ color: C.ghost }}
            onMouseDown={() => requestLane(lane)}
          >
            {p.showPads ? (
              <UiEntity
                uiTransform={{ width: '86%', height: 54, margin: { bottom: 150 }, justifyContent: 'center', alignItems: 'center' }}
                uiBackground={{ color: active ? C.laneActive : C.laneIdle }}
              >
                <Label
                  value={active ? '▲  YOU' : 'TAP TO MOVE'}
                  fontSize={F.tiny}
                  color={active ? C.text : C.textFaint}
                  textAlign="middle-center"
                  uiTransform={{ width: '100%', height: '100%' }}
                />
              </UiEntity>
            ) : null}
          </UiEntity>
        )
      })}
    </UiEntity>
  )
}

function TopBar() {
  const s = state.nightStats
  const progress = nightProgress()
  return (
    <UiEntity
      uiTransform={{
        positionType: 'absolute',
        position: { top: 12, left: 0 },
        width: '100%',
        height: 92,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: { left: 20, right: 20 }
      }}
    >
      {/* Night + horde progress */}
      <UiEntity uiTransform={{ width: 380, flexDirection: 'column' }} uiBackground={{ color: C.panelSoft }}>
        <UiEntity uiTransform={{ width: '100%', height: 44, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: { left: 14, right: 14 } }}>
          <Label value={`NIGHT ${state.night}`} fontSize={F.h3} color={C.text} textAlign="middle-left" uiTransform={{ height: '100%' }} />
          <Label value={NIGHT_TITLES[state.night] ?? ''} fontSize={F.small} color={C.textDim} textAlign="middle-right" uiTransform={{ height: '100%' }} />
        </UiEntity>
        <UiEntity uiTransform={{ width: '100%', padding: { left: 14, right: 14, bottom: 10 } }}>
          <Bar fraction={progress} color={C.accent} width="100%" height={18} label="HORDE" value={`${s.kills} / ${s.toSpawn}`} fontSize={F.tiny} />
        </UiEntity>
      </UiEntity>

      {/* Score */}
      <UiEntity uiTransform={{ width: 360, flexDirection: 'column', alignItems: 'center' }}>
        <Label value={fmt(state.score)} fontSize={F.h1} color={C.gold} textAlign="middle-center" uiTransform={{ width: '100%', height: 62 }} />
        {s.bossAlive ? (
          <Bar fraction={s.bossMaxHealth > 0 ? s.bossHealth / s.bossMaxHealth : 0} color={C.boss} width={340} height={20} label="BOSS" value={`${Math.ceil(s.bossHealth)}`} fontSize={F.tiny} />
        ) : (
          <Label value={`${state.totalKills} kills`} fontSize={F.tiny} color={C.textFaint} textAlign="middle-center" uiTransform={{ width: '100%', height: 20 }} />
        )}
      </UiEntity>

      {/* Allies + mute */}
      <UiEntity uiTransform={{ width: 380, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'flex-start' }}>
        <UiEntity uiTransform={{ height: 44, padding: { left: 14, right: 14 }, justifyContent: 'center', alignItems: 'center', margin: { right: 10 } }} uiBackground={{ color: C.panelSoft }}>
          <Label value={`SURVIVORS ${state.allies}/${ALLIES.max}`} fontSize={F.small} color={C.textDim} textAlign="middle-center" uiTransform={{ height: '100%' }} />
        </UiEntity>
        <MuteButton />
      </UiEntity>
    </UiEntity>
  )
}

export function MuteButton() {
  return (
    <UiEntity
      uiTransform={{ width: 64, height: 64, justifyContent: 'center', alignItems: 'center' }}
      uiBackground={{ color: C.panelSoft }}
      onMouseDown={toggleMute}
    >
      <Label value={state.muted ? 'MUTED' : 'SOUND'} fontSize={F.tiny} color={state.muted ? C.textFaint : C.text} textAlign="middle-center" uiTransform={{ width: '100%', height: '100%' }} />
    </UiEntity>
  )
}

function AmmoPips() {
  const def = WEAPONS[state.hero.weapon]
  const pips = Math.min(def.magSize, 16)
  const perPip = def.magSize / pips
  const filled = Math.ceil(state.hero.ammo / perPip)
  return (
    <UiEntity uiTransform={{ width: '100%', height: 14, flexDirection: 'row', justifyContent: 'flex-start', margin: { top: 6 } }}>
      {Array.from({ length: pips }).map((_, i) => (
        <UiEntity
          key={`pip-${i}`}
          uiTransform={{ width: `${100 / pips - 1}%`, height: '100%', margin: { right: 3 } }}
          uiBackground={{ color: i < filled ? C.text : Color4Faint }}
        />
      ))}
    </UiEntity>
  )
}
const Color4Faint = rgba([1, 1, 1], 0.12)

function BottomBar() {
  const hp = state.hero.health / HERO.maxHealth
  const bar = state.barricade.health / BARRICADE.maxHealth
  const def = WEAPONS[state.hero.weapon]
  return (
    <UiEntity
      uiTransform={{
        positionType: 'absolute',
        position: { bottom: 14, left: 0 },
        width: '100%',
        height: 130,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        padding: { left: 20, right: 20 }
      }}
    >
      {/* Hero */}
      <UiEntity uiTransform={{ width: 420, flexDirection: 'column', padding: 14 }} uiBackground={{ color: C.panelSoft }}>
        <Bar fraction={hp} color={hp < 0.35 ? C.hpLow : C.hp} width="100%" height={24} label="DELTA-1" value={`${Math.ceil(state.hero.health)}`} fontSize={F.tiny} />
        <UiEntity uiTransform={{ width: '100%', height: 30, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', margin: { top: 8 } }}>
          <Label value={def.name.toUpperCase()} fontSize={F.small} color={C.text} textAlign="middle-left" uiTransform={{ height: '100%' }} />
          <Label
            value={state.hero.reloading ? 'RELOADING' : state.effects.some((e) => e.kind === 'max_ammo') ? '∞' : `${state.hero.ammo} / ${def.magSize}`}
            fontSize={F.small}
            color={state.hero.reloading ? C.gold : C.textDim}
            textAlign="middle-right"
            uiTransform={{ height: '100%' }}
          />
        </UiEntity>
        {state.hero.reloading ? (
          <Bar fraction={1 - state.hero.reloadRemaining / def.reloadSeconds} color={C.gold} width="100%" height={8} bg={C.barBg} />
        ) : (
          <AmmoPips />
        )}
      </UiEntity>

      {/* Barricade */}
      <UiEntity uiTransform={{ width: 460, flexDirection: 'column', padding: 14 }} uiBackground={{ color: C.panelSoft }}>
        <Bar
          fraction={bar}
          color={bar > 0 ? C.barricade : C.red}
          width="100%"
          height={28}
          label={bar > 0 ? 'BARRICADE' : 'BARRICADE BREACHED'}
          value={`${Math.round(bar * 100)}%`}
          fontSize={F.tiny}
        />
        <Label
          value={
            state.hero.underAttack
              ? 'THEY ARE ON YOU — KEEP FIRING'
              : bar <= 0
                ? 'Nothing between you and them. Pick your lane.'
                : 'Zombies stop at the wall. Kill them before it breaks.'
          }
          fontSize={F.tiny}
          color={state.hero.underAttack ? C.red : C.textFaint}
          textAlign="middle-center"
          uiTransform={{ width: '100%', height: 26, margin: { top: 6 } }}
        />
      </UiEntity>

      {/* Active effects */}
      <UiEntity uiTransform={{ width: 380, flexDirection: 'column', alignItems: 'flex-end' }}>
        {state.effects.map((e) => {
          const def = PICKUPS[e.kind]
          return (
            <UiEntity key={`fx-${e.kind}`} uiTransform={{ width: 300, margin: { top: 6 } }}>
              <Bar fraction={e.remaining / e.duration} color={rgba(def.color, 0.85)} width="100%" height={26} label={def.label} value={`${Math.ceil(e.remaining)}s`} fontSize={F.tiny} />
            </UiEntity>
          )
        })}
      </UiEntity>
    </UiEntity>
  )
}

export function Toasts() {
  if (state.toasts.length === 0) return null
  return (
    <UiEntity
      uiTransform={{
        positionType: 'absolute',
        position: { top: 150, left: 0 },
        width: '100%',
        flexDirection: 'column',
        alignItems: 'center'
      }}
    >
      {state.toasts.map((t, i) => (
        <UiEntity key={`toast-${i}-${t.text}`} uiTransform={{ height: 54, padding: { left: 26, right: 26 }, margin: { bottom: 8 }, justifyContent: 'center', alignItems: 'center' }} uiBackground={{ color: C.panel }}>
          <Label value={t.text} fontSize={F.h3} color={rgba(t.color)} textAlign="middle-center" uiTransform={{ height: '100%' }} />
        </UiEntity>
      ))}
    </UiEntity>
  )
}

export function Hud() {
  return (
    <UiEntity uiTransform={{ positionType: 'absolute', position: { top: 0, left: 0 }, width: '100%', height: '100%' }}>
      <LaneZones showPads={true} />
      <TopBar />
      <BottomBar />
      <Toasts />
    </UiEntity>
  )
}
