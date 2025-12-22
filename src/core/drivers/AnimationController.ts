export interface AnimationController {
  start(): void;
  pause(): void;
  resume(): void;
  cancel(): void;
  reset(): void;
  setOnComplete?(fn: () => void): void;
}
