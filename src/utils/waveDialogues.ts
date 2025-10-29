import { DialogueLine } from '../ui/DialogueScreen'

export const WAVE_DIALOGUES: Record<number, DialogueLine[]> = {
  1: [
    { speaker: 'HQ', text: 'Delta-1, this is Command. Seven waves between you and extraction.', duration: 3000 },
    { speaker: 'SOLDIER', text: 'Copy. Streets are dead silent... too silent.', duration: 2500 },
    { speaker: 'HQ', text: 'They’ll come. They always do. Hold your ground.', duration: 2500 }
  ],
  2: [
    { speaker: 'HQ', text: 'Motion sensors picking up movement. North sector.', duration: 2500 },
    {
      speaker: 'SOLDIER',
      text: 'Already here! Barricade’s shaking—these things are faster than before!',
      duration: 2500
    },
    { speaker: 'HQ', text: 'Reinforce what you can. Don’t let them in. Not again.', duration: 2500 }
  ],
  3: [
    { speaker: 'SOLDIER', text: 'HQ… found civilians in the rubble. They’re armed now.', duration: 2500 },
    { speaker: 'HQ', text: 'Keep them close. Fear turns to strength when you’ve got nothing left.', duration: 2500 },
    { speaker: 'SOLDIER', text: 'Copy that. But they look scared… like they know something I don’t.', duration: 2500 }
  ],
  4: [
    { speaker: 'SOLDIER', text: 'They’re mutating—one climbed the wall. Eyes… wrong. Too human.', duration: 2500 },
    { speaker: 'HQ', text: 'The infection’s evolving. If they reach the command post, it’s over.', duration: 2500 },
    { speaker: 'SOLDIER', text: 'Then we die here first.', duration: 2000 }
  ],
  5: [
    { speaker: 'HQ', text: 'Satellite feed’s glitching. Can’t see your position.', duration: 2500 },
    { speaker: 'SOLDIER', text: 'Good. You don’t want to.', duration: 2000 },
    { speaker: 'HQ', text: 'You’re running out of time, Delta-1.', duration: 2000 },
    { speaker: 'SOLDIER', text: 'We’re already out.', duration: 2000 }
  ],
  6: [
    { speaker: 'SURVIVOR', text: 'Please… tell me rescue’s coming.', duration: 2500 },
    { speaker: 'SOLDIER', text: 'They stopped answering an hour ago.', duration: 2500 },
    { speaker: 'SURVIVOR', text: 'Then this is it?', duration: 2000 },
    { speaker: 'SOLDIER', text: 'No. One more wave. We finish this our way.', duration: 2500 }
  ],
  7: [
    { speaker: 'HQ', text: 'Final wave inbound. No more signals after this. Godspeed, soldier.', duration: 3000 },
    { speaker: 'SOLDIER', text: 'They’re everywhere… I can see the city burning.', duration: 2500 },
    { speaker: 'HQ', text: 'Hold the line.', duration: 2000 },
    { speaker: 'SOLDIER', text: 'Tell my wife I kept my promise.', duration: 2500 },
    { speaker: '—', text: '[STATIC] ...breach detected...', duration: 2000 },
    { speaker: '—', text: '...', duration: 2000 }
  ]
}
