import { engine } from '@dcl/sdk/ecs'
import { DialogueLine, OUTRO_DIALOGUE, WAVE_DIALOGUES } from '../config/dialogue'
import { playSfx } from '../core/audio'
import { dialogueFinished } from '../core/game'
import { onConfirm } from '../core/input'
import { state } from '../core/state'

let index = 0
let elapsed = 0
let wasDialogue = false
let finished = false

export function currentLines(): DialogueLine[] {
  if (state.dialogueFor === 'outro') return OUTRO_DIALOGUE
  return WAVE_DIALOGUES[state.dialogueFor] ?? []
}

export function currentIndex(): number {
  return index
}

export function lineProgress(): number {
  const line = currentLines()[index]
  if (!line) return 0
  return Math.min(1, (elapsed * 1000) / line.duration)
}

export function advanceDialogue(): void {
  if (state.phase !== 'dialogue' || finished) return
  const lines = currentLines()
  if (index >= lines.length - 1) {
    finished = true
    dialogueFinished()
    return
  }
  index++
  elapsed = 0
  playSfx('tink', 0.35)
}

export function skipDialogue(): void {
  if (state.phase !== 'dialogue' || finished) return
  finished = true
  dialogueFinished()
}

function dialogueSystem(dt: number): void {
  const isDialogue = state.phase === 'dialogue'
  if (isDialogue && !wasDialogue) {
    index = 0
    elapsed = 0
    finished = false
  }
  wasDialogue = isDialogue
  if (!isDialogue || finished) return
  elapsed += dt
  const line = currentLines()[index]
  if (!line) {
    finished = true
    dialogueFinished()
    return
  }
  // Auto-advance a little slower than the authored duration so mobile readers keep up.
  if (elapsed * 1000 >= line.duration * 1.35 + 600) advanceDialogue()
}

export function installDialogue(): void {
  engine.addSystem(dialogueSystem, 60, 'dialogue')
  onConfirm(() => {
    if (state.phase === 'dialogue') advanceDialogue()
  })
}
