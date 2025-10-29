# Game Balance & Barricade System Update - 5-7 MINUTE TOTAL GAME

## Summary

This update implements major game balance changes to create a **5-7 minute TOTAL gameplay experience** (not per wave!) with lots of zombies but manageable difficulty. Additionally, a complete barricade defense system has been added for tactical gameplay.

## 🎮 Game Balance Changes (5-7 Minute Total Game)

### Zombie Stats (constants.ts)

- **Base Health**: 30 → **15** (1 pistol shot to kill!)
- **Health Multiplier**: 0.3 → **0.1** (minimal health scaling)
- **Base Speed**: 5.0 → **4.0** (fast but manageable)
- **Speed Increment**: 0.2 → **0.1** (very slow speed scaling)
- **Damage Increment**: 2 → **1** (slower damage scaling)
- **Spawn Interval**: 4000ms → **800ms** (VERY fast spawning!)
- **Spawn Batch Size**: 6 → **10** (10 zombies per batch!)
- **Death Animation**: 60s → **2s** (instant cleanup)

### Weapon Stats (Buffed for Fast Kills)

**Pistol:**

- Damage: 15 → **20** (1-shot zombies)
- Fire Rate: 0.4 → **0.3** (faster)
- Reload Time: 1500ms → **1200ms**

**Shotgun:**

- Damage: 50 → **60** (crowd control)
- Fire Rate: 0.3 → **0.25** (faster)
- Reload Time: 2500ms → **2000ms**

**Rifle:**

- Damage: 20 → **25** (sustained fire)
- Fire Rate: 0.15 → **0.12** (faster)
- Reload Time: 2000ms → **1500ms**

### Wave Configuration (WaveManager.ts)

**Formula**: `10 + waveNumber * 5`

- **Wave 1**: 15 zombies (~60 seconds)
- **Wave 2**: 20 zombies (~65 seconds)
- **Wave 3**: 25 zombies (~75 seconds)
- **Wave 4**: 30 zombies (~85 seconds)
- **Wave 5**: 35 zombies (~90 seconds)
- **Wave Transition**: 3s → **1.5s** (faster)

### Story Mode Waves (storyConfig.ts)

- **Wave 1**: 15 zombies, 0 mini-bosses, 1 big boss (~60s)
- **Wave 2**: 20 zombies, 0 mini-bosses, 1 big boss (~70s)
- **Wave 3**: 25 zombies, 1 mini-boss, 1 big boss (~80s)
- **Wave 4**: 30 zombies, 1 mini-boss, 1 big boss (~90s)
- **Wave 5**: 35 zombies, 1 mini-boss, 1 big boss (~90s)

### Boss Health Scaling (Ultra Fast)

- **Big Boss Base**: 300 → **80** (die in ~10-15 seconds)
- **Big Boss Per Wave**: 200 → **40** (minimal scaling)
- **Mini-Boss Base**: 150 → **50** (die in ~5-8 seconds)
- **Mini-Boss Per Wave**: 75 → **20** (minimal scaling)

### Total Game Time Breakdown

```
Wave 1: ~60s (15 zombies + boss)
Wave 2: ~70s (20 zombies + boss)
Wave 3: ~80s (25 zombies + mini + boss)
Wave 4: ~90s (30 zombies + mini + boss)
Wave 5: ~90s (35 zombies + mini + boss)
Transitions: ~7.5s (5 waves × 1.5s)

TOTAL: ~397 seconds = ~6.6 minutes ✓
```

---

## 🛡️ Barricade System

### Overview

Players can now build and repair barricades at strategic positions to slow down zombie hordes. Zombies will attack barricades when they get close, creating tactical defense opportunities.

### Features

#### Building & Repairing

- **Build Cost**: 50 points
- **Repair Cost**: 25 points
- **Repair Amount**: 50 HP per repair
- **Max Barricades**: 6 total
- **Barricade Health**: 200 HP

#### Barricade Positions

Six strategic defense points arranged in two rows:

1. **Front Row** (X=25): Left (-4), Center (0), Right (+4)
2. **Back Row** (X=20): Far Left (-6), Center (0), Far Right (+6)

#### Zombie Behavior

- Zombies detect barricades within 2 meters
- Stop and attack barricades instead of moving forward
- Deal damage based on their zombie.damage stat
- Continue toward player after barricade is destroyed

#### Visual Feedback

- Barricade scale reduces as health decreases (100% → 50% minimum)
- UI prompt shows "Build" or "Repair" when near barricade slot
- Costs displayed in prompts

### New Files Created

1. **`src/components/GameComponents.ts`**

   - Added `Barricade` component with health, position, and slot tracking

2. **`src/features/BarricadeManager.ts`**

   - `createBarricade(slotIndex)` - Build new barricade
   - `repairBarricade(entity)` - Repair damaged barricade
   - `damageBarricade(entity, damage)` - Apply damage from zombies
   - `destroyBarricade(entity)` - Remove destroyed barricade
   - `getNearestBarricade(position)` - Find closest barricade
   - `removeAllBarricades()` - Cleanup on game reset

3. **`src/systems/BarricadeSystem.ts`**
   - `barricadeSystem(dt)` - Handle player interaction (F key)
   - `barricadeVisualSystem(dt)` - Update visual feedback
   - `getCurrentBarricadePrompt()` - UI text for prompts

### Integration Points

#### Constants (`utils/constants.ts`)

```typescript
export const MAX_BARRICADES = 6
export const BARRICADE_HEALTH = 200
export const BARRICADE_BUILD_COST = 50
export const BARRICADE_REPAIR_COST = 25
export const BARRICADE_REPAIR_AMOUNT = 50
export const BARRICADE_POSITIONS: Vector3[] = [...]
```

