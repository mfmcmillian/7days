/**
 * Boss Zombie Components
 * Special components for mini-bosses and big bosses
 */

import { engine, Schemas } from '@dcl/sdk/ecs'

export const BossZombie = engine.defineComponent('boss::zombie', {
  isBigBoss: Schemas.Boolean, // true = big boss, false = mini-boss
  maxHealth: Schemas.Number,
  currentHealth: Schemas.Number
})

export type BossType = 'mini' | 'big'

