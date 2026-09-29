import { InputAction, InputModifier, PointerEventType, engine, inputSystem } from '@dcl/sdk/ecs'
import { LANE_COUNT } from '../config/geometry'
import { state } from './state'

/**
 * Unified input intents. Touch UI and keyboard both write here; gameplay
 * systems only read intents, so they never care where a command came from.
 */
interface Intents {
  requestedLane: number | null
  confirm: boolean
}

const intents: Intents = { requestedLane: null, confirm: false }
const confirmListeners: Array<() => void> = []

export function requestLane(lane: number): void {
  if (lane < 0 || lane >= LANE_COUNT) return
  intents.requestedLane = lane
}

export function shiftLane(delta: number): void {
  requestLane(Math.max(0, Math.min(LANE_COUNT - 1, state.hero.lane + delta)))
}

export function consumeLaneRequest(): number | null {
  const l = intents.requestedLane
  intents.requestedLane = null
  return l
}

/** Fire the same thing a "continue" button would, from a keyboard key. */
export function confirm(): void {
  intents.confirm = true
}

export function onConfirm(fn: () => void): () => void {
  confirmListeners.push(fn)
  return () => {
    const i = confirmListeners.indexOf(fn)
    if (i >= 0) confirmListeners.splice(i, 1)
  }
}

/** Freeze the real avatar. The hero on screen is a separate entity. */
export function lockPlayer(): void {
  InputModifier.createOrReplace(engine.PlayerEntity, {
    mode: InputModifier.Mode.Standard({ disableAll: true })
  })
}

function keyboardSystem(): void {
  // Lane movement: A/D and arrow-equivalents. Screen-right is lane index + 1.
  if (inputSystem.isTriggered(InputAction.IA_LEFT, PointerEventType.PET_DOWN)) shiftLane(-1)
  if (inputSystem.isTriggered(InputAction.IA_RIGHT, PointerEventType.PET_DOWN)) shiftLane(1)
  if (inputSystem.isTriggered(InputAction.IA_ACTION_3, PointerEventType.PET_DOWN)) requestLane(0)
  if (inputSystem.isTriggered(InputAction.IA_ACTION_4, PointerEventType.PET_DOWN)) requestLane(1)
  if (inputSystem.isTriggered(InputAction.IA_ACTION_5, PointerEventType.PET_DOWN)) requestLane(2)

  if (
    inputSystem.isTriggered(InputAction.IA_PRIMARY, PointerEventType.PET_DOWN) ||
    inputSystem.isTriggered(InputAction.IA_JUMP, PointerEventType.PET_DOWN)
  ) {
    intents.confirm = true
  }

  if (intents.confirm) {
    intents.confirm = false
    for (const fn of [...confirmListeners]) fn()
  }
}

export function installInput(): void {
  lockPlayer()
  engine.addSystem(keyboardSystem, 10, 'keyboard-input')
}
