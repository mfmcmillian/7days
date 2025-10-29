/**
 * Side-View Static Camera System
 * Locks camera to a fixed side-scrolling view like Last War Survival
 * VirtualCamera overrides ALL default controls (zoom, pan, rotation)
 */

import { engine, Transform, VirtualCamera, MainCamera, Entity } from '@dcl/sdk/ecs'
import { Vector3, Quaternion } from '@dcl/sdk/math'

let sideViewCamera: Entity | null = null

/**
 * Setup static side-view camera lock for side-scrolling gameplay
 * Camera positioned to the side of the play area to show avatar and zombies
 * Tekken-style side view so player can see their zombie avatar
 */
export function setupSideViewCamera(): void {
  console.log('📹 Setting up side-scrolling camera lock...')

  // Create static camera positioned to show the lane from the side
  // Camera from LEFT side looking RIGHT, pulled back for wider view
  sideViewCamera = engine.addEntity()
  Transform.create(sideViewCamera, {
    position: Vector3.create(-28, 12.5, 0), // Further left for wider view
    rotation: Quaternion.fromEulerDegrees(33, 90, 0) // Look right (toward +X), slight downward tilt
  })

  VirtualCamera.create(sideViewCamera, {
    defaultTransition: { transitionMode: VirtualCamera.Transition.Time(0) } // Instant lock, no fade
  })

  // Assign to MainCamera - this completely locks the view
  MainCamera.createOrReplace(engine.CameraEntity, {
    virtualCameraEntity: sideViewCamera
  })

  console.log('✅ Side-view camera locked')
  console.log('   → Position: (0, 2.5, 8) - left side view')
  console.log('   → Looking at lane (X: 4-12, Z: 8)')
  console.log('   → Your zombie avatar should be visible!')
  console.log('   → Zombies spawn from the back (high Z) and advance forward')
}

/**
 * Restore default camera (unlock) - for testing or returning to normal mode
 */
export function restoreFreeCamera(): void {
  console.log('🔓 Unlocking camera...')

  // Unset VirtualCamera to restore default controls
  const mainCam = MainCamera.getMutableOrNull(engine.CameraEntity)
  if (mainCam) {
    mainCam.virtualCameraEntity = undefined
  }

  // Cleanup camera entity
  if (sideViewCamera) {
    engine.removeEntity(sideViewCamera)
    sideViewCamera = null
  }

  console.log('✅ Camera unlocked (default controls restored)')
}

/**
 * Adjust camera position dynamically (for fine-tuning during gameplay)
 */
export function adjustCameraPosition(position: Vector3, tilt: number = -10): void {
  if (!sideViewCamera) {
    console.log('⚠️ Side-view camera not initialized')
    return
  }

  const transform = Transform.getMutableOrNull(sideViewCamera)
  if (transform) {
    transform.position = position
    transform.rotation = Quaternion.fromEulerDegrees(tilt, 0, 0)
    console.log(`📹 Camera adjusted to:`, position, `tilt: ${tilt}°`)
  }
}
