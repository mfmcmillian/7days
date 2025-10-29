/**
 * Fighter Movement System
 * Camera from LEFT looking RIGHT, so zombie moves on Z-axis for left/right on screen
 */

import { engine, Transform, inputSystem, InputAction, Animator } from '@dcl/sdk/ecs'
import { Vector3, Quaternion } from '@dcl/sdk/math'
import { PlayerFighter } from './PlayerFighterSystem'

const MOVEMENT_SPEED = 4.0
const MOVEMENT_BOUNDS_Z_MIN = -8 // Right side on screen (D key, decrease Z) - shifted right
const MOVEMENT_BOUNDS_Z_MAX = 6 // Left side on screen (A key, increase Z) - shifted right

let movementSystemActive = false

export function enableFighterMovement(): void {
  if (movementSystemActive) return

  console.log('🎮 Enabling fighter movement (A/D = left/right on screen)')
  engine.addSystem(fighterMovementSystem)
  movementSystemActive = true
}

export function disableFighterMovement(): void {
  movementSystemActive = false
}

/**
 * Fighter movement - A/D moves on Z-axis (left/right on screen from side view)
 */
export function fighterMovementSystem(dt: number): void {
  if (!movementSystemActive) return

  for (const [entity, fighter] of engine.getEntitiesWith(PlayerFighter, Transform)) {
    const mutableTransform = Transform.getMutable(entity)
    const mutableFighter = PlayerFighter.getMutable(entity)

    // A/D keys control Z-axis (appears as left/right from side camera)
    let moveZ = 0
    if (inputSystem.isPressed(InputAction.IA_LEFT)) moveZ += 1 // A = left (increase Z)
    if (inputSystem.isPressed(InputAction.IA_RIGHT)) moveZ -= 1 // D = right (decrease Z)

    if (moveZ !== 0) {
      // Move on Z-axis only
      let newZ = mutableTransform.position.z + moveZ * MOVEMENT_SPEED * dt
      newZ = Math.max(MOVEMENT_BOUNDS_Z_MIN, Math.min(MOVEMENT_BOUNDS_Z_MAX, newZ))

      // Set position: X=16 (pushed further back from camera), Y=0, Z moves
      mutableTransform.position = Vector3.create(-20, 0, newZ)

      // Play walk animation
      const animator = Animator.getMutableOrNull(entity)
      if (animator) {
        for (const state of animator.states) {
          state.playing = state.clip === 'walk'
        }
      }
      mutableFighter.isMoving = true
    } else {
      // Play idle
      const animator = Animator.getMutableOrNull(entity)
      if (animator) {
        for (const state of animator.states) {
          state.playing = state.clip === 'idle'
        }
      }
      mutableFighter.isMoving = false
    }

    // Keep facing right (90°)
    mutableTransform.rotation = Quaternion.fromEulerDegrees(0, 90, 0)
  }
}
