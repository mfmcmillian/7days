/**
 * Animation System for Neural Collapse
 * Handles animation transitions for entities
 */

import { engine, Animator } from '@dcl/sdk/ecs'
import { AnimationState, DyingZombie } from '../components/GameComponents'
import { getGamePhase } from '../core/GameState'

/**
 * Animation System - handles animation transitions
 */
export function animationSystem(dt: number) {
  if (getGamePhase() !== 'playing') return

  for (const [entity, animState] of engine.getEntitiesWith(AnimationState, Animator)) {
    // Skip if entity is dying
    if (DyingZombie.getOrNull(entity)) continue

    if (animState.currentClip) {
      const currentAnim = Animator.getClip(entity, animState.currentClip)

      // If the current animation has finished playing
      if (!currentAnim.playing) {
        // If there's a next clip specified, play it
        if (animState.nextClip) {
          const nextAnim = Animator.getClip(entity, animState.nextClip)
          nextAnim.playing = true
          nextAnim.weight = 1

          // Update animation state
          const mutableState = AnimationState.getMutable(entity)
          mutableState.currentClip = animState.nextClip
          mutableState.nextClip = ''
        } else {
          // If no next clip, default to walk
          const walkAnim = Animator.getClip(entity, 'walk')
          walkAnim.playing = true
          walkAnim.weight = 1

          // Update animation state
          const mutableState = AnimationState.getMutable(entity)
          mutableState.currentClip = 'walk'
          mutableState.nextClip = ''
        }
      }
    }
  }
}
