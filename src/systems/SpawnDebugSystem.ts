/**
 * Spawn Debug System
 * Creates visible red boxes at zombie spawn points for testing
 */

import { engine, Transform, MeshRenderer, Material, Entity } from '@dcl/sdk/ecs'
import { Color4 } from '@dcl/sdk/math'
import { ZOMBIE_SPAWNS } from '../utils/constants'

let debugBoxes: Entity[] = []

/**
 * Create red debug boxes at all spawn points
 */
export function createSpawnDebugBoxes(): void {
  console.log('🔴 Creating spawn point debug boxes...')

  for (let i = 0; i < ZOMBIE_SPAWNS.length; i++) {
    const spawnPoint = ZOMBIE_SPAWNS[i]
    const debugBox = engine.addEntity()

    Transform.create(debugBox, {
      position: spawnPoint,
      scale: { x: 1, y: 2, z: 1 } // 1x2x1 box to represent zombie height
    })

    // Create red box
    MeshRenderer.setBox(debugBox)
    Material.setPbrMaterial(debugBox, {
      albedoColor: Color4.create(1, 0, 0, 0.5) // Semi-transparent red
    })

    debugBoxes.push(debugBox)
    console.log(`  → Spawn ${i + 1}: (${spawnPoint.x}, ${spawnPoint.y}, ${spawnPoint.z})`)
  }

  console.log(`✅ Created ${debugBoxes.length} spawn debug boxes`)
}

/**
 * Remove all spawn debug boxes
 */
export function removeSpawnDebugBoxes(): void {
  for (const box of debugBoxes) {
    engine.removeEntity(box)
  }
  debugBoxes = []
  console.log('✅ Removed spawn debug boxes')
}
