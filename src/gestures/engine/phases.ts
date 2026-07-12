export enum GesturePhase {
  UNDETERMINED = 'UNDETERMINED', // no pointer down yet
  POSSIBLE = 'POSSIBLE', // pointer down, still within gate (e.g. under minDistance)
  BEGAN = 'BEGAN', // one-tick transitional phase: gate just passed this tick
  ACTIVE = 'ACTIVE', // recognized, continuously updating
  END = 'END', // pointer released while ACTIVE — successful completion
  FAILED = 'FAILED', // gate condition violated before recognition
  CANCELLED = 'CANCELLED', // externally cancelled (pointercancel, .cancel(), lost arbitration)
}
