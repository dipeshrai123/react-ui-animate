export interface AnimateController {
  start(): void;
  pause(): void;
  resume(): void;
  cancel(): void;
  reset(): void;
  setOnComplete?(fn: () => void): void;
}

export interface AnimateHooks {
  onStart?(): void;
  onPause?(): void;
  onResume?(): void;
  onComplete?(): void;
}

