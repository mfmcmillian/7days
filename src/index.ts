/**
 * Friendships World
 * A new Decentraland game. Starting point: one zombie standing in the scene.
 */

import { engine, Transform, GltfContainer, Animator, MeshRenderer, MeshCollider, Material } from '@dcl/sdk/ecs'
import { Vector3, Quaternion, Color4 } from '@dcl/sdk/math'

const SCENE_CENTER = Vector3.create(16, 0, 16)

export function main() {
  createGround()
  createStandingZombie()
}

function createGround() {
  const ground = engine.addEntity()

  Transform.create(ground, {
    position: SCENE_CENTER,
    scale: Vector3.create(32, 0.1, 32)
  })

  MeshRenderer.setBox(ground)
  MeshCollider.setBox(ground)
  Material.setPbrMaterial(ground, {
    albedoColor: Color4.create(0.16, 0.2, 0.14, 1),
    roughness: 1,
    metallic: 0
  })
}

function createStandingZombie() {
  const zombie = engine.addEntity()

  Transform.create(zombie, {
    position: SCENE_CENTER,
    rotation: Quaternion.fromEulerDegrees(0, 180, 0),
    scale: Vector3.create(1, 1, 1)
  })

  GltfContainer.create(zombie, {
    src: 'models/zombie.glb'
  })

  Animator.create(zombie, {
    states: [{ clip: 'idle', playing: true, loop: true }]
  })
}
