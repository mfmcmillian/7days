/**
 * Intro Cutscene Component
 * Full-screen opening video with frozen player controls
 */

import ReactEcs, { Label, UiEntity } from '@dcl/sdk/react-ecs'
import { Color4, Color3 } from '@dcl/sdk/math'
import { engine, InputModifier, videoEventsSystem, VideoState } from '@dcl/sdk/ecs'
import { VideoPlayer, Material, MeshRenderer, Transform, MaterialTransparencyMode } from '@dcl/sdk/ecs'
import { Vector3 } from '@dcl/sdk/math'
import * as utils from '@dcl-sdk/utils'
import { GAME_NAME } from '../utils/constants'

// Track cutscene state
let isPlaying = false
let videoEntity: any = null
let blackBackgroundEntity: any = null
let fadeOverlayEntity: any = null
let canSkip = false
let videoEnded = false // Track if video finished naturally (vs skipped)

/**
 * Play intro cutscene
 * Simple approach: Parent video to player camera + freeze input
 */
export function playIntroCutscene(onComplete: () => void) {
  if (isPlaying) return
  isPlaying = true
  
  console.log('🎬 Starting intro cutscene (SIMPLE - no custom camera)...')
  
  // STEP 1: Freeze WASD movement only (allow E key for starting!)
  InputModifier.createOrReplace(engine.PlayerEntity, {
    mode: {
      $case: 'standard',
      standard: {
        disableWalk: true,
        disableRun: true,
        disableJog: true,
        disableJump: true
      }
    }
  })
  console.log('🔒 Player frozen (WASD disabled, E key still works)')
  
  // STEP 2: Calculate screen size
  const screenDistance = 0.5
  const hfovRad = Math.PI / 2
  const optimalWidth = 2 * screenDistance * Math.tan(hfovRad / 2)
  const optimalHeight = optimalWidth * (9 / 16)
  
  // STEP 3: Black background (parented to player camera)
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
  
  // STEP 4: Video screen (parented to player camera)
  videoEntity = engine.addEntity()
  Transform.createOrReplace(videoEntity, {
    parent: engine.CameraEntity,
    position: Vector3.create(0, 0, screenDistance),
    scale: Vector3.create(optimalWidth, optimalHeight, 0.1)
  })
  console.log(`📺 Video screen: ${optimalWidth.toFixed(2)}x${optimalHeight.toFixed(2)} at Z=${screenDistance}`)
  
  // Add plane mesh for video display
  MeshRenderer.setPlane(videoEntity)
  
  // STEP 3: Add video player
  const videoPlayer = VideoPlayer.create(videoEntity, {
    src: 'https://dclstreams.com/media/videos/play/f50cba36-04c0-49fa-bbc1-07b2aed92944.m3u8',
    playing: true,
    volume: 1.0,
    loop: true
  })
  
  // STEP 4: Create video texture
  const videoTexture = Material.Texture.Video({ videoPlayerEntity: videoEntity })
  
  // STEP 5: Apply video material
  Material.setPbrMaterial(videoEntity, {
    texture: videoTexture,
    roughness: 1.0,
    specularIntensity: 0,
    metallic: 0,
    emissiveTexture: videoTexture,
    emissiveIntensity: 0.6,
    emissiveColor: Color3.White()
  })
  console.log('✅ VIDEO applied to plane!')
  console.log('🎥 Video URL:', videoPlayer.src)
  
  // Video event tracking
  videoEventsSystem.registerVideoEventsEntity(videoEntity, (videoEvent) => {
    console.log(`📹 Video: State=${videoEvent.state}, Time=${videoEvent.currentOffset.toFixed(1)}s`)
    
    if (videoEvent.state === VideoState.VS_READY && 
        videoEvent.currentOffset >= videoEvent.videoLength - 1 && 
        !videoEnded) {
      videoEnded = true
      console.log('🎬 Video finished!')
    }
    
    if (videoEvent.state === VideoState.VS_ERROR) {
      console.error('❌ Video error!')
      endCutscene(onComplete)
    }
  })
  
  // Show button immediately (after 0.5s for video to buffer)
  utils.timers.setTimeout(() => {
    canSkip = true
    console.log('✅ Play button enabled')
  }, 500)
  
  // Fallback: Auto-skip after 30 seconds (video is 20s, allow extra time)
  utils.timers.setTimeout(() => {
    if (isPlaying && !videoEnded) {
      videoEnded = true
      console.log('⏰ Video finished (timer)')
    }
  }, 30000)
}

