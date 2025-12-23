// Core controller interface
export * from './AnimateController';

// Animation drivers
export { timing } from './timing';
export { spring } from './spring';
export { decay } from './decay';

// Composition drivers
export { parallel, sequence, loop, delay } from './compose';

// Builder utilities
export { buildAnimation, buildParallel } from './builder';
