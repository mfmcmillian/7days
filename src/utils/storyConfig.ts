/**
 * Story Mode Configuration
 * Wave definitions, boss stats, and story text
 */

export type StoryWave = {
  waveNumber: number
  chapterTitle: string
  storyText: string
  zombieCount: number
  miniBosses: number
  bigBoss: boolean
  difficulty: 'easy' | 'medium' | 'hard'
}

export const STORY_WAVES: StoryWave[] = [
  {
    waveNumber: 1,
    chapterTitle: 'Wave 1 - First Contact',
    storyText: 'They are coming. Survive.',
    zombieCount: 12, // Compressed (was 15)
    miniBosses: 0,
    bigBoss: true,
    difficulty: 'easy'
  },
  {
    waveNumber: 2,
    chapterTitle: 'Wave 2 - The Horde',
    storyText: 'More are coming. Hold the line.',
    zombieCount: 16, // Compressed (was 20)
    miniBosses: 0,
    bigBoss: true,
    difficulty: 'easy'
  },
  {
    waveNumber: 3,
    chapterTitle: 'Wave 3 - Growing Threat',
    storyText: 'They are getting stronger.',
    zombieCount: 20, // Compressed (was 25)
    miniBosses: 1,
    bigBoss: true,
    difficulty: 'medium'
  },
  {
    waveNumber: 4,
    chapterTitle: 'Wave 4 - Overwhelming',
    storyText: 'The horde is relentless.',
    zombieCount: 24, // Compressed (was 30)
    miniBosses: 1,
    bigBoss: true,
    difficulty: 'medium'
  },
  {
    waveNumber: 5,
    chapterTitle: 'Wave 5 - The Alpha',
    storyText: 'Something bigger approaches.',
    zombieCount: 28, // Compressed (was 35)
    miniBosses: 1,
    bigBoss: true,
    difficulty: 'medium' // Will feel medium-hard with new balance
  },
  {
    waveNumber: 6,
    chapterTitle: 'Wave 6 - Final Push',
    storyText: 'Almost there. Do not give up.',
    zombieCount: 32, // Compressed (was 40)
    miniBosses: 2,
    bigBoss: true,
    difficulty: 'hard'
  },
  {
    waveNumber: 7,
    chapterTitle: 'Wave 7 - Last Stand',
    storyText: 'This is it. Survive and win.',
    zombieCount: 36, // Compressed (was 45)
    miniBosses: 2,
    bigBoss: true,
    difficulty: 'hard'
  }
]

// Boss health scaling per wave (VERY LOW for 6.5 min total game)
export const BOSS_HEALTH_BASE = 80 // Die quickly - ~10-15 seconds
export const BOSS_HEALTH_PER_WAVE = 40 // Minimal scaling

export const MINI_BOSS_HEALTH_BASE = 60 // Slight HP buff (was 50)
export const MINI_BOSS_HEALTH_PER_WAVE = 25 // Increased scaling (was 20)

// Boss size scaling
export const MINI_BOSS_SCALE = 1.5
export const BIG_BOSS_SCALE = 2.0

// Story mode game state
export type StoryPhase = 'story' | 'wave' | 'bossSpawned' | 'victory' | 'endless'

export function getBossHealth(wave: number, isBigBoss: boolean): number {
  if (isBigBoss) {
    return BOSS_HEALTH_BASE + (wave - 1) * BOSS_HEALTH_PER_WAVE
  } else {
    return MINI_BOSS_HEALTH_BASE + (wave - 1) * MINI_BOSS_HEALTH_PER_WAVE
  }
}
