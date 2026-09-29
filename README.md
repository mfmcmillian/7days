# 7 Days in Hell

**Seven nights. One barricade. Hold the line until extraction.**

A mobile-first lane-defense zombie shooter for [Decentraland](https://decentraland.org), rebuilt from the ground up on SDK 7. You are Delta-1, the last soldier at a street barricade. Every night the horde comes down the road in three lanes; every day you decide how to spend twelve hours of light. Survive all seven and Command sends the chopper.

> Rebuilt in the same spirit as [Siege of Antrom](https://github.com/mfmcmillian/SiegeOfAntrom): a fresh codebase, a fixed cinematic camera, a virtual-canvas UI that reads on a phone, pooled entities, and an art catalog designed for a Synty asset pass.

---

## How it plays

| Beat | What happens |
| --- | --- |
| **Title** | Original intro reel loops behind a single `TAP TO START`. That tap also unlocks audio on mobile. |
| **Briefing** | Original mission video, skippable. |
| **Transmission** | HQ / Soldier / Survivor radio lines for the night (the original script, verbatim). Tap anywhere to advance. |
| **Night** | Zombies spawn at the far end of the street and walk down three lanes toward your sandbag wall. **Tap a lane to move.** You fire automatically at the closest target in your lane, and reload automatically. Kills drop drifting pickups that slide toward you along the lane: grab them by standing in that lane. |
| **The wall** | Zombies stop at the barricade and chew through it. If it falls, everything past the line converges on *you*. |
| **Dawn** | Stats, then **12 hours** to split between `REPAIR THE WALL`, `RALLY SURVIVORS` and `SCAVENGE` with big +/- steppers. |
| **Dusk** | Results, your weapon locker (tap to equip), then the next transmission. |
| **Night 7** | Hold the line. Then the original extraction reel and Command's final message. |

Seven nights takes roughly 10-12 minutes.

### Controls

| Action | Touch | Keyboard |
| --- | --- | --- |
| Move to lane | Tap the left / centre / right third of the screen | `A` / `D`, or `1` `2` `3` |
| Fire / reload | Automatic | Automatic |
| Continue / confirm | On-screen button (or tap anywhere in dialogue) | `E` or `Space` |
| Mute | `SOUND` button | — |

There is no action in the game that requires a keyboard or a mouse hover.

### Enemies

| Type | Role |
| --- | --- |
| Walker | The bulk of the horde. |
| Runner | Fast, fragile, punishes slow lane changes. |
| Brute (mini-boss) | Orange threat ring. Heavy wall damage. Drops a pickup. |
| Boss | Red ring, health bar in the HUD, arrives once ~70% of the horde has spawned. |

### Weapons

| Weapon | Found by | Feel |
| --- | --- | --- |
| Sidearm | Start | Reliable, small magazine. |
| Riot Shotgun | Scavenge 4h+ | Short reach, pierces three. |
| Marksman Rifle | Scavenge 4h+ | Reaches the spawn line, pierces two. |
| Assault Rifle | Scavenge 7h+ | Wall of lead. |

All numbers live in [`src/config/balance.ts`](src/config/balance.ts).

---

## Mobile-first, concretely

- **Virtual canvas 1600x720 (20:9).** The SDK contain-fits it into whatever the device has, so a phone in landscape uses the whole screen and a 16:9 desktop simply scales up.
- **Thumb-sized targets.** Every button is at least 64 virtual px tall; the lane controls are full-height thirds of the screen.
- **Fixed camera, no mouse look.** A `VirtualCamera` behind the hero looks down the street. `VirtualCamera` has no FOV control, so the rig repositions itself from `UiCanvasInformation` when the aspect ratio changes (a tall portrait canvas gets a higher, steeper camera so all three lanes stay in frame).
- **Real avatar hidden and locked.** `AvatarModifierArea` hides avatars across the scene and `InputModifier` freezes the player; the hero on screen is an `AvatarShape` wearing *your* wearables, so you still play as you.
- **Audio behind the first tap.** Nothing plays until `TAP TO START`, which is what mobile browsers require anyway.
- **Pooled everything.** Enemies, tracers, pickups and hit sparks are pre-allocated and recycled; no entity churn during a wave.
- **Video on a world plane.** The three original HLS reels play on a 16:9 screen the cinema camera squares up to, letterboxing by moving the camera rather than fighting the UI.

---

## Project layout

```
src/
  index.ts              boot order
  config/
    balance.ts          weapons, enemies, nights, pickups, daytime rules
    dialogue.ts         radio script (original text), night titles
    geometry.ts         lanes, hero/barricade/spawn X positions, cinema placement
    media.ts            original video URLs and sound paths
  art/catalog.ts        every visual role -> model file (see "Art pass" below)
  core/
    state.ts            single mutable game state + phase enum
    game.ts             the state machine: intro -> briefing -> dialogue -> night -> dawn -> dusk -> ...
    camera.ts           play / cinema poses, aspect-adaptive, camera shake
    input.ts            touch + keyboard -> lane intents / confirm
    audio.ts            music, ambience, narration, pooled global SFX
    timers.ts           tiny frame-driven timers
  systems/
    enemies.ts          pool, movement, wall / hero attacks, death, boss ring
    projectiles.ts      pooled tracers with lane hit tests and pierce
    hero.ts             hero entity, lane slide, auto-fire, auto-reload, weapon models
    allies.ts           survivors firing from behind the wall
    pickups.ts          drifting crates, effects (rapid fire, insta-kill, ...)
    vfx.ts              hit sparks and muzzle flashes
  world/
    environment.ts      procedural night street: road, curbs, skyline, sodium lights, wrecks, fires
    barricade.ts        three-course sandbag wall that visibly loses bags as it takes damage
    cinema.ts           video screen + black backdrop
  ui/
    index.tsx           renderer + phase switch
    theme.ts            palette, type scale, virtual size
    components.tsx      Btn, Bar, Panel, Overlay, Stat, ...
    screens/            hud, dialogue, day, menus
sounds/                 original audio (music, sirens, narration takes, SFX)
models/placeholders/    old zombie + weapon GLBs used until the Synty pass
dclcontext/             SDK7 reference for AI assistants
```

---

## Art pass (Synty)

Every visual in the game resolves through [`src/art/catalog.ts`](src/art/catalog.ts). A role with `src: null` renders a procedural placeholder (the current street, buildings, streetlights, wrecks, sandbags and crates are all primitives), so the game is fully playable before a single asset is dropped in.

To swap a role:

1. Export the GLB (Y-up, metres, forward = +Z) under `models/<pack>/`.
2. Set `src`, then fix `scale`, `yaw` and `yOffset` until it sits right.
3. For characters, map `clips` to the clip names in the file (`idle / walk / run / attack / die`).

The catalog lists a suggested Synty prefab next to each role. The hero and survivors default to `AvatarShape`; give them a `src` to use rigged Synty soldiers instead.

Placeholders that ship today: `models/placeholders/zombie.glb` (rigged, all five clips) and the three weapon GLBs.

---

## Develop

```bash
npm install
npm start            # local preview
npm run start:mcp    # preview + Explorer MCP on :8000 for agent-driven testing
npm run build        # bundle + typecheck
npm run deploy:world # publish to the Decentraland World in scene.json
```

Requires Node 18+. The scene is a 5x3 parcel World (`worldConfiguration.name` in `scene.json`), skybox pinned to midnight.

---

## Credits

Original *7 Days in Hell* concept, script, cutscenes and audio by mfmcmillian. Narration voice generated with ElevenLabs. Rebuilt on Decentraland SDK 7.