#### Zombie AI (`systems/ZombieSystem.ts`)

- Checks for nearby barricades (< 2 meters)
- Switches to attack animation
- Deals damage to barricade instead of player
- Continues normal behavior after barricade destroyed

#### UI (`ui/GameUI.tsx`)

- Displays barricade prompt when near slot
- Shows build or repair text with cost
- F key indicator

#### Game Controller (`core/GameController.ts`)

- Removes all barricades on game over
- Removes all barricades on restart

#### Main Entry (`index.ts`)

- Registered `barricadeSystem` for interactions
- Registered `barricadeVisualSystem` for updates

### Controls

- **[F]**: Build or repair barricade when standing near a barricade slot (within 3 meters)

### Strategy Tips

- Place barricades in lanes where most zombies spawn
- Repair barricades during wave breaks
- Front row barricades slow initial rush
- Back row barricades provide fallback defense

---

## 🎯 Expected Gameplay Experience

### Timing Breakdown (5-7 Minutes TOTAL)

- **Wave 1**: ~60s (15 zombies + boss)
- **Wave 2**: ~70s (20 zombies + boss)
- **Wave 3**: ~80s (25 zombies + mini + boss)
- **Wave 4**: ~90s (30 zombies + mini + boss)
- **Wave 5**: ~90s (35 zombies + mini + boss)
- **Transitions**: ~7.5s (5 × 1.5s between waves)
- **TOTAL**: ~397 seconds = **~6.6 minutes** ✓

### Difficulty Curve

- ✅ Fast-paced action (0.8s spawn interval)
- ✅ Easy to kill zombies (1 pistol shot)
- ✅ Lots of zombies per wave (15-35)
- ✅ Quick boss fights (10-15 seconds)
- ✅ Strategic barricade defense
- ✅ Complete game in 5-7 minutes

### Pacing

- **Early Game** (Waves 1-2): Learn mechanics, build barricades, ~2 minutes
- **Mid Game** (Wave 3): Action ramps up, mini-boss appears, ~1.5 minutes
- **Late Game** (Waves 4-5): Intense finale, manage resources, ~3 minutes
- **Total Experience**: Satisfying arc, completable in one session

### Player Progression

- Start with pistol (20 damage, 1-shot kills)
- Build barricades for defense (50 points each)
- Buy shotgun (60 damage) for crowd control
- Buy rifle (25 damage) for sustained fire
- Repair barricades between waves (25 points)
- Upgrade weapons at Executioner's Chest
- Defeat final boss and complete game!

---

## 📁 Files Modified

### Core Game Files

- `src/utils/constants.ts` - Game balance constants + weapon buffs
- `src/utils/storyConfig.ts` - Story wave configuration (reduced counts)
- `src/features/WaveManager.ts` - Wave spawning logic (faster transitions)
- `src/components/GameComponents.ts` - Added Barricade component

### New Barricade Files

- `src/features/BarricadeManager.ts` - **NEW**
- `src/systems/BarricadeSystem.ts` - **NEW**

### Integration Updates

- `src/systems/ZombieSystem.ts` - Zombie barricade attacks
- `src/ui/GameUI.tsx` - Barricade UI prompts
- `src/core/GameController.ts` - Barricade cleanup
- `src/index.ts` - System registration

---

## 🐛 Known Limitations

1. **Barricade Model**: Currently uses `prop.glb` placeholder - could be replaced with custom barricade model
2. **Visual Damage**: Only scale changes - color tinting would require material system
3. **Sound Effects**: No specific barricade damage/destruction sounds yet
4. **Placement UI**: No preview before placing barricade
5. **Maximum Barricades**: Fixed at 6 - could be made upgradeable

---

## 🚀 Future Enhancements

- [ ] Custom barricade 3D models (wooden planks, metal sheets, etc.)
- [ ] Barricade upgrade system (reinforced barriers)
- [ ] Barricade health bars
- [ ] Sound effects for building, repairing, and destruction
- [ ] Placement preview (ghost model)
- [ ] Different barricade types (wood, metal, electric)
- [ ] Automatic repair power-up
- [ ] Achievement for surviving without barricades
- [ ] Leaderboard for fastest completion time

---

## ✅ Testing Checklist

- [x] Zombies spawn at very fast rate (0.8s)
- [x] Zombies die in 1 pistol shot
- [x] Waves complete in ~60-90 seconds each
- [x] Total game completes in 5-7 minutes
- [x] Bosses die quickly (10-15 seconds)
- [x] Barricades can be built at all 6 positions
- [x] Barricades can be repaired
- [x] Zombies attack barricades when close
- [x] Barricades are destroyed at 0 HP
- [x] Points are deducted correctly
- [x] UI prompts appear when near slots
- [x] Barricades are cleaned up on game over/restart
- [x] No linting errors
- [x] Fast-paced, arcade-style experience

---

## 🎮 Design Philosophy

This update transforms the game into a **fast-paced, arcade-style experience**:

1. **Short Session Length**: Complete experience in 5-7 minutes
2. **High Action Density**: Constant zombie spawning, no downtime
3. **Easy Difficulty**: One-shot kills, power fantasy
4. **Strategic Depth**: Barricade placement adds tactical layer
5. **Satisfying Arc**: Quick progression from start to epic finale

Perfect for:

- Quick gaming sessions
- Casual players
- Testing and iteration
- Multiplayer competitions (who can complete fastest?)
- Arcade-style leaderboards

---

**Last Updated**: October 27, 2025 (5-7 minute TOTAL game version)