/**
 * End cutscene and cleanup (production-grade cleanup per senior dev)
 */
function endCutscene(onComplete: () => void) {
  if (!isPlaying) return
  
  console.log('🎬 Ending intro cutscene with fade transition...')
  
  // STEP 0: Create fade-to-black overlay
  fadeOverlayEntity = engine.addEntity()
  Transform.createOrReplace(fadeOverlayEntity, {
    parent: engine.CameraEntity,
    position: Vector3.create(0, 0, 0.4), // In front of video
    scale: Vector3.create(10, 10, 0.01)
  })
  MeshRenderer.setPlane(fadeOverlayEntity)
  Material.setPbrMaterial(fadeOverlayEntity, {
    albedoColor: Color4.create(0, 0, 0, 0), // Start transparent
    roughness: 1.0,
    metallic: 0,
    transparencyMode: MaterialTransparencyMode.MTM_ALPHA_BLEND
  })
  
  // Fade to black over 0.5 seconds
  const fadeStartTime = Date.now()
  const fadeDuration = 500
  
  const fadeInterval = utils.timers.setInterval(() => {
    const elapsed = Date.now() - fadeStartTime
    const fadeProgress = Math.min(elapsed / fadeDuration, 1)
    
    if (fadeOverlayEntity) {
      Material.setPbrMaterial(fadeOverlayEntity, {
        albedoColor: Color4.create(0, 0, 0, fadeProgress),
        roughness: 1.0,
        metallic: 0,
        transparencyMode: MaterialTransparencyMode.MTM_ALPHA_BLEND
      })
    }
    
    if (fadeProgress >= 1) {
      utils.timers.clearInterval(fadeInterval)
      // Continue with cleanup after fade completes
      cleanupCutscene(onComplete)
    }
  }, 16) // ~60fps
}

/**
 * Cleanup cutscene entities
 */
function cleanupCutscene(onComplete: () => void) {
  console.log('🧹 Cleaning up cutscene...')
  
  // STEP 1: Stop video playback
  if (videoEntity && VideoPlayer.has(videoEntity)) {
    try {
      const videoPlayer = VideoPlayer.getMutable(videoEntity)
      videoPlayer.playing = false
      console.log('📹 Video playback stopped')
    } catch (e) {
      console.error('⚠️ Failed to stop video:', e)
    }
  }
  
  // STEP 2: Remove video entity
  if (videoEntity) {
    engine.removeEntity(videoEntity)
    videoEntity = null
    console.log('📺 Video screen removed')
  }
  
  // STEP 3: Remove black background
  if (blackBackgroundEntity) {
    engine.removeEntity(blackBackgroundEntity)
    blackBackgroundEntity = null
    console.log('🎥 Black background removed')
  }
  
  // STEP 4: Fade out the black overlay after game starts (fade from black)
  if (fadeOverlayEntity) {
    utils.timers.setTimeout(() => {
      const fadeOutStart = Date.now()
      const fadeOutDuration = 1000 // Fade in 1 second
      
      const fadeOutInterval = utils.timers.setInterval(() => {
        const elapsed = Date.now() - fadeOutStart
        const fadeProgress = Math.min(elapsed / fadeOutDuration, 1)
        
        if (fadeOverlayEntity) {
          Material.setPbrMaterial(fadeOverlayEntity, {
            albedoColor: Color4.create(0, 0, 0, 1 - fadeProgress), // Fade to transparent
            roughness: 1.0,
            metallic: 0,
            transparencyMode: MaterialTransparencyMode.MTM_ALPHA_BLEND
          })
        }
        
        if (fadeProgress >= 1) {
          utils.timers.clearInterval(fadeOutInterval)
          if (fadeOverlayEntity) {
            engine.removeEntity(fadeOverlayEntity)
            fadeOverlayEntity = null
            console.log('✅ Fade overlay removed')
          }
        }
      }, 16)
    }, 100) // Start fade-in after 100ms
  }
  
  // STEP 5: Unfreeze player - REPLACE with enabled state (don't just delete)
  console.log('Cutscene ending - ENABLING movement...')
  
  // Replace InputModifier with all enabled (opposite of freeze)
  InputModifier.createOrReplace(engine.PlayerEntity, {
    mode: {
      $case: 'standard',
      standard: {
        disableWalk: false,
        disableRun: false,
        disableJog: false,
        disableJump: false
      }
    }
  })
  console.log('✅ InputModifier replaced with ENABLED state')
  
  // Then delete it completely after a frame
  utils.timers.setTimeout(() => {
    try {
      InputModifier.deleteFrom(engine.PlayerEntity)
      console.log('✅ InputModifier deleted completely')
    } catch (e) {
      console.log('Already deleted')
    }
  }, 100)
  
  isPlaying = false
  canSkip = false
  videoEnded = false
  
  console.log('✅ Cutscene cleanup complete!')
  
  // Callback to continue game
  onComplete()
}

