# Neural Collapse

A zombie survival horror game for Decentraland built with SDK 7.

## About

Neural Collapse is an intense single-player zombie survival game where you fight through endless waves of increasingly difficult zombies. Purchase weapons, unlock powerful perks, and see how long you can survive!

## Features

- **Wave-based zombie spawning** - Survive increasingly difficult waves
- **3 Weapons** - Pistol, Shotgun, and Rifle with unique stats
- **4 Perk Machines** - Double Tap, Royal Armor, Quick Reload, and Executioner's Chest
- **Power-ups** - Instant Kill, Fire Rate Boost, Max Ammo, and Double Points
- **Dynamic difficulty** - Zombies get stronger with each wave
- **Score tracking** - Track your kills, headshots, and high score

## Project Structure

```
src/
├── audio/          - Sound management system
├── components/     - ECS component definitions
├── core/           - Game state and controller
├── entities/       - Entity factories (weapons, zombies)
├── features/       - Game features (perks, powerups, waves)
├── systems/        - ECS systems (gameplay logic)
├── ui/             - React UI components
└── utils/          - Constants and utilities
```

## Try it out

**Previewing the scene**

1. Download this repository

2. Install the [Decentraland Editor](https://docs.decentraland.org/creator/development-guide/sdk7/editor/)

3. Open a Visual Studio Code window on this scene's root folder

4. Open the Decentraland Editor tab, and press **Run Scene**

Alternatively, you can use the command line:

```bash
npm install
npm run start
```

## Controls

- **E** - Start game / Interact with machines / Resume from pause
- **Left Click** - Shoot
- **F** - Reload
- **Q** - Previous weapon
- **E** - Next weapon

## Game Tips

- Aim for headshots to deal 5x damage
- Purchase perks early to gain an advantage
- Upgrade your weapons with Executioner's Chest
- Collect power-ups dropped by zombies
- Manage your ammo - only shotgun and rifle need reloading

## Development

This project follows clean code principles with a modular architecture:

- **Components** - Pure data containers
- **Systems** - Game logic and behavior
- **Entities** - Factory functions for creating game objects
- **Features** - Self-contained game features
- **Core** - Central game state management

## Credits

Built with Decentraland SDK 7
