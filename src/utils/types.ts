/**
 * Type definitions for Neural Collapse
 */

import { Entity } from '@dcl/sdk/ecs'

export type WeaponType = 'pistol' | 'shotgun' | 'rifle'

export type PowerUpType = 'instantKill' | 'fireRate' | 'maxReload' | 'doublePoints'

export type GamePhase = 'menu' | 'playing' | 'gameOver'

export interface WeaponAmmoState {
  pistol: number
  shotgun: number
  rifle: number
  maxPistol: number
  maxShotgun: number
  maxRifle: number
}

export interface SoundPool {
  entities: Entity[]
  currentIndex: number
  size: number
}
