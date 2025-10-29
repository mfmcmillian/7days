/**
 * Landscape Setup for Neural Collapse
 * Creates the game world including buildings, walls, floor, and environmental objects
 */

import { Transform, engine, Entity, MeshRenderer, Material, MeshCollider, GltfContainer, Animator } from '@dcl/sdk/ecs'

// Use createOrReplace for all Transform operations to avoid duplicate component errors
import { Quaternion, Vector3, Color4 } from '@dcl/sdk/math'

export class Landscape {
  private bar!: Entity
  private gasStation!: Entity
  private bank!: Entity
  private northWall!: Entity
  private southWall!: Entity
  private eastWall!: Entity
  private westWall!: Entity
  private floor!: Entity
  private bus!: Entity
  private school!: Entity
  private smoke!: Entity
  private prop!: Entity

  constructor() {
    this.createBuildings()
    //this.createBoundaryWalls()
    this.createFloor()
    this.createProps()
  }

  /**
   * Create all buildings in the scene
   */
  private createBuildings() {
    // Bar
    this.bar = engine.addEntity()
    Transform.createOrReplace(this.bar, {
      position: Vector3.create(4.97, 6.55, -16.94),
      scale: Vector3.create(6, 10, 6),
      rotation: Quaternion.fromEulerDegrees(0, 0, 0)
    })
    GltfContainer.create(this.bar, {
      src: 'models/background_building_bar.glb'
    })

    // Gas Station
    this.gasStation = engine.addEntity()
    Transform.createOrReplace(this.gasStation, {
      position: Vector3.create(39.08, 3.55, -0.38),
      scale: Vector3.create(9, 12, 9),
      rotation: Quaternion.fromEulerDegrees(0, 0, 0)
    })
    GltfContainer.create(this.gasStation, {
      src: 'models/gas-station.glb'
    })

    // Bank
    this.bank = engine.addEntity()
    Transform.createOrReplace(this.bank, {
      position: Vector3.create(21.13, 4.75, 18.32),
      scale: Vector3.create(6, 6, 6),
      rotation: Quaternion.fromEulerDegrees(0, 0, 0)
    })
    GltfContainer.create(this.bank, {
      src: 'models/bank.glb'
    })

    // School
    this.school = engine.addEntity()
    Transform.createOrReplace(this.school, {
      position: Vector3.create(-8.8, 4, 14.26),
      scale: Vector3.create(5, 5, 5),
      rotation: Quaternion.fromEulerDegrees(0, 180, 0)
    })
    GltfContainer.create(this.school, {
      src: 'models/school.glb'
    })

    // Smoke effect on school
    this.smoke = engine.addEntity()
    Transform.createOrReplace(this.smoke, {
      position: Vector3.create(-8.8, 9, 14.26),
      scale: Vector3.create(1, 1, 1),
      rotation: Quaternion.fromEulerDegrees(0, 0, 0)
    })
    GltfContainer.create(this.smoke, {
      src: 'models/smoke.glb'
    })
    Animator.create(this.smoke, {
      states: [
        {
          clip: 'SketchUpAction',
          playing: true,
          loop: true
        }
      ]
    })
  }

  /**
   * Create invisible boundary walls
   */
  // private createBoundaryWalls() {
  //   // North wall
  //   this.northWall = this.createWall(Vector3.create(18.27, 5, 31.46), Vector3.create(75, 10, 1))

  //   // South wall
  //   this.southWall = this.createWall(Vector3.create(18.27, 5, -31.4), Vector3.create(75, 10, 1))

  //   // East wall
  //   this.eastWall = this.createWall(Vector3.create(54.5, 5, 0), Vector3.create(1, 10, 62))

  //   // West wall
  //   this.westWall = this.createWall(Vector3.create(-18, 5, 0), Vector3.create(1, 10, 62))
  // }

  /**
   * Create a single invisible wall with collision
   */
  private createWall(position: Vector3, scale: Vector3): Entity {
    const wall = engine.addEntity()
    Transform.createOrReplace(wall, {
      position,
      scale,
      rotation: Quaternion.fromEulerDegrees(0, 0, 0)
    })
    MeshRenderer.create(wall, {
      mesh: { $case: 'box', box: { uvs: [] } }
    })
    Material.setPbrMaterial(wall, {
      albedoColor: Color4.create(1, 1, 1, 0),
      metallic: 0,
      roughness: 1,
      alphaTest: 0.5
    })
    MeshCollider.create(wall, {
      mesh: { $case: 'box', box: {} }
    })
    return wall
  }

  /**
   * Create the floor
   */
  private createFloor() {
    this.floor = engine.addEntity()
    Transform.createOrReplace(this.floor, {
      position: Vector3.create(18.27, 0, 0),
      scale: Vector3.create(50, 1, 50),
      rotation: Quaternion.fromEulerDegrees(0, 0, 0)
    })
    GltfContainer.create(this.floor, {
      src: 'models/flooring.glb'
    })
  }

  /**
   * Create props and decorative objects
   */
  private createProps() {
    // Bus
    // this.bus = engine.addEntity()
    // Transform.createOrReplace(this.bus, {
    //   position: Vector3.create(9.25, 1.9, 3.24),
    //   scale: Vector3.create(5.5, 5.5, 5.5),
    //   rotation: Quaternion.fromEulerDegrees(0, 90, 0)
    // })
    // GltfContainer.create(this.bus, {
    //   src: 'models/bus.glb'
    // })

    // Prop
    this.prop = engine.addEntity()
    Transform.createOrReplace(this.prop, {
      position: Vector3.create(26.48, 1.6, -19.44),
      scale: Vector3.create(2.5, 2.5, 2.5),
      rotation: Quaternion.fromEulerDegrees(0, 0, 0)
    })
    GltfContainer.create(this.prop, {
      src: 'models/prop.glb'
    })
  }
}
