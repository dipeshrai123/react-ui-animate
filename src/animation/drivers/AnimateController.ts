export interface AnimateController {
  start(): void;
  pause(): void;
  resume(): void;
  cancel(): void;
  reset(): void;
  setOnComplete?(fn: () => void): void;
  /**
   * Shift the driver's internal position by `delta` without canceling
   * (used by FLIP layout corrections so an in-flight spring keeps its
   * velocity while the element's layout slot moves underneath it).
   */
  shiftBy?(delta: number): void;
}

export interface AnimateHooks {
  onStart?(): void;
  onPause?(): void;
  onResume?(): void;
  onComplete?(): void;
}

