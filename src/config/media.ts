/**
 * Video streams and audio files carried over from the original game.
 */
export const VIDEOS = {
  /** Title loop shown behind the start screen. */
  intro: 'https://dclstreams.com/media/videos/play/f50cba36-04c0-49fa-bbc1-07b2aed92944.m3u8',
  /** Mission briefing played once after the player taps start. */
  briefing: 'https://dclstreams.com/media/videos/play/e9caacfe-b3b0-43bd-a097-6186bc7d2cf5.m3u8',
  /** Extraction / ending. */
  outro: 'https://dclstreams.com/media/videos/play/f66d2236-35dd-4634-acd3-c720cff6a2fc.m3u8'
}

/** Max seconds we wait for a non-looping cutscene before moving on. */
export const CUTSCENE_TIMEOUT = { briefing: 45, outro: 45 }

const S = 'sounds/'
export const SFX = {
  shot: S + 'shot.mp3',
  'shotgun-shot': S + 'zombie-sounds/shotgun-shot.mp3',
  shotFail: S + 'shotFail.mp3',
  'pistol-reload': S + 'zombie-sounds/pistol-reload.mp3',
  'rifle-reload': S + 'zombie-sounds/rifle-reload.mp3',
  'shotgun-reload': S + 'zombie-sounds/shotgun-reload.mp3',
  'weapon-switch': S + 'zombie-sounds/weapon-switch.mp3',
  attack: S + 'zombie-sounds/attack.mp3',
  die: S + 'zombie-sounds/die.mp3',
  growl: S + 'zombie-sounds/zombie-growl.mp3',
  growl2: S + 'zombie-sounds/zombie-growl2.mp3',
  longGrowl: S + 'zombie-sounds/long_zombie-growl.mp3',
  gameOver: S + 'zombie-sounds/gameOver.mp3',
  levelup: S + 'zombie-sounds/levelup.mp3',
  pause: S + 'zombie-sounds/pause-button.mp3',
  startRound: S + 'startRound.mp3',
  thunk: S + 'thunk.mp3',
  tink: S + 'tink.mp3',
  sale: S + 'sale.mp3',
  noPoints: S + 'no-points.mp3',
  'powerups/double-points': S + 'powerups/double-points.mp3',
  'powerups/fireRate': S + 'powerups/fireRate.mp3',
  'powerups/instantKill': S + 'powerups/instantKill.mp3',
  'powerups/max-ammo': S + 'powerups/max-ammo.mp3',
  alaraStart: S + 'alara-start.mp3'
} as const

export type SfxId = keyof typeof SFX

export const MUSIC = {
  main: S + 'sound-track.mp3',
  sirens: [S + 'background/police-sirens1.mp3', S + 'background/police-sirens2.mp3']
}

/** Six narration takes for the night start ("Revenant" voice). One is picked per night. */
const NARRATION_DIR = S + 'start-sounds/'
export const NARRATION = [
  '00_14_18',
  '00_14_54',
  '00_15_32',
  '00_15_48',
  '00_16_09',
  '00_16_25'
].map(
  (t) =>
    `${NARRATION_DIR}ElevenLabs_2025-10-29T${t}_Revenant - RTS Stealth Ghost Soldier Unit_pvc_sp100_s19_sb43_se15_b_m2.mp3`
)
