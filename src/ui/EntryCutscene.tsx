/**
 * Entry Cutscene Component
 * "Loading screen" video before game starts
 * Plays after dialogue sequence completes
 */

import ReactEcs, { Label, UiEntity } from '@dcl/sdk/react-ecs'
import { Color4, Color3, Vector3 } from '@dcl/sdk/math'
import { engine, VideoPlayer, Material, MeshRenderer, Transform, MaterialTransparencyMode } from '@dcl/sdk/ecs'
import * as utils from '@dcl-sdk/utils'

// Track cutscene state
let isPlaying = false
let isFading = false
let fadeStartTime = 0
let videoEntity: any = null
let blackBackgroundEntity: any = null
let fadeOverlayEntity: any = null
let isFadingIn = false
let fadeInStartTime = 0

/**
 * Play entry cutscene (loading screen)
 */
export function playEntryCutscene(onComplete: () => void) {
  if (isPlaying) return
  isPlaying = true
  
  console.log('🎬 Starting entry cutscene (loading screen)...')
  
  // Calculate screen size
  const screenDistance = 0.5
  const hfovRad = Math.PI / 2
  const optimalWidth = 2 * screenDistance * Math.tan(hfovRad / 2)
  const optimalHeight = optimalWidth * (9 / 16)
  
  // Black background (parented to player camera)
  blackBackgroundEntity = engine.addEntity()
  Transform.createOrReplace(blackBackgroundEntity, {
    parent: engine.CameraEntity,
    position: Vector3.create(0, 0, screenDistance + 0.1),
    scale: Vector3.create(10, 10, 0.01)
  })
  MeshRenderer.setPlane(blackBackgroundEntity)
  Material.setPbrMaterial(blackBackgroundEntity, {
    albedoColor: Color4.Black(),
    roughness: 1.0,
    metallic: 0,
    transparencyMode: MaterialTransparencyMode.MTM_OPAQUE
  })
  
  // Video screen (parented to player camera)
  videoEntity = engine.addEntity()
  Transform.createOrReplace(videoEntity, {
    parent: engine.CameraEntity,
    position: Vector3.create(0, 0, screenDistance),
    scale: Vector3.create(optimalWidth, optimalHeight, 0.1)
  })
  console.log(`📺 Entry video screen: ${optimalWidth.toFixed(2)}x${optimalHeight.toFixed(2)}`)
  
  // Add plane mesh for video display
  MeshRenderer.setPlane(videoEntity)
  
  // Add video player
  VideoPlayer.create(videoEntity, {
    src: 'https://dclstreams.com/media/videos/play/e9caacfe-b3b0-43bd-a097-6186bc7d2cf5.m3u8',
    playing: true,
    volume: 1.0,
    loop: false // Don't loop, play once
  })
  
  // Create video texture
  const videoTexture = Material.Texture.Video({ videoPlayerEntity: videoEntity })
  
  // Apply video material
  Material.setPbrMaterial(videoEntity, {
    texture: videoTexture,
    roughness: 1.0,
    specularIntensity: 0,
    metallic: 0,
    emissiveTexture: videoTexture,
    emissiveIntensity: 0.6,
    emissiveColor: Color3.White()
  })
  console.log('✅ Entry video loaded and playing!')
  
  // Start fade-out at 7 seconds (3 seconds before end for smoother transition)
  utils.timers.setTimeout(() => {
    console.log('🌅 Starting fade-out...')
    startFadeOut()
  }, 7000) // Start fade at 7 seconds
  
  // Complete cutscene after fade finishes (10 seconds total)
  utils.timers.setTimeout(() => {
    console.log('🎬 Entry cutscene complete')
    endEntryCutscene(onComplete)
  }, 10000) // 10 seconds total
}

/**
 * Start fade-out effect
 */
function startFadeOut() {
  if (isFading) return
  isFading = true
  fadeStartTime = Date.now()
  
  // Create black overlay for fade effect (in front of video)
  fadeOverlayEntity = engine.addEntity()
  Transform.createOrReplace(fadeOverlayEntity, {
    parent: engine.CameraEntity,
    position: Vector3.create(0, 0, 0.45), // Just in front of video
    scale: Vector3.create(10, 10, 0.01)
  })
  MeshRenderer.setPlane(fadeOverlayEntity)
  Material.setPbrMaterial(fadeOverlayEntity, {
    albedoColor: Color4.create(0, 0, 0, 0), // Start transparent
    roughness: 1.0,
    metallic: 0,
    transparencyMode: MaterialTransparencyMode.MTM_ALPHA_BLEND
  })
  
  console.log('🌑 Fade overlay created')
}

/**
 * Update fade effect (called every frame)
 */
