import ReactEcs, { Label, UiEntity } from '@dcl/sdk/react-ecs'
import { ALLIES, BARRICADE, DAY, WEAPONS, WEAPON_ORDER } from '../../config/balance'
import { adjustDayPlan, chooseWeapon, continueFromResults, hoursLeft, resolveDay } from '../../core/game'
import { DayPlan, state } from '../../core/state'
import { Btn, Overlay, Panel, Row, Spacer, Text, Title } from '../components'
import { C, F } from '../theme'

function Stepper(p: { value: number; onChange: (delta: number) => void; canAdd: boolean }) {
  return (
    <UiEntity uiTransform={{ width: '100%', height: 84, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', margin: { top: 10 } }}>
      <UiEntity uiTransform={{ width: 84, height: 84, justifyContent: 'center', alignItems: 'center' }} uiBackground={{ color: p.value > 0 ? C.btnSecondary : C.btnDisabled }} onMouseDown={() => p.onChange(-1)}>
        <Label value="-" fontSize={F.h1} color={C.text} textAlign="middle-center" uiTransform={{ width: '100%', height: '100%' }} />
      </UiEntity>
      <UiEntity uiTransform={{ width: 130, height: 84, justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
        <Label value={`${p.value}`} fontSize={F.h1} color={C.text} textAlign="middle-center" uiTransform={{ width: '100%', height: 56 }} />
        <Label value="HOURS" fontSize={F.tiny} color={C.textFaint} textAlign="middle-center" uiTransform={{ width: '100%', height: 20 }} />
      </UiEntity>
      <UiEntity uiTransform={{ width: 84, height: 84, justifyContent: 'center', alignItems: 'center' }} uiBackground={{ color: p.canAdd ? C.btn : C.btnDisabled }} onMouseDown={() => p.onChange(1)}>
        <Label value="+" fontSize={F.h1} color={C.text} textAlign="middle-center" uiTransform={{ width: '100%', height: '100%' }} />
      </UiEntity>
    </UiEntity>
  )
}

function preview(key: keyof DayPlan, hours: number): string {
  if (key === 'barricade') {
    const pct = Math.min(100, Math.round(hours * DAY.repairPerHour * 100))
    const now = Math.round((state.barricade.health / BARRICADE.maxHealth) * 100)
    const after = Math.round(now + (100 - now) * (pct / 100))
    return `Repairs ${pct}% of the damage  →  wall at ~${after}%`
  }
  if (key === 'allies') {
    const sure = Math.floor(hours / DAY.alliesPerHours)
    const room = ALLIES.max - state.allies
    if (room <= 0) return 'The outpost is full (4 survivors)'
    return hours > 0 ? `+${Math.min(room, sure)} survivor${sure === 1 ? '' : 's'} guaranteed, 50% chance of one more` : 'No one joins'
  }
  for (const tier of DAY.scavenge) {
    if (hours >= tier.minHours) {
      const names = tier.finds.map((w) => WEAPONS[w].name).join(' or ')
      return `${tier.label}: ${names}`
    }
  }
  return 'Stay inside. Nothing found.'
}

function PlanCard(p: { title: string; key_: keyof DayPlan; blurb: string; color: typeof C.text }) {
  const left = hoursLeft()
  const value = state.dayPlan[p.key_]
  return (
    <UiEntity uiTransform={{ width: 470, flexDirection: 'column', alignItems: 'center', padding: 22, margin: { left: 10, right: 10 } }} uiBackground={{ color: C.panelSoft }}>
      <Label value={p.title} fontSize={F.h3} color={p.color} textAlign="middle-center" uiTransform={{ width: '100%', height: 40 }} />
      <Label value={p.blurb} fontSize={F.small} color={C.textDim} textAlign="middle-center" textWrap="wrap" uiTransform={{ width: '100%', minHeight: 50 }} />
      <Stepper value={value} canAdd={left > 0} onChange={(d) => adjustDayPlan(p.key_, d)} />
      <Label value={preview(p.key_, value)} fontSize={F.tiny} color={C.text} textAlign="middle-center" textWrap="wrap" uiTransform={{ width: '100%', minHeight: 44, margin: { top: 10 } }} />
    </UiEntity>
  )
}

export function DayPlanScreen() {
  const left = hoursLeft()
  return (
    <Overlay>
      <UiEntity uiTransform={{ width: 1500, flexDirection: 'column', alignItems: 'center' }}>
        <Text value={`DAY ${state.night}  ·  ${DAY.hours} HOURS OF LIGHT`} size={F.small} color={C.accent} />
        <Title value="HOW DO YOU SPEND THE DAY?" size={F.h2} />
        <Row margin={{ top: 8, bottom: 8 }}>
          <PlanCard title="REPAIR THE WALL" key_="barricade" color={C.barricade} blurb="Sandbags, scrap and sweat. Every hour patches 20% of last night’s damage." />
          <PlanCard title="RALLY SURVIVORS" key_="allies" color={C.green} blurb="Search the rubble for people who can still hold a gun. They fire from behind the wall." />
          <PlanCard title="SCAVENGE" key_="scavenge" color={C.blue} blurb="Go further out for better hardware. 1–3h corner store, 4–6h police armory, 7h+ military cache." />
        </Row>
        <Row>
          <UiEntity uiTransform={{ width: 300, height: 76, justifyContent: 'center', alignItems: 'center', margin: { right: 16 } }} uiBackground={{ color: C.panelSoft }}>
            <Label value={left > 0 ? `${left} HOURS UNASSIGNED` : 'EVERY HOUR SPOKEN FOR'} fontSize={F.small} color={left > 0 ? C.gold : C.green} textAlign="middle-center" uiTransform={{ width: '100%', height: '100%' }} />
          </UiEntity>
          <Btn label={left > 0 ? `REST ${left}H & GET TO WORK` : 'GET TO WORK'} width={460} onClick={resolveDay} />
        </Row>
      </UiEntity>
    </Overlay>
  )
}

function WeaponCard(p: { key?: string; id: (typeof WEAPON_ORDER)[number]; owned: boolean; equipped: boolean; isNew: boolean }) {
  const w = WEAPONS[p.id]
  const bg = p.equipped ? C.accentDark : p.owned ? C.btnSecondary : C.btnDisabled
  return (
    <UiEntity
      uiTransform={{ width: 330, height: 190, flexDirection: 'column', alignItems: 'center', padding: 14, margin: { left: 8, right: 8 } }}
      uiBackground={{ color: bg }}
      onMouseDown={() => {
        if (p.owned) chooseWeapon(p.id)
      }}
    >
      <Label value={w.name.toUpperCase()} fontSize={F.body} color={p.owned ? C.text : C.textFaint} textAlign="middle-center" uiTransform={{ width: '100%', height: 32 }} />
      <Label
        value={p.owned ? `${w.damage} dmg  ·  ${w.fireRate}/s  ·  mag ${w.magSize}` : 'NOT FOUND YET'}
        fontSize={F.tiny}
        color={p.owned ? C.textDim : C.textFaint}
        textAlign="middle-center"
        uiTransform={{ width: '100%', height: 24 }}
      />
      <Label value={p.owned ? w.blurb : ''} fontSize={F.tiny} color={C.textDim} textAlign="middle-center" textWrap="wrap" uiTransform={{ width: '100%', minHeight: 40, margin: { top: 6 } }} />
      <Label
        value={p.equipped ? 'EQUIPPED' : p.isNew ? 'NEW — TAP TO EQUIP' : p.owned ? 'TAP TO EQUIP' : ''}
        fontSize={F.tiny}
        color={p.equipped ? C.gold : p.isNew ? C.green : C.textFaint}
        textAlign="middle-center"
        uiTransform={{ width: '100%', height: 26, margin: { top: 6 } }}
      />
    </UiEntity>
  )
}

export function DayResultsScreen() {
  const r = state.dayResults
  if (!r) return null
  const found = r.weaponFound ? WEAPONS[r.weaponFound].name : null
  const scavengeLine = !r.weaponFound
    ? 'Nobody went out. No new hardware.'
    : r.alreadyOwned
      ? `${r.scavengeLabel}: only ammo for the ${found} you already carry.`
      : `${r.scavengeLabel}: found a ${found}!`
  return (
    <Overlay>
      <UiEntity uiTransform={{ width: 1500, flexDirection: 'column', alignItems: 'center' }}>
        <Text value="DUSK" size={F.small} color={C.accent} />
        <Title value="THE DAY’S WORK" size={F.h2} />
        <Row margin={{ bottom: 6 }}>
          <Panel width={470} padding={18} margin={{ left: 10, right: 10 }} color={C.panelSoft}>
            <Text value="WALL" size={F.small} color={C.barricade} />
            <Text value={`Repaired ${r.repairedPercent}% of the damage`} size={F.body} color={C.text} />
            <Text value={`Barricade at ${Math.round((state.barricade.health / BARRICADE.maxHealth) * 100)}%`} size={F.small} color={C.textDim} />
          </Panel>
          <Panel width={470} padding={18} margin={{ left: 10, right: 10 }} color={C.panelSoft}>
            <Text value="SURVIVORS" size={F.small} color={C.green} />
            <Text value={r.alliesGained > 0 ? `+${r.alliesGained} joined the outpost` : 'No one new tonight'} size={F.body} color={C.text} />
            <Text value={`${r.alliesTotal} of ${ALLIES.max} firing from the wall`} size={F.small} color={C.textDim} />
          </Panel>
          <Panel width={470} padding={18} margin={{ left: 10, right: 10 }} color={C.panelSoft}>
            <Text value="SCAVENGE" size={F.small} color={C.blue} />
            <Text value={scavengeLine} size={F.body} color={C.text} />
            <Text value="You are patched up to full health." size={F.small} color={C.textDim} />
          </Panel>
        </Row>
        <Text value="CHOOSE YOUR WEAPON FOR TONIGHT" size={F.small} color={C.textFaint} margin={{ top: 6 }} />
        <Row>
          {WEAPON_ORDER.map((id) => (
            <WeaponCard key={`w-${id}`} id={id} owned={state.inventory.includes(id)} equipped={state.hero.weapon === id} isNew={r.weaponFound === id && !r.alreadyOwned} />
          ))}
        </Row>
        <Spacer h={6} />
        <Btn label={`NIGHTFALL — NIGHT ${state.night + 1}`} width={460} onClick={continueFromResults} />
      </UiEntity>
    </Overlay>
  )
}
