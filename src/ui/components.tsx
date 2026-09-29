import ReactEcs, { Label, PositionUnit, UiEntity } from '@dcl/sdk/react-ecs'
import { Color4 } from '@dcl/sdk/math'
import { C, F } from './theme'

export interface BtnProps {
  label: string
  onClick: () => void
  width?: number
  height?: number
  color?: Color4
  textColor?: Color4
  fontSize?: number
  disabled?: boolean
  margin?: { top?: number; bottom?: number; left?: number; right?: number }
  sub?: string
}

/** Big, thumb-sized button. Minimum 64 virtual px tall so it is always a comfortable tap target. */
export function Btn(p: BtnProps) {
  const h = Math.max(64, p.height ?? 76)
  return (
    <UiEntity
      uiTransform={{
        width: p.width ?? 360,
        height: h,
        margin: p.margin ?? { top: 8, bottom: 8 },
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column'
      }}
      uiBackground={{ color: p.disabled ? C.btnDisabled : p.color ?? C.btn }}
      onMouseDown={() => {
        if (!p.disabled) p.onClick()
      }}
    >
      <Label
        value={p.label}
        fontSize={p.fontSize ?? F.h3}
        color={p.disabled ? C.textFaint : p.textColor ?? C.btnText}
        textAlign="middle-center"
        uiTransform={{ width: '100%', height: p.sub ? h * 0.58 : '100%' }}
      />
      {p.sub ? (
        <Label
          value={p.sub}
          fontSize={F.tiny}
          color={p.disabled ? C.textFaint : C.btnText}
          textAlign="middle-center"
          uiTransform={{ width: '100%', height: h * 0.34 }}
        />
      ) : null}
    </UiEntity>
  )
}

export interface BarProps {
  fraction: number
  color: Color4
  width: PositionUnit
  height?: number
  label?: string
  value?: string
  bg?: Color4
  fontSize?: number
}

export function Bar(p: BarProps) {
  const h = p.height ?? 26
  const f = Math.max(0, Math.min(1, p.fraction))
  return (
    <UiEntity uiTransform={{ width: p.width, height: h, flexDirection: 'row' }} uiBackground={{ color: p.bg ?? C.barBg }}>
      <UiEntity uiTransform={{ width: `${f * 100}%`, height: '100%' }} uiBackground={{ color: p.color }} />
      {p.label !== undefined || p.value !== undefined ? (
        <UiEntity
          uiTransform={{
            positionType: 'absolute',
            position: { top: 0, left: 0 },
            width: '100%',
            height: '100%',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: { left: 10, right: 10 }
          }}
        >
          <Label value={p.label ?? ''} fontSize={p.fontSize ?? F.small} color={C.text} textAlign="middle-left" uiTransform={{ height: '100%' }} />
          <Label value={p.value ?? ''} fontSize={p.fontSize ?? F.small} color={C.text} textAlign="middle-right" uiTransform={{ height: '100%' }} />
        </UiEntity>
      ) : null}
    </UiEntity>
  )
}

export interface PanelProps {
  width: PositionUnit
  height?: PositionUnit
  children?: ReactEcs.JSX.Element | ReactEcs.JSX.Element[] | null
  padding?: number
  color?: Color4
  align?: 'center' | 'flex-start'
  margin?: { top?: number; bottom?: number; left?: number; right?: number }
}

export function Panel(p: PanelProps) {
  return (
    <UiEntity
      uiTransform={{
        width: p.width,
        height: p.height,
        padding: p.padding ?? 28,
        flexDirection: 'column',
        alignItems: p.align ?? 'center',
        margin: p.margin
      }}
      uiBackground={{ color: p.color ?? C.panel }}
    >
      {p.children}
    </UiEntity>
  )
}

/** Full-screen dim layer that centers its children. */
export function Overlay(p: { children?: ReactEcs.JSX.Element | ReactEcs.JSX.Element[] | null; color?: Color4; justify?: 'center' | 'flex-end' | 'flex-start' }) {
  return (
    <UiEntity
      uiTransform={{
        positionType: 'absolute',
        position: { top: 0, left: 0 },
        width: '100%',
        height: '100%',
        flexDirection: 'column',
        justifyContent: p.justify ?? 'center',
        alignItems: 'center'
      }}
      uiBackground={{ color: p.color ?? C.bg }}
    >
      {p.children}
    </UiEntity>
  )
}

export function Title(p: { value: string; size?: number; color?: Color4; margin?: { top?: number; bottom?: number } }) {
  return (
    <Label
      value={p.value}
      fontSize={p.size ?? F.h1}
      color={p.color ?? C.text}
      textAlign="middle-center"
      uiTransform={{ width: '100%', height: (p.size ?? F.h1) * 1.3, margin: p.margin ?? { bottom: 6 } }}
    />
  )
}

export function Text(p: { value: string; size?: number; color?: Color4; align?: 'middle-center' | 'middle-left' | 'middle-right'; width?: PositionUnit; height?: number; margin?: { top?: number; bottom?: number; left?: number; right?: number } }) {
  const size = p.size ?? F.body
  return (
    <Label
      value={p.value}
      fontSize={size}
      color={p.color ?? C.textDim}
      textAlign={p.align ?? 'middle-center'}
      uiTransform={{ width: p.width ?? '100%', height: p.height ?? size * 1.5, margin: p.margin }}
    />
  )
}

export function Stat(p: { label: string; value: string; color?: Color4; width?: number }) {
  return (
    <UiEntity uiTransform={{ width: p.width ?? 220, flexDirection: 'column', alignItems: 'center', margin: { left: 8, right: 8 } }}>
      <Label value={p.value} fontSize={F.h2} color={p.color ?? C.text} textAlign="middle-center" uiTransform={{ width: '100%', height: F.h2 * 1.3 }} />
      <Label value={p.label} fontSize={F.tiny} color={C.textFaint} textAlign="middle-center" uiTransform={{ width: '100%', height: F.tiny * 1.5 }} />
    </UiEntity>
  )
}

export function Spacer(p: { h?: number; w?: number }) {
  return <UiEntity uiTransform={{ height: p.h ?? 12, width: p.w ?? 1 }} />
}

export function Row(p: { children?: ReactEcs.JSX.Element | ReactEcs.JSX.Element[] | null; width?: PositionUnit; justify?: 'center' | 'space-between' | 'flex-start' | 'space-around'; margin?: { top?: number; bottom?: number }; height?: number }) {
  return (
    <UiEntity
      uiTransform={{
        width: p.width ?? '100%',
        height: p.height,
        flexDirection: 'row',
        justifyContent: p.justify ?? 'center',
        alignItems: 'center',
        margin: p.margin
      }}
    >
      {p.children}
    </UiEntity>
  )
}