export function updateEntryCutsceneFade() {
  if (!fadeOverlayEntity) return
  
  // Handle fade-out during cutscene
  if (isFading) {
    const fadeDuration = 3000 // 3 seconds for smoother fade-out
    const elapsed = Date.now() - fadeStartTime
    const fadeProgress = Math.min(elapsed / fadeDuration, 1.0)
    
    // Smooth easing function (ease-in-out)
    const smoothProgress = fadeProgress < 0.5
      ? 2 * fadeProgress * fadeProgress
      : 1 - Math.pow(-2 * fadeProgress + 2, 2) / 2
    
    // Update overlay opacity
    const material = Material.getMutableOrNull(fadeOverlayEntity)
    if (material && material.material?.$case === 'pbr') {
      material.material.pbr.albedoColor = Color4.create(0, 0, 0, smoothProgress)
    }
  }
  
  // Handle fade-in when game starts
  if (isFadingIn) {
    const fadeInDuration = 2000 // 2 seconds fade-in to game
    const elapsed = Date.now() - fadeInStartTime
    const fadeProgress = Math.min(elapsed / fadeInDuration, 1.0)
    
    // Smooth easing function (ease-out)
    const smoothProgress = 1 - Math.pow(1 - fadeProgress, 3)
    
    // Fade from black to transparent
    const material = Material.getMutableOrNull(fadeOverlayEntity)
    if (material && material.material?.$case === 'pbr') {
      material.material.pbr.albedoColor = Color4.create(0, 0, 0, 1.0 - smoothProgress)
    }
    
    // Remove overlay when fade-in complete
    if (fadeProgress >= 1.0) {
      engine.removeEntity(fadeOverlayEntity)
      fadeOverlayEntity = null
      isFadingIn = false
      console.log('🌑 Fade-in complete, overlay removed')
    }
  }
}

/**
 * End entry cutscene and cleanup
 */
function endEntryCutscene(onComplete: () => void) {
  if (!isPlaying) return
  
  console.log('🧹 Cleaning up entry cutscene...')
  
  // Stop video playback
  if (videoEntity && VideoPlayer.has(videoEntity)) {
    try {
      const videoPlayer = VideoPlayer.getMutable(videoEntity)
      videoPlayer.playing = false
      console.log('📹 Entry video stopped')
    } catch (e) {
      console.error('⚠️ Failed to stop entry video:', e)
    }
  }
  
  // Remove video entity
  if (videoEntity) {
    engine.removeEntity(videoEntity)
    videoEntity = null
    console.log('📺 Entry video screen removed')
  }
  
  // Remove black background
  if (blackBackgroundEntity) {
    engine.removeEntity(blackBackgroundEntity)
    blackBackgroundEntity = null
    console.log('🎥 Black background removed')
  }
  
  // Start fade-in to game (keep overlay and fade it out gradually)
  if (fadeOverlayEntity) {
    isFading = false
    isFadingIn = true
    fadeInStartTime = Date.now()
    console.log('🌅 Starting fade-in to game...')
  }
  
  isPlaying = false
  
  console.log('✅ Entry cutscene cleanup complete!')
  
  // Start the game
  onComplete()
}

/**
 * Check if entry cutscene is currently playing
 */
export function isEntryCutscenePlaying(): boolean {
  return isPlaying
}

/**
 * Reset all fade state
 */
function resetFadeState() {
  isFading = false
  isFadingIn = false
  fadeStartTime = 0
  fadeInStartTime = 0
  if (fadeOverlayEntity) {
    engine.removeEntity(fadeOverlayEntity)
    fadeOverlayEntity = null
  }
}

/**
 * Force cleanup (if needed)
 */
export function forceCleanupEntryCutscene(onComplete: () => void) {
  if (!isPlaying) {
    onComplete()
    return
  }
  console.log('🧹 Force cleaning up entry cutscene...')
  resetFadeState()
  endEntryCutscene(onComplete)
}

/**
 * Entry Cutscene Overlay UI
 * Shows "ENTERING FRAGMENT" text over video
 */
export function EntryCutsceneOverlay() {
  if (!isPlaying) return null
  
  return (
    <UiEntity
      uiTransform={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        alignItems: 'center'
      }}
      uiBackground={{
        color: Color4.create(0, 0, 0, 0) // Transparent
      }}
    >
      {/* Loading text at bottom */}
      <UiEntity
        uiTransform={{
          width: '100%',
          height: 100,
          margin: { bottom: 50 },
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <Label
          value="ENTERING THE BARRICADE..."
          fontSize={28}
          color={Color4.White()}
          textAlign="middle-center"
        />
      </UiEntity>
    </UiEntity>
  )
}

