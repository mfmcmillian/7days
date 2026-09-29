import { engine } from '@dcl/sdk/ecs'

interface Timer {
  id: number
  remaining: number
  interval: number
  repeat: boolean
  fn: () => void
}

let nextId = 1
const timers: Timer[] = []

/** One-shot timer in seconds. Returns a handle for `clearTimer`. */
export function setTimer(seconds: number, fn: () => void): number {
  const id = nextId++
  timers.push({ id, remaining: seconds, interval: seconds, repeat: false, fn })
  return id
}

export function setRepeating(seconds: number, fn: () => void): number {
  const id = nextId++
  timers.push({ id, remaining: seconds, interval: seconds, repeat: true, fn })
  return id
}

export function clearTimer(id: number | undefined): void {
  if (id === undefined) return
  const i = timers.findIndex((t) => t.id === id)
  if (i >= 0) timers.splice(i, 1)
}

export function clearAllTimers(): void {
  timers.length = 0
}

function timerSystem(dt: number): void {
  if (timers.length === 0) return
  const due: Timer[] = []
  for (const t of timers) {
    t.remaining -= dt
    if (t.remaining <= 0) due.push(t)
  }
  for (const t of due) {
    if (t.repeat) {
      t.remaining += t.interval
    } else {
      const i = timers.indexOf(t)
      if (i >= 0) timers.splice(i, 1)
    }
    t.fn()
  }
}

export function installTimers(): void {
  engine.addSystem(timerSystem, 1000, 'timers')
}
