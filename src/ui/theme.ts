import { Color4 } from '@dcl/sdk/math'

/** Design resolution. 20:9 so phones in landscape are not letterboxed; desktop simply scales up. */
export const VW = 1600
export const VH = 720

export const C = {
  bg: Color4.create(0.03, 0.03, 0.04, 0.86),
  panel: Color4.create(0.07, 0.07, 0.09, 0.92),
  panelSoft: Color4.create(0.1, 0.1, 0.13, 0.85),
  line: Color4.create(1, 1, 1, 0.08),
  text: Color4.create(0.95, 0.94, 0.9, 1),
  textDim: Color4.create(0.7, 0.68, 0.64, 1),
  textFaint: Color4.create(0.5, 0.48, 0.45, 1),
  accent: Color4.create(0.95, 0.28, 0.16, 1),
  accentDark: Color4.create(0.6, 0.15, 0.08, 1),
  gold: Color4.create(1, 0.82, 0.3, 1),
  green: Color4.create(0.35, 0.9, 0.45, 1),
  blue: Color4.create(0.4, 0.7, 1, 1),
  purple: Color4.create(0.8, 0.4, 1, 1),
  red: Color4.create(1, 0.3, 0.25, 1),
  hp: Color4.create(0.3, 0.85, 0.4, 1),
  hpLow: Color4.create(1, 0.35, 0.25, 1),
  barricade: Color4.create(0.85, 0.65, 0.3, 1),
  boss: Color4.create(0.9, 0.15, 0.2, 1),
  barBg: Color4.create(0, 0, 0, 0.55),
  ghost: Color4.create(1, 1, 1, 0.012),
  laneActive: Color4.create(0.95, 0.28, 0.16, 0.22),
  laneIdle: Color4.create(1, 1, 1, 0.035),
  btn: Color4.create(0.95, 0.28, 0.16, 1),
  btnSecondary: Color4.create(0.18, 0.18, 0.22, 1),
  btnDisabled: Color4.create(0.2, 0.2, 0.22, 0.6),
  btnText: Color4.create(1, 0.98, 0.95, 1),
  transparent: Color4.create(0, 0, 0, 0)
}

export const F = {
  hero: 92,
  h1: 56,
  h2: 38,
  h3: 28,
  body: 22,
  small: 18,
  tiny: 15
}

export function rgba(c: [number, number, number], a = 1): Color4 {
  return Color4.create(c[0], c[1], c[2], a)
}

export function fmt(n: number): string {
  return Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}
