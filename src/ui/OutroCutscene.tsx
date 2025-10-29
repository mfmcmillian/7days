/**
 * Outro Cutscene Component
 * Full-screen ending video after victory → Dialogue screen → Intro cutscene
 */

import ReactEcs, { Label, UiEntity } from '@dcl/sdk/react-ecs'
import { Color4, Color3 } from '@dcl/sdk/math'
import { engine, InputModifier, videoEventsSystem, VideoState } from '@dcl/sdk/ecs'
import { VideoPlayer, Material, MeshRenderer, Transform, MaterialTransparencyMode } from '@dcl/sdk/ecs'
import { Vector3 } from '@dcl/sdk/math'
import * as utils from '@dcl-sdk/utils'

// Track cutscene state
let isPlaying = false
let videoEntity: any = null
let blackBackgroundEntity: any = null
let fadeOverlayEntity: any = null
let videoEnded = false
let showingDialogue = false
let currentDialogueLine = 0
let dialogueStartTime = 0

// Dialogue lines for the ending
const ENDING_DIALOGUE = [
  { speaker: 'HQ', text: 'Delta-1, come in, Delta-1...', duration: 2500 },
  { speaker: 'HQ', text: 'Your next evacuation window is 7 days away.', duration: 3000 },
  { speaker: 'HQ', text: 'Stay alive. Command out.', duration: 2500 }
]

/**
 * Play outro cutscene (fades in from victory screen)
 */
export function playOutroCutscene(onComplete: () => void) {
  if (isPlaying) return
  isPlaying = true
  
  console.log('🎬 Starting outro cutscene with fade-in...')
  
  // STEP 1: Freeze player movement
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
  console.log('🔒 Player frozen for outro')
  
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
  
  // STEP 5: Add video player (OUTRO VIDEO)
  const videoPlayer = VideoPlayer.create(videoEntity, {
    src: 'https://dclstreams.com/media/videos/play/f66d2236-35dd-4634-acd3-c720cff6a2fc.m3u8',
    playing: true,
    volume: 1.0,
    loop: false // Don't loop the outro
  })
  
  // STEP 6: Create video texture
  const videoTexture = Material.Texture.Video({ videoPlayerEntity: videoEntity })
  
  // STEP 7: Apply video material
  Material.setPbrMaterial(videoEntity, {
    texture: videoTexture,
    roughness: 1.0,
    specularIntensity: 0,
    metallic: 0,
    emissiveTexture: videoTexture,
    emissiveIntensity: 0.6,
    emissiveColor: Color3.White()
  })
  console.log('✅ OUTRO VIDEO applied to plane!')
  console.log('🎥 Video URL:', videoPlayer.src)
  
  // STEP 8: Create fade-in overlay (starts fully black)
  fadeOverlayEntity = engine.addEntity()
  Transform.createOrReplace(fadeOverlayEntity, {
    parent: engine.CameraEntity,
    position: Vector3.create(0, 0, 0.4), // In front of video
    scale: Vector3.create(10, 10, 0.01)
  })
  MeshRenderer.setPlane(fadeOverlayEntity)
  Material.setPbrMaterial(fadeOverlayEntity, {
    albedoColor: Color4.create(0, 0, 0, 1), // Start fully black
    roughness: 1.0,
    metallic: 0,
    transparencyMode: MaterialTransparencyMode.MTM_ALPHA_BLEND
  })
  
  // STEP 9: Fade in from black over 1 second
  const fadeStartTime = Date.now()
  const fadeDuration = 1000
  
  const fadeInterval = utils.timers.setInterval(() => {
    const elapsed = Date.now() - fadeStartTime
    const fadeProgress = Math.min(elapsed / fadeDuration, 1)
    
    if (fadeOverlayEntity) {
      Material.setPbrMaterial(fadeOverlayEntity, {
        albedoColor: Color4.create(0, 0, 0, 1 - fadeProgress), // Fade to transparent
        roughness: 1.0,
        metallic: 0,
        transparencyMode: MaterialTransparencyMode.MTM_ALPHA_BLEND
      })
    }
    
    if (fadeProgress >= 1) {
      utils.timers.clearInterval(fadeInterval)
      // Remove fade overlay after fade completes
      if (fadeOverlayEntity) {
        engine.removeEntity(fadeOverlayEntity)
        fadeOverlayEntity = null
        console.log('✅ Fade-in complete')
      }
    }
  }, 16) // ~60fps
  
  // Video event tracking
  videoEventsSystem.registerVideoEventsEntity(videoEntity, (videoEvent) => {
    console.log(`📹 Outro Video: State=${videoEvent.state}, Time=${videoEvent.currentOffset.toFixed(1)}s`)
    
    if (videoEvent.state === VideoState.VS_READY && 
        videoEvent.currentOffset >= videoEvent.videoLength - 1 && 
        !videoEnded) {
      videoEnded = true
      console.log('🎬 Outro video finished! Showing ending dialogue...')
      showEndingDialogue(onComplete)
    }
    
    if (videoEvent.state === VideoState.VS_ERROR) {
      console.error('❌ Outro video error!')
      showEndingDialogue(onComplete)
    }
  })
  
  // Auto-end after 10 seconds (video is 8 seconds)
  utils.timers.setTimeout(() => {
    if (isPlaying && !videoEnded) {
      videoEnded = true
      console.log('⏰ Outro finished (timer)')
      showEndingDialogue(onComplete)
    }
  }, 10000)
}

