/**
 * World geometry for the lane shooter.
 *
 * The street runs along +X. The hero stands near the west end and shoots east;
 * the horde spawns at the east end and walks west toward the barricade.
 * Lanes are spread along Z. The camera sits behind the hero looking +X, so on
 * screen the lanes read as three vertical columns (screen-right is -Z).
 */
export const SCENE = {
  width: 80, // 5 parcels along X
  depth: 48, // 3 parcels along Z
  height: 80
}

export const LANE_COUNT = 3
/** Lane Z positions, ordered screen-left -> screen-right. */
export const LANE_Z: readonly number[] = [35.5, 31, 26.5]
export const CENTER_LANE = 1
export const STREET_CENTER_Z = LANE_Z[CENTER_LANE]

export const HERO_X = 16
export const ALLY_X = 20.5
export const BARRICADE_X = 24
/** Zombies stop here to attack the barricade. */
export const BARRICADE_ATTACK_X = BARRICADE_X + 1.6
/** Zombies stop here to attack the hero once the barricade is down. */
export const HERO_ATTACK_X = HERO_X + 1.8
export const SPAWN_X = 74
export const SPAWN_X_JITTER = 3

export const PROJECTILE_Y = 1.25
export const PICKUP_Y = 0.9

export const STREET_WIDTH = 16 // along Z
export const STREET_Z_MIN = STREET_CENTER_Z - STREET_WIDTH / 2
export const STREET_Z_MAX = STREET_CENTER_Z + STREET_WIDTH / 2

/** Where the (hidden, locked) real player avatar is parked. */
export const PLAYER_PARK = { x: 4, y: 0.2, z: 31 }

/** Cinema screen used for the intro / briefing / outro videos. */
export const CINEMA = {
  x: 40,
  y: 52,
  z: 44,
  width: 16,
  height: 9
}
