/**
 * Art catalog: every visual role in the game resolves through this file.
 *
 * Swapping in Synty (or any other) assets is a data change only:
 *   1. Drop the GLB under models/<pack>/...
 *   2. Point the role's `src` at it and fix `scale` / `yaw` / `yOffset`.
 *   3. If it's animated, map the clip names.
 *
 * A role with `src: null` renders a procedural placeholder (primitives), so the
 * game stays playable while the art is still being exported.
 */

export interface ClipMap {
  idle?: string
  walk?: string
  run?: string
  attack?: string
  die?: string
}

export interface ModelEntry {
  /** Path relative to the scene root, or null for a procedural placeholder. */
  src: string | null
  scale: number
  /** Extra Y rotation in degrees applied so the model faces -X (toward the hero) or +X for hero-side props. */
  yaw: number
  yOffset: number
  clips?: ClipMap
  /** Suggested Synty pack / prefab so the art pass knows what to reach for. */
  synty: string
}

export const ART = {
  // --- Characters -----------------------------------------------------------
  zombie: {
    src: 'models/placeholders/zombie.glb',
    scale: 0.8,
    yaw: 0,
    yOffset: 0,
    clips: { idle: 'idle', walk: 'walk', run: 'run', attack: 'attack', die: 'die' },
    synty: 'POLYGON Zombies / Apocalypse - SM_Chr_Zombie_* (retarget Walk/Run/Attack/Death)'
  } as ModelEntry,

  /**
   * The hero defaults to an AvatarShape that mirrors the player's own Decentraland look.
   * Set `src` to render a rigged Synty soldier instead.
   */
  hero: {
    src: null,
    scale: 1,
    yaw: 0,
    yOffset: 0,
    clips: { idle: 'Idle', walk: 'Walk', attack: 'Shoot' },
    synty: 'POLYGON Military - SM_Chr_Soldier_*'
  } as ModelEntry,

  survivor: {
    src: null,
    scale: 1,
    yaw: 0,
    yOffset: 0,
    synty: 'POLYGON Apocalypse - SM_Chr_Survivor_*'
  } as ModelEntry,

  // --- Weapons: children of the hero root (which faces +X), so local +Z is the firing direction.
  //     The placeholder GLBs are 2m-long showroom models, hence the small scales. ------------
  weapon_pistol: { src: 'models/placeholders/pistol.glb', scale: 0.16, yaw: 0, yOffset: 0, synty: 'POLYGON Military - SM_Wep_Pistol_01' } as ModelEntry,
  weapon_shotgun: { src: 'models/placeholders/shotgun.glb', scale: 0.42, yaw: 0, yOffset: 0, synty: 'POLYGON Military - SM_Wep_Shotgun_01' } as ModelEntry,
  weapon_rifle: { src: 'models/placeholders/rifle.glb', scale: 0.5, yaw: 0, yOffset: 0, synty: 'POLYGON Military - SM_Wep_Rifle_Sniper_01' } as ModelEntry,
  weapon_assault: { src: 'models/placeholders/rifle.glb', scale: 0.46, yaw: 0, yOffset: 0, synty: 'POLYGON Military - SM_Wep_Rifle_Assault_01' } as ModelEntry,

  // --- Defenses & pickups ---------------------------------------------------
  barricade: { src: null, scale: 1, yaw: 0, yOffset: 0, synty: 'POLYGON Apocalypse - SM_Prop_Barricade_Sandbags_* (x3 lanes)' } as ModelEntry,
  pickup_crate: { src: null, scale: 1, yaw: 0, yOffset: 0, synty: 'POLYGON Military - SM_Prop_Crate_Ammo_01' } as ModelEntry,

  // --- Environment -----------------------------------------------------------
  street: { src: null, scale: 1, yaw: 0, yOffset: 0, synty: 'POLYGON City - SM_Env_Road_Straight_* tiled along X' } as ModelEntry,
  building_a: { src: null, scale: 1, yaw: 0, yOffset: 0, synty: 'POLYGON Apocalypse - SM_Bld_Apartment_*' } as ModelEntry,
  building_b: { src: null, scale: 1, yaw: 0, yOffset: 0, synty: 'POLYGON Apocalypse - SM_Bld_Shop_*' } as ModelEntry,
  streetlight: { src: null, scale: 1, yaw: 0, yOffset: 0, synty: 'POLYGON City - SM_Prop_Streetlight_01' } as ModelEntry,
  wreck: { src: null, scale: 1, yaw: 0, yOffset: 0, synty: 'POLYGON Apocalypse - SM_Veh_Car_Wreck_*' } as ModelEntry
}

export type ArtRole = keyof typeof ART

export function art(role: ArtRole): ModelEntry {
  return ART[role]
}
