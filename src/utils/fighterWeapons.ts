/**
 * Fighter Weapon Types and Stats
 * Defines different weapons for the side-scrolling mode
 */

export type FighterWeaponType = 'pistol' | 'rifle' | 'assault'

export interface WeaponStats {
  name: string
  fireRate: number // Seconds between shots
  damage: number
  range: number // Max distance
  projectileSpeed: number
  projectileScale: { x: number; y: number; z: number }
  color: { r: number; g: number; b: number; a: number }
}

export const FIGHTER_WEAPONS: Record<FighterWeaponType, WeaponStats> = {
  pistol: {
    name: 'Pistol',
    fireRate: 0.8, // Normal pistol speed
    damage: 15, // Normal damage
    range: 20,
    projectileSpeed: 25,
    projectileScale: { x: 0.1, y: 0.1, z: 0.3 },
    color: { r: 0.2, g: 0.8, b: 1, a: 0.8 } // Cyan
  },
  rifle: {
    name: 'Rifle',
    fireRate: 1.0, // Slow
    damage: 50, // High damage
    range: 35, // Long range
    projectileSpeed: 40, // Fast bullets
    projectileScale: { x: 0.15, y: 0.15, z: 0.6 }, // Bigger
    color: { r: 1, g: 0.3, b: 0.3, a: 0.9 } // Red
  },
  assault: {
    name: 'Assault Rifle',
    fireRate: 0.2, // Very fast
    damage: 20, // Medium damage
    range: 22, // Medium range
    projectileSpeed: 30,
    projectileScale: { x: 0.12, y: 0.12, z: 0.4 },
    color: { r: 1, g: 0.8, b: 0.2, a: 0.8 } // Yellow/gold
  }
}
