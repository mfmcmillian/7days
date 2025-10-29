/**
 * Side-Scrolling Movement System
 * Moves player avatar left/right only (X-axis) like Last War Survival
 * Avatar stays on a fixed Z lane, moves horizontally with WASD
 */

import { engine, Transform, inputSystem, InputAction } from '@dcl/sdk/ecs'
import { Vector3, Quaternion } from '@dcl/sdk/math'

// Movement constants - constrained to camera view
const MOVE_SPEED = 4.0 // Units per second for left/right movement
const MOVEMENT_LANE_Z = 8 // Fixed Z position (depth in lane)
const MOVEMENT_LANE_Y = 0 // Fixed Y position (ground level)
const MOVEMENT_BOUNDS_X = { min: 4, max: 12 } // Tighter bounds to stay in view (Tekken-style)

let sideScrollEnabled = false

/**
 * Enable side-scrolling movement (left/right only)
 * Locks player avatar to horizontal movement in the lane
 */
export function enableSideScrollMovement(): void {
  if (sideScrollEnabled) return

  console.log('🎮 Enabling side-scroll avatar movement...')
  engine.addSystem(sideScrollMovementSystem)
  sideScrollEnabled = true
  console.log('✅ Movement bounds: X[4 to 12], Z=8 (locked)')
  console.log('✅ Use WASD to move left/right')
}

/**
 * Disable side-scrolling movement
 */
export function disableSideScrollMovement(): void {
  if (!sideScrollEnabled) return
  sideScrollEnabled = false
}

/**
 * Side-scroll movement system
 * Reads input every frame and moves player avatar left/right only
 * FORCES position lock EVERY frame to prevent any drifting/glitching
 */
export function sideScrollMovementSystem(dt: number): void {
  if (!sideScrollEnabled) return

  const playerTransform = Transform.getMutableOrNull(engine.PlayerEntity)
  if (!playerTransform) return

  // Read input every frame using inputSystem.isPressed()
  let moveX = 0

  // A/D for horizontal movement
  if (inputSystem.isPressed(InputAction.IA_RIGHT)) moveX += 1 // D key
  if (inputSystem.isPressed(InputAction.IA_LEFT)) moveX -= 1 // A key

  // Also map W/S to horizontal movement for easier control
  if (inputSystem.isPressed(InputAction.IA_FORWARD)) moveX += 1 // W = right
  if (inputSystem.isPressed(InputAction.IA_BACKWARD)) moveX -= 1 // S = left

  // Calculate new X position based on input
  let currentX = playerTransform.position.x

  if (moveX !== 0) {
    const velocity = moveX * MOVE_SPEED * dt
    currentX = currentX + velocity
  }

  // ALWAYS constrain to bounds (prevents glitching outside)
  currentX = Math.max(MOVEMENT_BOUNDS_X.min, Math.min(MOVEMENT_BOUNDS_X.max, currentX))

  // FORCE position lock EVERY FRAME - this is critical!
  // This prevents ANY drift on Y or Z axis and keeps X in bounds
  playerTransform.position = Vector3.create(
    currentX, // Controlled X (left/right)
    MOVEMENT_LANE_Y, // LOCKED Y (ground level)
    MOVEMENT_LANE_Z // LOCKED Z (lane depth)
  )

  // Keep avatar facing forward (toward camera/zombies) EVERY frame
  playerTransform.rotation = Quaternion.fromEulerDegrees(0, 180, 0)
}

/**
 * Get movement status
 */
export function isMovementLocked(): boolean {
  return sideScrollEnabled
}

/**
 * Get current lane position
 */
export function getLanePosition(): Vector3 {
  return Vector3.create(0, MOVEMENT_LANE_Y, MOVEMENT_LANE_Z)
}
