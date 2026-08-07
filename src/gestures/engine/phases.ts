export enum GesturePhase {
  UNDETERMINED = 'UNDETERMINED',
  POSSIBLE = 'POSSIBLE',
  BEGAN = 'BEGAN', // one-tick transitional phase: gate just passed this tick
  ACTIVE = 'ACTIVE',
  END = 'END',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}
