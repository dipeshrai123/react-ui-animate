// Core controller interface
export type { AnimateController, AnimateHooks } from './AnimateController';

// Animation drivers (low-level, for advanced use)
export { timing } from './timing';
export { spring } from './spring';
export { decay } from './decay';

// Composition drivers (low-level, for advanced use)
export { parallel, sequence, loop, delay } from './compose';

// Note: buildAnimation and buildParallel are internal and not exported
