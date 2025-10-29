# Neural Collapse - Game Balance Document

**For Game Designers**

Last Updated: October 27, 2025  
Game Version: Side-Scrolling Survival Mode  
Target Duration: 5-7 minutes total

---

## 📊 CORE GAME STATS

### Player Stats

| Stat                              | Value         | Notes               |
| --------------------------------- | ------------- | ------------------- |
| **Starting Health**               | 100 HP        | Base health         |
| **Max Health (with Royal Armor)** | 200 HP        | 2x health perk      |
| **Starting Position**             | X=-20, Z=8    | Side-scrolling view |
| **Movement Speed**                | Standard walk | WASD controls       |

---

## 🔫 WEAPON STATS

### Pistol (Starting Weapon)

| Stat                 | Value       | Notes               |
| -------------------- | ----------- | ------------------- |
| **Damage**           | 15          | Normal damage       |
| **Fire Rate**        | 0.8 seconds | Time between shots  |
| **Ammo Capacity**    | 12 rounds   | Magazine size       |
| **Reload Time**      | 2000ms (2s) | Reload duration     |
| **Range**            | 20 units    | Max effective range |
| **Projectile Speed** | 25 units/s  | Bullet travel speed |
| **Cost**             | FREE        | Starting weapon     |

**Upgraded Stats (Executioner's Chest):**

- Damage: 30 (+100%)
- Ammo: 24 rounds (+100%)

### Shotgun

| Stat              | Value         | Notes               |
| ----------------- | ------------- | ------------------- |
| **Damage**        | 60            | High damage         |
| **Fire Rate**     | 0.8 seconds   | Slower fire rate    |
| **Ammo Capacity** | 6 rounds      | Low capacity        |
| **Reload Time**   | 2500ms (2.5s) | Longer reload       |
| **Purchase Cost** | 500 points    | From weapon machine |
| **Ammo Cost**     | 200 points    | Per 50 rounds       |

**Upgraded Stats:**

- Damage: 100 (+67%)
- Ammo: 12 rounds (+100%)

### Rifle

| Stat              | Value        | Notes               |
| ----------------- | ------------ | ------------------- |
| **Damage**        | 25           | Medium damage       |
| **Fire Rate**     | 0.15 seconds | Fast automatic fire |
| **Ammo Capacity** | 25 rounds    | Good capacity       |
| **Reload Time**   | 2000ms (2s)  | Standard reload     |
| **Range**         | 35 units     | Long range          |
| **Purchase Cost** | 750 points   | From weapon machine |
| **Ammo Cost**     | 300 points   | Per 50 rounds       |

**Upgraded Stats:**

- Damage: 40 (+60%)
- Ammo: 50 rounds (+100%)

---

## 🧟 ZOMBIE STATS

### Base Zombie (Regular)

| Stat                | Formula                | Wave 1  | Wave 3  | Wave 5  |
| ------------------- | ---------------------- | ------- | ------- | ------- |
| **Health**          | 15 + (wave _ 0.1 _ 15) | 15 HP   | 19.5 HP | 22.5 HP |
| **Speed**           | 4.0 + (wave \* 0.1)    | 4.0 u/s | 4.2 u/s | 4.4 u/s |
| **Damage**          | 10 + (wave \* 1)       | 10 DMG  | 12 DMG  | 14 DMG  |
| **Attack Cooldown** | 1000ms (1s)            | 1s      | 1s      | 1s      |
| **Points on Kill**  | 100                    | 100     | 100     | 100     |

**Scaling Formulas:**

```
Health = BASE_HEALTH + (waveNumber * HEALTH_MULTIPLIER * BASE_HEALTH)
  where BASE_HEALTH = 15
  where HEALTH_MULTIPLIER = 0.1

Speed = BASE_SPEED + (waveNumber * SPEED_INCREMENT)
  where BASE_SPEED = 4.0
  where SPEED_INCREMENT = 0.1

Damage = BASE_DAMAGE + (waveNumber * DAMAGE_INCREMENT)
  where BASE_DAMAGE = 10
  where DAMAGE_INCREMENT = 1
```

### Mini-Boss

| Stat       | Formula               | Wave 3  | Wave 5  |
| ---------- | --------------------- | ------- | ------- |
| **Health** | 50 + ((wave-1) \* 20) | 90 HP   | 130 HP  |
| **Size**   | 1.5x                  | Larger  | Larger  |
| **Speed**  | Same as regular       | 4.2 u/s | 4.4 u/s |
| **Damage** | Same as regular       | 12 DMG  | 14 DMG  |

### Big Boss

| Stat       | Formula               | Wave 1  | Wave 3  | Wave 5  |
| ---------- | --------------------- | ------- | ------- | ------- |
| **Health** | 80 + ((wave-1) \* 40) | 80 HP   | 160 HP  | 240 HP  |
| **Size**   | 2.0x                  | Large   | Large   | Large   |
| **Speed**  | Same as regular       | 4.0 u/s | 4.2 u/s | 4.4 u/s |
| **Damage** | Same as regular       | 10 DMG  | 12 DMG  | 14 DMG  |

---

## 🛡️ BARRICADE STATS

| Stat              | Value           | Notes                              |
| ----------------- | --------------- | ---------------------------------- |
| **Max Health**    | 200 HP          | Double strength (2x base)          |
| **Build Cost**    | 50 points       | Initial construction (not used)    |
| **Repair Cost**   | 25 points       | Per repair (not used in daytime)   |
| **Repair Amount** | 50 HP           | Manual repair amount               |
| **Number**        | 1 barricade     | Single large wall                  |
| **Size**          | 15m × 3m × 0.5m | Width × Height × Depth             |
| **Color**         | Brown           | Dark brown wood (0.4, 0.25, 0.15)  |
| **Position**      | X=-15, Y=1, Z=0 | 5 units in front of player (X=-20) |
| **Rotation**      | 90° (vertical)  | Perpendicular to zombie approach   |

**Daytime Repair System:**

- **Formula**: 50% + (10% per hour allocated)
- **0 hours**: 50% repair
- **3 hours**: 80% repair
- **5 hours**: 100% repair (full restoration)
- **Rebuild Threshold**: 50%+ allocation rebuilds destroyed barricade
- **Rebuild Health**: Based on allocation percentage

**Barricade Behavior:**

- Zombies MUST destroy the barricade before reaching player
- Detection range: 5 units
- Zombies attack barricade when within 1.5 units
- Visual damage: Height shrinks as health decreases (minimum 30% at low health)
- Automatically destroyed at 0 HP
- Can be rebuilt during daytime allocation

---

## 🌊 WAVE CONFIGURATION

### Story Mode (7 Waves Total)

| Wave | Zombies | Mini-Boss | Big Boss | Difficulty |
| ---- | ------- | --------- | -------- | ---------- |
| 1    | 15      | 0         | 1        | Easy       |
| 2    | 20      | 0         | 1        | Easy       |
| 3    | 25      | 1         | 1        | Medium     |
| 4    | 30      | 1         | 1        | Medium     |
| 5    | 35      | 1         | 1        | Medium     |
| 6    | 40      | 2         | 1        | Hard       |
| 7    | 45      | 2         | 1        | Hard       |

**Total Game Time: ~8 minutes**

### Spawn Settings

| Setting             | Value         | Notes                      |
| ------------------- | ------------- | -------------------------- |
| **Spawn Interval**  | 800ms (0.8s)  | Time between spawn batches |
| **Batch Size**      | 10 zombies    | Zombies per batch          |
| **Wave Transition** | 1500ms (1.5s) | Delay between waves        |
| **Death Animation** | 2000ms (2s)   | Body cleanup time          |

### Spawn Positions

```
X=28-32, Z=-6 to +6 (spread across 5 lanes)
- Lane 1: Z=-6 (far left)
- Lane 2: Z=-3 (left)
- Lane 3: Z=0 (center)
- Lane 4: Z=+3 (right)
- Lane 5: Z=+6 (far right)
```

---

## 💰 ECONOMY & SCORING

### Point Rewards

| Action             | Points | Notes           |
| ------------------ | ------ | --------------- |
| Body Shot          | 10     | Hit zombie body |
| Headshot           | 50     | Precision shot  |
| Kill               | 100    | Finish zombie   |
| **Total per Kill** | ~160   | With headshot   |

### Purchases & Upgrades

| Item                    | Cost | Type                   |
| ----------------------- | ---- | ---------------------- |
| **Barricade (Build)**   | 50   | Defense                |
| **Barricade (Repair)**  | 25   | Maintenance            |
| **Shotgun**             | 500  | Weapon                 |
| **Shotgun Ammo**        | 200  | Ammo pack              |
| **Rifle**               | 750  | Weapon                 |
| **Rifle Ammo**          | 300  | Ammo pack              |
| **Double Tap**          | 1000 | Perk (2x damage)       |
| **Royal Armor**         | 800  | Perk (2x health)       |
| **Quick Reload**        | 600  | Perk (2x reload speed) |
| **Executioner's Chest** | 50   | Weapon upgrade         |

---

## ⚡ PERKS & POWER-UPS

### Permanent Perks (Machines)

| Perk             | Cost | Effect                      | Duration  |
| ---------------- | ---- | --------------------------- | --------- |
| **Double Tap**   | 1000 | 2x weapon damage            | Permanent |
| **Royal Armor**  | 800  | 2x max health (200 HP)      | Permanent |
| **Quick Reload** | 600  | 2x reload speed (0.5x time) | Permanent |

### Temporary Power-Ups (Drops)

| Power-Up          | Duration   | Effect            | Spawn Rate    |
| ----------------- | ---------- | ----------------- | ------------- |
| **Instant Kill**  | 10 seconds | 1-shot any zombie | Every 2 kills |
| **Fire Rate**     | 10 seconds | 2x fire rate      | Every 2 kills |
| **Max Ammo**      | Instant    | Full ammo refill  | Every 2 kills |
| **Double Points** | 10 seconds | 2x point gain     | Every 2 kills |

**Power-Up Settings:**

- Lifetime: 15 seconds (disappears if not collected)
- Spawn Frequency: Every 2 zombie kills
- Effect Duration: 10 seconds (except Max Ammo)

---

## 🎯 BALANCING GUIDELINES

### Time-to-Kill (TTK) Analysis

**Wave 1 Zombies (15 HP):**

- Pistol (15 DMG): 1 shot = **0.05s**
- Shotgun (60 DMG): 1 shot = **instant**
- Rifle (25 DMG): 1 shot = **instant**

**Wave 3 Zombies (19.5 HP):**

- Pistol (15 DMG): 2 shots = **1.6s**
- Shotgun (60 DMG): 1 shot = **instant**
- Rifle (25 DMG): 1 shot = **instant**

**Wave 5 Boss (240 HP):**

- Pistol (15 DMG): 16 shots = **~13s**
- Shotgun (60 DMG): 4 shots = **~3.2s**
- Rifle (25 DMG): 10 shots = **~1.5s** (with auto-fire)

### Difficulty Curve

- **Early Game (Waves 1-2):** Easy, learn mechanics, 1-shot kills
- **Mid Game (Wave 3):** Moderate, 2-shot kills, first mini-boss
- **Late Game (Waves 4-5):** Challenging, 2-shot kills, multiple bosses

### Resource Management

**Points Economy per Wave:**

- Wave 1: ~2,400 points earned (15 kills × 160)
- Cumulative by Wave 3: ~9,600 points
- Enough for: 1 weapon + 2 perks + 6 barricades

**Recommended Purchase Order:**

1. Build 3-6 barricades (150-300 points)
2. Buy Shotgun (500 points) or Rifle (750 points)
3. Buy Quick Reload perk (600 points)
4. Buy Royal Armor (800 points)
5. Buy Double Tap (1000 points)
6. Upgrade weapon at Executioner's Chest (50 points)

---

## 🔧 TUNING PARAMETERS

### Easy Adjustments (Quick Tweaks)

```typescript
// echoes/src/utils/constants.ts

// Make Game Easier:
ZOMBIE_BASE_HEALTH = 10 // (currently 15)
ZOMBIE_BASE_DAMAGE = 5 // (currently 10)
BARRICADE_HEALTH = 300 // (currently 200)

// Make Game Harder:
ZOMBIE_BASE_HEALTH = 20 // (currently 15)
ZOMBIE_SPAWN_INTERVAL = 500 // (currently 800)
ZOMBIE_SPAWN_BATCH_SIZE = 15 // (currently 10)
```

### Advanced Adjustments

```typescript
// echoes/src/utils/fighterWeapons.ts

// Pistol Power:
fireRate: 0.5 // (currently 0.8) - faster
damage: 20 // (currently 15) - stronger

// echoes/src/utils/storyConfig.ts

// Wave Count:
zombieCount: 20 // Wave 1 (currently 15)
zombieCount: 40 // Wave 3 (currently 25)
```

---

## 📈 TESTING CHECKLIST

### Balance Testing

- [ ] Can complete Wave 1 with starting pistol only?
- [ ] Can complete Wave 3 with 1 weapon + 1 perk?
- [ ] Can complete Wave 5 with 2 weapons + 2 perks?
- [ ] Do barricades last ~30-60 seconds under attack?
- [ ] Is total game time 5-7 minutes?
- [ ] Can earn enough points for reasonable upgrades?

### Difficulty Validation

- [ ] Wave 1: Easy (tutorial feel)
- [ ] Wave 2-3: Medium (moderate challenge)
- [ ] Wave 4-5: Hard (tense finale)
- [ ] Never feels impossible
- [ ] Always feels rewarding

### Economy Check

- [ ] Points earned match expected costs
- [ ] Progression feels natural (not too fast/slow)
- [ ] All perks are achievable by Wave 4-5
- [ ] Weapon upgrades feel impactful

---

## 🎮 PLAYER FEEDBACK METRICS

**Key Metrics to Track:**

1. Average completion time (target: 6.5 min)
2. Wave failure rate per wave
3. Most purchased items
4. Average barricades built per game
5. Most used weapon
6. Boss fight duration

**Success Criteria:**

- 70%+ completion rate on first playthrough
- Feels fast-paced but not overwhelming
- Clear progression of power
- Strategic depth (barricade placement matters)

---

## 📝 DESIGNER NOTES

**Game Feel:**

- Side-scrolling view (like Last War Survival)
- Auto-aim projectile system
- Fast spawn rate = constant action
- Low zombie HP = satisfying kills
- Barricades = strategic layer

**Balance Philosophy:**

- Easy to learn, satisfying to master
- Clear difficulty progression
- Multiple viable strategies
- Barricades are useful but not mandatory
- Power fantasy in late game

**Future Tuning:**

- Monitor boss fight duration (should be 10-20s)
- Watch barricade usage (aim for 3-4 per game)
- Track weapon preference (should be balanced)
- Adjust spawn rate if too chaotic/boring

---

**End of Document**
