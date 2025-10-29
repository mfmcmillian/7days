/**
 * Hit Marker Component
 * Center-screen visual feedback for hits
 */

import ReactEcs, { UiEntity } from '@dcl/sdk/react-ecs'
import { Color4 } from '@dcl/sdk/math'
import * as utils from '@dcl-sdk/utils'

interface HitMarkerState {
  visible: boolean
  isHeadshot: boolean
  opacity: number
}

let hitMarkerState: HitMarkerState = {
  visible: false,
  isHeadshot: false,
  opacity: 1.0
}

let fadeTimer: any = null

/**
 * Show hit marker
 */
export function showHitMarker(isHeadshot: boolean) {
  hitMarkerState.visible = true
  hitMarkerState.isHeadshot = isHeadshot
  hitMarkerState.opacity = 1.0
  
  // Clear existing timer
  if (fadeTimer) {
    utils.timers.clearTimeout(fadeTimer)
  }
  
  // Fade out after delay
  fadeTimer = utils.timers.setTimeout(() => {
    hitMarkerState.visible = false
    hitMarkerState.opacity = 1.0
  }, isHeadshot ? 200 : 150) // Headshot marker stays longer
}

/**
 * Hit Marker UI Component
 */
export function HitMarker() {
  if (!hitMarkerState.visible) return null
  
  const color = hitMarkerState.isHeadshot 
    ? Color4.create(1, 0.84, 0, hitMarkerState.opacity) // Gold for headshot
    : Color4.create(1, 1, 1, hitMarkerState.opacity)    // White for body shot
  
  const size = hitMarkerState.isHeadshot ? 30 : 20
  const thickness = hitMarkerState.isHeadshot ? 3 : 2
  
  return (
    <UiEntity
      uiTransform={{
        width: '100%',
        height: '100%',
        positionType: 'absolute',
        position: { top: 0, left: 0 },
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        pointerFilter: 'none'
      }}
      uiBackground={{ color: Color4.create(0, 0, 0, 0) }}
    >
      {/* Horizontal line */}
      <UiEntity
        uiTransform={{
          width: size,
          height: thickness,
          positionType: 'absolute'
        }}
        uiBackground={{ color }}
      />
      
      {/* Vertical line */}
      <UiEntity
        uiTransform={{
          width: thickness,
          height: size,
          positionType: 'absolute'
        }}
        uiBackground={{ color }}
      />
      
      {/* Top-left corner */}
      <UiEntity
        uiTransform={{
          width: size / 3,
          height: thickness,
          positionType: 'absolute',
          position: { top: -size / 2, left: -size / 2 }
        }}
        uiBackground={{ color }}
      />
      <UiEntity
        uiTransform={{
          width: thickness,
          height: size / 3,
          positionType: 'absolute',
          position: { top: -size / 2, left: -size / 2 }
        }}
        uiBackground={{ color }}
      />
      
      {/* Top-right corner */}
      <UiEntity
        uiTransform={{
          width: size / 3,
          height: thickness,
          positionType: 'absolute',
          position: { top: -size / 2, right: -size / 2 }
        }}
        uiBackground={{ color }}
      />
      <UiEntity
        uiTransform={{
          width: thickness,
          height: size / 3,
          positionType: 'absolute',
          position: { top: -size / 2, right: -size / 2 }
        }}
        uiBackground={{ color }}
      />
      
      {/* Bottom-left corner */}
      <UiEntity
        uiTransform={{
          width: size / 3,
          height: thickness,
          positionType: 'absolute',
          position: { bottom: -size / 2, left: -size / 2 }
        }}
        uiBackground={{ color }}
      />
      <UiEntity
        uiTransform={{
          width: thickness,
          height: size / 3,
          positionType: 'absolute',
          position: { bottom: -size / 2, left: -size / 2 }
        }}
        uiBackground={{ color }}
      />
      
      {/* Bottom-right corner */}
      <UiEntity
        uiTransform={{
          width: size / 3,
          height: thickness,
          positionType: 'absolute',
          position: { bottom: -size / 2, right: -size / 2 }
        }}
        uiBackground={{ color }}
      />
      <UiEntity
        uiTransform={{
          width: thickness,
          height: size / 3,
          positionType: 'absolute',
          position: { bottom: -size / 2, right: -size / 2 }
        }}
        uiBackground={{ color }}
      />
    </UiEntity>
  )
}

