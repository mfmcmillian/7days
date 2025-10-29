/**
 * Camera Shake System
 * Adds screen shake feedback for shooting
 */

import { engine, Transform } from '@dcl/sdk/ecs'
import { Vector3, Quaternion } from '@dcl/sdk/math'
import { getGamePhase } from '../core/GameState'

// Shake state
let shakeIntensity = 0
let shakeDecay = 10 // How fast shake fades
let originalCameraRotation: Quaternion | null = null

/**
 * Trigger camera shake
 * @param intensity - Shake strength (0.001 = subtle, 0.01 = strong)
 */
export function triggerCameraShake(intensity: number) {
  shakeIntensity = Math.max(shakeIntensity, intensity)

  // Store original rotation if not already stored
  if (!originalCameraRotation) {
    const cameraTransform = Transform.getOrNull(engine.CameraEntity)
    if (cameraTransform) {
      // Manually create a copy of the quaternion
      originalCameraRotation = Quaternion.create(
        cameraTransform.rotation.x,
        cameraTransform.rotation.y,
        cameraTransform.rotation.z,
        cameraTransform.rotation.w
      )
    }
  }
}

/**
 * Camera shake system - applies and decays shake over time
 * TEMPORARILY DISABLED FOR TOP-DOWN CAMERA (conflicts with locked rotation)
 */
export function cameraShakeSystem(dt: number) {
  // DISABLED: Top-down camera uses locked rotation
  // TODO: Re-implement shake as position-based or zoom-based effect for top-down
  return

  /* ORIGINAL CODE - COMMENTED OUT
  if (getGamePhase() !== 'playing') {
    // Reset shake when not playing
    if (shakeIntensity > 0) {
      shakeIntensity = 0
      originalCameraRotation = null
    }
    return
  }

  // Decay shake over time
  if (shakeIntensity > 0) {
    const cameraTransform = Transform.getMutableOrNull(engine.CameraEntity)
    if (!cameraTransform) return

    // Apply random shake
    const shakeX = (Math.random() - 0.5) * shakeIntensity
    const shakeY = (Math.random() - 0.5) * shakeIntensity

    // Create shake rotation
    const shakeRotation = Quaternion.fromEulerDegrees(shakeX * 100, shakeY * 100, 0)

    // Apply shake (multiplicative to preserve player look direction)
    if (originalCameraRotation) {
      cameraTransform.rotation = Quaternion.multiply(originalCameraRotation, shakeRotation)
    }

    // Decay shake
    shakeIntensity = Math.max(0, shakeIntensity - shakeDecay * dt)

    // Reset original rotation when shake ends
    if (shakeIntensity <= 0.0001) {
      shakeIntensity = 0
      originalCameraRotation = null
    }
  }
  */
}

/**
 * Get weapon-specific shake intensity
 */
export function getWeaponShakeIntensity(weaponType: string, isHeadshot: boolean): number {
  let baseIntensity = 0

  switch (weaponType) {
    case 'pistol':
      baseIntensity = 0.01 // Increased from 0.002
      break
    case 'rifle':
      baseIntensity = 0.015 // Increased from 0.003
      break
    case 'shotgun':
      baseIntensity = 0.04 // Increased from 0.008
      break
    default:
      baseIntensity = 0.01
  }

  // Increase shake for headshots
  return isHeadshot ? baseIntensity * 2 : baseIntensity
}