/**
 * Skip cutscene (called by UI button)
 */
export function skipCutscene(onComplete: () => void) {
  if (!canSkip) return
  console.log('⏭️ Skipping cutscene...')
  endCutscene(onComplete)
}

/**
 * Handle PLAY button click (when video ends naturally)
 */
export function handlePlayButton(onComplete: () => void) {
  if (!videoEnded) return
  console.log('▶️ PLAY button clicked from cutscene!')
  endCutscene(onComplete)
}

/**
 * Check if cutscene is currently playing
 */
export function isCutscenePlaying(): boolean {
  return isPlaying
}

/**
 * Check if cutscene can be skipped
 */
export function canSkipCutscene(): boolean {
  return canSkip
}

/**
 * Force cleanup cutscene with fade (for external calls like E key press)
 */
export function forceCleanupCutscene(onComplete: () => void) {
  if (!isPlaying) {
    onComplete()
    return
  }
  console.log('🧹 Force cleaning up cutscene with fade...')
  endCutscene(onComplete)
}

/**
 * Title Screen UI Overlay (shows immediately with styled title and button)
 */
export function CutsceneOverlay({ onSkip, onPlay }: { onSkip: () => void, onPlay: () => void }) {
  if (!isPlaying) return null
  
  return (
    <UiEntity
      uiTransform={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}
      uiBackground={{
        color: Color4.create(0, 0, 0, 0) // Transparent
      }}
    >
      {/* Title - Clean and centered */}
      <UiEntity
        uiTransform={{
          width: '100%',
          height: 150,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          margin: { bottom: 80 }
        }}
      >
        <Label
          value={GAME_NAME.toUpperCase()}
          fontSize={64}
          color={Color4.White()}
          textAlign="middle-center"
        />
      </UiEntity>

      {/* PLAY Button - Simple and clean */}
      <UiEntity
        uiTransform={{
          width: 350,
          height: 80,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
        uiBackground={{ 
          color: Color4.create(0.1, 0.1, 0.1, 0.8)
        }}
        onMouseDown={onPlay}
      >
        <Label
          value="PRESS E TO START"
          fontSize={24}
          color={Color4.White()}
          textAlign="middle-center"
        />
      </UiEntity>
      
      {/* Loading hint (only at start) */}
      {!canSkip && !videoEnded && (
        <Label
          value="Loading..."
          fontSize={14}
          color={Color4.create(1, 1, 1, 0.5)}
          textAlign="middle-right"
          uiTransform={{
            margin: { bottom: 20, right: 20 }
          }}
        />
      )}
    </UiEntity>
  )
}
