import { engine, Transform, VirtualCamera, MainCamera } from '@dcl/sdk/ecs'
import { Vector3, Quaternion } from '@dcl/sdk/math'
import { playerEntity } from '../core/GameState'

// Camera configuration
const CAMERA_HEIGHT = 12 // Height above player (world Y)
const BACK_OFFSET = 5 // Distance behind player (along player's backward direction)
const LERP_SPEED = 10 // Lerp speed multiplier (higher = faster following)

// Create a dedicated camera entity for the virtual camera
const cameraEntity = engine.addEntity()
Transform.create(cameraEntity, {
  position: Vector3.create(0, CAMERA_HEIGHT, BACK_OFFSET) // Initial position
})
VirtualCamera.create(cameraEntity, {})

// Assign the virtual camera to the main camera entity
// This overrides default camera behavior, locking it to top-down and preventing first-person switching or mouse drag overrides
MainCamera.createOrReplace(engine.CameraEntity, {
  virtualCameraEntity: cameraEntity
})

/**
 * Rotates a vector by a quaternion (assuming unit quaternion).
 * @param vec - The vector to rotate.
 * @param quat - The quaternion to rotate by.
 * @returns The rotated vector.
 */
function rotateVector3(vec: Vector3, quat: Quaternion): Vector3 {
  const x = vec.x,
    y = vec.y,
    z = vec.z
  const ux = quat.x,
    uy = quat.y,
    uz = quat.z,
    uw = quat.w

  // t = 2 * cross(u, v)
  const tx = 2 * (uy * z - uz * y)
  const ty = 2 * (uz * x - ux * z)
  const tz = 2 * (ux * y - uy * x)

  // cross(u, t)
  const crossTx = uy * tz - uz * ty
  const crossTy = uz * tx - ux * tz
  const crossTz = ux * ty - uy * tx

  return Vector3.create(x + uw * tx + crossTx, y + uw * ty + crossTy, z + uw * tz + crossTz)
}

/**
 * Top-down camera system.
 * Updates camera position and rotation to follow the player from above and behind.
 * @param dt - Delta time in seconds.
 */
export function topDownCameraSystem(dt: number) {
  const playerTransform = Transform.getOrNull(playerEntity)
  if (!playerTransform) return

  const playerPos = playerTransform.position
  const playerRot = playerTransform.rotation

  // Get or create camera transform (now on the virtual camera entity)
  const cameraTransform = Transform.getMutable(cameraEntity)

  // Compute target position: above (world up) and behind (player's backward)
  const localBackward = Vector3.create(0, 0, -1) // Unit vector backward in local space
  const worldBackwardDir = rotateVector3(localBackward, playerRot)
  const worldBackward = Vector3.scale(worldBackwardDir, BACK_OFFSET)

  const worldUp = Vector3.scale(Vector3.create(0, 1, 0), CAMERA_HEIGHT)

  const targetPosition = Vector3.add(playerPos, Vector3.add(worldUp, worldBackward))

  // Smoothly lerp position
  const smoothFactor = LERP_SPEED * dt
  cameraTransform.position = Vector3.lerp(cameraTransform.position, targetPosition, Math.min(smoothFactor, 1))

  // Compute target rotation: look at player from camera position
  const directionToPlayer = Vector3.normalize(Vector3.subtract(playerPos, targetPosition))
  const targetRotation = Quaternion.lookRotation(
    directionToPlayer,
    Vector3.create(0, 1, 0) // World up
  )

  // Smoothly slerp rotation
  cameraTransform.rotation = Quaternion.slerp(cameraTransform.rotation, targetRotation, Math.min(smoothFactor, 1))
}
