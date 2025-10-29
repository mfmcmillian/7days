# 7 Days in Hell

A fast-paced zombie survival game built for Decentraland. Survive 7 intense waves of increasingly difficult zombie hordes while managing your defenses and resources.

## 🎮 Game Overview

**7 Days in Hell** is a side-scrolling zombie survival shooter where you must survive 7 waves over approximately 6-7 minutes of intense action. Defend your position, repair your barricade, and eliminate all threats before your next evacuation window.

### Core Features

- **7 Wave Campaign**: Progressive difficulty from Wave 1 to Wave 7
- **Barricade Defense System**: A single defensive wall that zombies must destroy before reaching you
- **Daytime Management**: Between waves, allocate hours to repair barricades, find allies, or scavenge weapons
- **Dynamic Zombie AI**: Zombies intelligently target and attack barricades before pursuing the player
- **Dramatic Visual Effects**: Explosive green blood effects on every hit
- **Story-Driven**: Immersive intro/outro cutscenes with military-style dialogue
- **Auto-Shooter Combat**: Side-scrolling gameplay with automatic weapon firing

## 🎯 Gameplay Loop

1. **Intro Cutscene**: Watch the opening sequence (press E to start)
2. **Wave Combat**: Survive the zombie onslaught
3. **Wave Complete**: View your stats and barricade health
4. **Daytime Allocation**: Choose how to spend your time:
   - Repair barricade (0-5 hours = 0-100% repair)
   - Find allies (more hours = more allies)
   - Scavenge weapons (chance to find shotgun/rifle)
5. **Next Wave Dialogue**: Brief story update before the next wave
6. **Repeat**: Continue through all 7 waves
7. **Victory**: Complete all waves to see the ending cutscene
8. **Loop**: Game returns to intro for replay

## 🛡️ Barricade System

- **Single Wall**: One large brown barricade (15m wide × 3m tall)
- **600 HP**: Strong enough to withstand 60-90 seconds of sustained assault
- **Visual Damage**: Wall shrinks as it takes damage
- **Position**: 5 units in front of player (X=-15)
- **Zombie Behavior**: All zombies MUST destroy the barricade before attacking you
- **Repair**: Only during daytime allocation (no auto-repair)

## 🧟 Zombie Stats

### Wave Progression (7 Waves Total)

| Wave | Zombies | Mini-Bosses | Big Boss | Difficulty  |
| ---- | ------- | ----------- | -------- | ----------- |
| 1    | 12      | 0           | 1        | Easy        |
| 2    | 16      | 0           | 1        | Easy        |
| 3    | 20      | 1           | 1        | Medium      |
| 4    | 24      | 1           | 1        | Medium      |
| 5    | 28      | 1           | 1        | Medium-Hard |
| 6    | 32      | 2           | 1        | Hard        |
| 7    | 36      | 2           | 1        | Hard        |

### Zombie Attributes

- **Base Health**: 15 HP (+10% per wave)
- **Base Speed**: 4.0 m/s (+0.1 per wave)
- **Base Damage**: 5 damage/hit (+0.5 per wave)
- **Spawn Rate**: 800ms between batches
- **Batch Size**: 10 zombies per batch

## 🔫 Weapons

### Starting Weapon

- **Pistol**: 20 damage, 0.5s fire rate, 12 round magazine

### Scavengeable Weapons

- **Shotgun**: 60 damage, 0.8s fire rate, 6 round magazine
- **Rifle**: 25 damage, 0.12s fire rate, 25 round magazine

### Upgrades Available

- **Double Tap**: Increased fire rate (1200 points)
- **Royal Armor**: Increased max health (750 points)
- **Quick Reload**: Faster reload speed (500 points)
- **Executioner's Chest**: Weapon damage upgrade (100 points)

## 🎬 Cutscenes

### Intro Cutscene

- Full-screen video plays at game start
- Press E to begin the game
- Displays "7 DAYS IN HELL" title

### Outro Cutscene (After Victory)

1. 8-second ending video
2. Dialogue screen with HQ transmission:
   - "Delta-1, come in, Delta-1..."
   - "Your next evacuation window is 7 days away."
   - "Stay alive. Command out."
3. Returns to intro cutscene for replay

## 🎵 Audio Features

- **Random Start Narration**: 6 different voice lines randomly selected at Wave 1
- **Dynamic Sound Effects**: Zombie deaths, weapon fire, power-ups
- **Spatial Audio**: 3D positioned sounds for immersion
- **Background Music**: Atmospheric tension during gameplay

## 💡 Strategy Tips

1. **Prioritize Barricade Repair**: A strong barricade gives you more time to eliminate zombies
2. **Balance Resources**: Don't focus only on one area (barricade/allies/weapons)
3. **Watch Your Barricade HP**: Displayed in top-right HUD with color-coded health
4. **Use Power-Ups Wisely**: Spawn every 4 kills for temporary boosts
5. **Headshots Matter**: Increased score and tracked separately
6. **Ally Management**: Find allies during daytime to help fight zombies

## 📊 Technical Details

- **Total Game Duration**: ~6.5 minutes (optimized for quick sessions)
- **Frame Rate**: Optimized for 60 FPS
- **Entity Management**: Efficient cleanup systems prevent lag
- **Staggered Spawning**: Zombies spawn in batches to maintain performance
- **Visual Effects**: 15-particle green blood splash on every hit

## 🏆 Victory Conditions

- Survive all 7 waves
- Defeat all zombies including mini-bosses and big bosses
- Player health above 0 at the end

## 📝 Development Notes

For detailed game balance parameters and tuning information, see `GAME_BALANCE_DOCUMENT.md`.

## 🚀 Getting Started

1. Navigate to the game location in Decentraland
2. Watch the intro cutscene (or press E to skip)
3. Survive 7 waves
4. Achieve victory and witness the ending!

---

**Game Title**: 7 Days in Hell  
**Genre**: Zombie Survival / Side-Scrolling Shooter  
**Platform**: Decentraland  
**Play Time**: ~7 minutes per session  
**Difficulty**: Progressive (Easy → Hard)

_Good luck, soldier. Your evacuation is 7 days away..._
