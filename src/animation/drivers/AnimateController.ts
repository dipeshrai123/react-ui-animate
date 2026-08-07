export interface AnimateController {
  start(): void;
  pause(): void;
  resume(): void;
  cancel(): void;
  reset(): void;
  setOnComplete?(fn: () => void): void;
  /** Shifts position without canceling — used by FLIP corrections to preserve velocity. */
  shiftBy?(delta: number): void;
}

export interface AnimateHooks {
  onStart?(): void;
  onPause?(): void;
  onResume?(): void;
  onComplete?(): void;
}

