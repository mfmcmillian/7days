/**
 * Visual Effects System for Neural Collapse
 * Handles muzzle flashes, blood effects, and other visual effects
 */

import { engine, Transform, MeshRenderer, Material, Entity } from '@dcl/sdk/ecs'
import { Vector3, Color4 } from '@dcl/sdk/math'
import { MuzzleFlash, BloodEffect } from '../components/GameComponents'

/**
 * Create a muzzle flash effect at weapon position
 */
export function createMuzzleFlash(position: Vector3, direction: Vector3) {
  const flashEntity = engine.addEntity()

  // Calculate flash position slightly in front of the weapon
  const flashPosition = Vector3.add(position, Vector3.scale(direction, 0.3))

  Transform.create(flashEntity, {
    position: flashPosition,
    scale: Vector3.create(0.1, 0.1, 0.1)
  })

  // Create bright yellow/orange sphere for muzzle flash
  MeshRenderer.setSphere(flashEntity)
  Material.setPbrMaterial(flashEntity, {
    albedoColor: Color4.create(1, 0.8, 0.2, 1),
    emissiveColor: Color4.create(1, 0.9, 0.3),
    emissiveIntensity: 3
  })

  MuzzleFlash.create(flashEntity, {
    creationTime: Date.now(),
    duration: 100 // Flash lasts 0.1 seconds
  })

  console.log('Muzzle flash created')
}

/**
 * Create blood effect at hit position
 */
export function createBloodEffect(position: Vector3) {
  // Create multiple blood particles for VERY dramatic effect
  for (let i = 0; i < 15; i++) {
    // Increased from 8 to 15 particles
    const particleEntity = engine.addEntity()

    // Random offset for particle spread - MORE dramatic spread
    const offsetX = (Math.random() - 0.5) * 1.5 // Increased spread
    const offsetY = (Math.random() - 0.5) * 1.5 + 0.3 // Higher upward bias
    const offsetZ = (Math.random() - 0.5) * 1.5

    // Larger particle sizes for more visual impact
    const scale = 0.15 + Math.random() * 0.2 // Bigger particles

    Transform.create(particleEntity, {
      position: Vector3.create(position.x + offsetX, position.y + offsetY, position.z + offsetZ),
      scale: Vector3.create(scale, scale, scale)
    })

    // Create BRIGHT glowing green spheres for blood (alien/zombie blood)
    MeshRenderer.setSphere(particleEntity)
    Material.setPbrMaterial(particleEntity, {
      albedoColor: Color4.create(0, 1, 0, 1), // Pure bright green
      emissiveColor: Color4.create(0, 1, 0), // Pure green glow - FIXED: Color4 not Color3!
      emissiveIntensity: 5 // VERY bright and dramatic (was 2.5)
    })

    BloodEffect.create(particleEntity, {
      creationTime: Date.now(),
      duration: 1200 // Particles last longer (was 800ms, now 1.2s)
    })
  }

  console.log('DRAMATIC blood effect created')
}

/**
 * Muzzle Flash System - removes flash after duration
 */
export function muzzleFlashSystem(dt: number) {
  const currentTime = Date.now()

  for (const [entity, flash] of engine.getEntitiesWith(MuzzleFlash)) {
    const elapsed = currentTime - flash.creationTime

    if (elapsed >= flash.duration) {
      // Remove the flash
      engine.removeEntity(entity)
    } else {
      // Fade out the flash
      const fadeProgress = elapsed / flash.duration
      const transform = Transform.getMutable(entity)
      transform.scale = Vector3.lerp(Vector3.create(0.1, 0.1, 0.1), Vector3.create(0.01, 0.01, 0.01), fadeProgress)
    }
  }
}

/**
 * Blood Effect System - removes blood particles after duration
 */
export function bloodEffectSystem(dt: number) {
  const currentTime = Date.now()

  for (const [entity, blood] of engine.getEntitiesWith(BloodEffect)) {
    const elapsed = currentTime - blood.creationTime

    if (elapsed >= blood.duration) {
      // Remove the blood particle
      engine.removeEntity(entity)
    } else {
      // Make particles fall and fade
      const fadeProgress = elapsed / blood.duration
      const transform = Transform.getMutable(entity)

      // Particles fall down with slight spread
      const horizontalDrift = Math.sin(elapsed * 0.003) * 0.3
      transform.position = Vector3.create(
        transform.position.x + horizontalDrift * dt,
        transform.position.y - dt * 1.2, // Fall with gravity
        transform.position.z
      )

      // Scale down over time but start larger
      const initialScale = transform.scale.x
      const scale = initialScale * (1 - fadeProgress * 0.7) // Keep 30% size at end
      transform.scale = Vector3.create(scale, scale, scale)
    }
  }
}
