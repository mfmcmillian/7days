/**
 * Story Mode Configuration - 18 Nights Survival
 * Night definitions, boss stats, and story text
 */

export type StoryNight = {
  nightNumber: number
  chapterTitle: string
  storyText: string
  zombieCount: number
  miniBosses: number
  bigBoss: boolean
  difficulty: 'easy' | 'medium' | 'hard'
}

// 18 Nights until rescue
export const STORY_NIGHTS: StoryNight[] = [
  // NIGHTS 1-6: Easy
  {
    nightNumber: 1,
    chapterTitle: 'Night 1 - First Contact',
    storyText: '[PLACEHOLDER] HQ: Soldier, this is HQ. You have 18 days until extraction. Hold your position.',
    zombieCount: 10, // Reduced from 15
    miniBosses: 0, // No bosses
    bigBoss: false, // No big boss
    difficulty: 'easy'
  },
  {
    nightNumber: 2,
    chapterTitle: 'Night 2 - The Pattern Emerges',
    storyText: '[PLACEHOLDER] HQ: They come at night. Fortify and survive.',
    zombieCount: 20,
    miniBosses: 1,
    bigBoss: true,
    difficulty: 'easy'
  },
  {
    nightNumber: 3,
    chapterTitle: 'Night 3 - Finding Hope',
    storyText: '[PLACEHOLDER] You found a survivor. They can fight.',
    zombieCount: 25,
    miniBosses: 0,
    bigBoss: false,
    difficulty: 'easy'
  },
  {
    nightNumber: 4,
    chapterTitle: 'Night 4 - Growing Stronger',
    storyText: '[PLACEHOLDER] More survivors join. The barricade holds.',
    zombieCount: 30,
    miniBosses: 1,
    bigBoss: true,
    difficulty: 'easy'
  },
  {
    nightNumber: 5,
    chapterTitle: 'Night 5 - Supply Check',
    storyText: '[PLACEHOLDER] Ammo running low. We need to scavenge.',
    zombieCount: 35,
    miniBosses: 0,
    bigBoss: false,
    difficulty: 'easy'
  },
  {
    nightNumber: 6,
    chapterTitle: 'Night 6 - The Horde Grows',
    storyText: '[PLACEHOLDER] HQ: The infected are evolving. Stay alert.',
    zombieCount: 40,
    miniBosses: 2,
    bigBoss: true,
    difficulty: 'easy'
  },

  // NIGHTS 7-12: Medium
  {
    nightNumber: 7,
    chapterTitle: 'Night 7 - Halfway There',
    storyText: '[PLACEHOLDER] 11 more nights. We can do this.',
    zombieCount: 45,
    miniBosses: 0,
    bigBoss: false,
    difficulty: 'medium'
  },
  {
    nightNumber: 8,
    chapterTitle: 'Night 8 - Breach Attempt',
    storyText: '[PLACEHOLDER] The barricade is under assault!',
    zombieCount: 50,
    miniBosses: 2,
    bigBoss: true,
    difficulty: 'medium'
  },
  {
    nightNumber: 9,
    chapterTitle: 'Night 9 - Holding the Line',
    storyText: '[PLACEHOLDER] Survivor: We trust you to get us through this.',
    zombieCount: 55,
    miniBosses: 0,
    bigBoss: false,
    difficulty: 'medium'
  },
  {
    nightNumber: 10,
    chapterTitle: 'Night 10 - The Alpha',
    storyText: '[PLACEHOLDER] Something bigger is out there. Be ready.',
    zombieCount: 60,
    miniBosses: 3,
    bigBoss: true,
    difficulty: 'medium'
  },
  {
    nightNumber: 11,
    chapterTitle: 'Night 11 - Dwindling Hope',
    storyText: '[PLACEHOLDER] Survivor: Will they really come for us?',
    zombieCount: 65,
    miniBosses: 0,
    bigBoss: false,
    difficulty: 'medium'
  },
  {
    nightNumber: 12,
    chapterTitle: 'Night 12 - Two-Thirds Survival',
    storyText: '[PLACEHOLDER] HQ: 6 more nights. Extraction confirmed.',
    zombieCount: 70,
    miniBosses: 3,
    bigBoss: true,
    difficulty: 'medium'
  },

  // NIGHTS 13-18: Hard
  {
    nightNumber: 13,
    chapterTitle: 'Night 13 - The Long Night',
    storyText: '[PLACEHOLDER] This is the hardest stretch. Stay strong.',
    zombieCount: 75,
    miniBosses: 0,
    bigBoss: false,
    difficulty: 'hard'
  },
  {
    nightNumber: 14,
    chapterTitle: 'Night 14 - Overwhelming Odds',
    storyText: '[PLACEHOLDER] They just keep coming...',
    zombieCount: 80,
    miniBosses: 4,
    bigBoss: true,
    difficulty: 'hard'
  },
  {
    nightNumber: 15,
    chapterTitle: 'Night 15 - Three Days Left',
    storyText: '[PLACEHOLDER] Survivor: I can see the extraction point from here.',
    zombieCount: 85,
    miniBosses: 0,
    bigBoss: false,
    difficulty: 'hard'
  },
  {
    nightNumber: 16,
    chapterTitle: 'Night 16 - The Final Push',
    storyText: '[PLACEHOLDER] HQ: 48 hours. Do not give up now.',
    zombieCount: 90,
    miniBosses: 5,
    bigBoss: true,
    difficulty: 'hard'
  },
  {
    nightNumber: 17,
    chapterTitle: 'Night 17 - Tomorrow We Leave',
    storyText: '[PLACEHOLDER] One more night. We can taste freedom.',
    zombieCount: 95,
    miniBosses: 0,
    bigBoss: false,
    difficulty: 'hard'
  },
  {
    nightNumber: 18,
    chapterTitle: 'Night 18 - The Last Stand',
    storyText: '[PLACEHOLDER] This is it. Hold until dawn. The convoy is coming.',
    zombieCount: 100,
    miniBosses: 6,
    bigBoss: true,
    difficulty: 'hard'
  }
]

// Boss health scaling per night
export const BOSS_HEALTH_BASE = 300
export const BOSS_HEALTH_PER_NIGHT = 100 // Slower scaling (18 nights vs 5 waves)

export const MINI_BOSS_HEALTH_BASE = 150
export const MINI_BOSS_HEALTH_PER_NIGHT = 50

// Boss size scaling
export const MINI_BOSS_SCALE = 1.5
export const BIG_BOSS_SCALE = 2.0

// Story mode game state
export type StoryPhase = 'story' | 'night' | 'bossSpawned' | 'victory' | 'daytime' | 'results'

export function getBossHealth(night: number, isBigBoss: boolean): number {
  if (isBigBoss) {
    return BOSS_HEALTH_BASE + (night - 1) * BOSS_HEALTH_PER_NIGHT
  } else {
    return MINI_BOSS_HEALTH_BASE + (night - 1) * MINI_BOSS_HEALTH_PER_NIGHT
  }
}

// Get night configuration
export function getNightConfig(nightNumber: number): StoryNight | null {
  return STORY_NIGHTS.find((n) => n.nightNumber === nightNumber) || null
}
