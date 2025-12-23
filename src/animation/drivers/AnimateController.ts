export interface AnimateController {
  start(): void;
  pause(): void;
  resume(): void;
  cancel(): void;
  reset(): void;
  setOnComplete?(fn: () => void): void;
}

// Shared hooks interface for all animation drivers
export interface AnimateHooks {
  onStart?(): void;
  onPause?(): void;
  onResume?(): void;
  onComplete?(): void;
}