/**
 * Show ending dialogue screen after video
 */
function showEndingDialogue(onComplete: () => void) {
  if (showingDialogue) return
  showingDialogue = true
  currentDialogueLine = 0
  
  console.log('💬 Showing ending dialogue...')
  
  // Remove video entities first
  if (videoEntity) {
    if (VideoPlayer.has(videoEntity)) {
      try {
        const videoPlayer = VideoPlayer.getMutable(videoEntity)
        videoPlayer.playing = false
      } catch (e) {}
    }
    engine.removeEntity(videoEntity)
    videoEntity = null
  }
  
  if (blackBackgroundEntity) {
    engine.removeEntity(blackBackgroundEntity)
    blackBackgroundEntity = null
  }
  
  // Start dialogue progression
  dialogueStartTime = Date.now()
  progressDialogue(onComplete)
}

/**
 * Progress through dialogue lines
 */
function progressDialogue(onComplete: () => void) {
  if (currentDialogueLine >= ENDING_DIALOGUE.length) {
    // All dialogue shown, wait a moment then go to intro
    console.log('💬 Ending dialogue complete, transitioning to intro...')
    utils.timers.setTimeout(() => {
      cleanupAndGoToIntro(onComplete)
    }, 1000)
    return
  }
  
  const currentLine = ENDING_DIALOGUE[currentDialogueLine]
  console.log(`💬 [${currentLine.speaker}]: ${currentLine.text}`)
  
  // Wait for current line duration, then show next line
  utils.timers.setTimeout(() => {
    currentDialogueLine++
    progressDialogue(onComplete)
  }, currentLine.duration)
}

/**
 * Cleanup and transition to intro cutscene
 */
function cleanupAndGoToIntro(onComplete: () => void) {
  console.log('🧹 Cleaning up outro and going to intro...')
  
  // Remove any remaining entities
  if (fadeOverlayEntity) {
    engine.removeEntity(fadeOverlayEntity)
    fadeOverlayEntity = null
  }
  
  // Unfreeze player
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
  
  utils.timers.setTimeout(() => {
    try {
      InputModifier.deleteFrom(engine.PlayerEntity)
    } catch (e) {}
  }, 100)
  
  isPlaying = false
  videoEnded = false
  showingDialogue = false
  currentDialogueLine = 0
  
  console.log('✅ Outro complete! Going to intro cutscene...')
  
  // Callback - this will trigger intro cutscene
  onComplete()
}


/**
 * Check if outro cutscene is currently playing
 */
export function isOutroCutscenePlaying(): boolean {
  return isPlaying
}

/**
 * Check if showing ending dialogue
 */
export function isShowingEndingDialogue(): boolean {
  return showingDialogue
}

/**
 * Get current dialogue line for display
 */
export function getCurrentDialogueLine() {
  if (!showingDialogue || currentDialogueLine >= ENDING_DIALOGUE.length) {
    return null
  }
  return ENDING_DIALOGUE[currentDialogueLine]
}

/**
 * Outro Cutscene UI Overlay (shows ending dialogue)
 */
export function OutroCutsceneOverlay() {
  if (!isPlaying && !showingDialogue) return null
  
  // Show ending dialogue screen
  if (showingDialogue) {
    const currentLine = getCurrentDialogueLine()
    
    if (!currentLine) return null
    
    // Calculate fade-in opacity for current line
    const timeSinceLineStart = Date.now() - dialogueStartTime
    const fadeInDuration = 300
    const opacity = Math.min(timeSinceLineStart / fadeInDuration, 1)
    
    return (
      <UiEntity
        uiTransform={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: { left: 100, right: 100 }
        }}
        uiBackground={{
          color: Color4.Black() // Full black background
        }}
      >
        {/* Dialogue box */}
        <UiEntity
          uiTransform={{
            width: 800,
            height: 'auto',
            padding: { top: 40, bottom: 40, left: 50, right: 50 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
          uiBackground={{
            color: Color4.create(0.1, 0.1, 0.1, 0.8 * opacity)
          }}
        >
          {/* Speaker name */}
          <Label
            value={currentLine.speaker}
            fontSize={20}
            color={Color4.create(1, 0.8, 0, opacity)} // Gold color
            textAlign="middle-center"
            uiTransform={{
              margin: { bottom: 20 }
            }}
          />
          
          {/* Dialogue text */}
          <Label
            value={currentLine.text}
            fontSize={24}
            color={Color4.create(1, 1, 1, opacity)}
            textAlign="middle-center"
          />
        </UiEntity>
      </UiEntity>
    )
  }
  
  // During video, show nothing (just video plays)
  return null
}

