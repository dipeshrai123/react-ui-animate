// Core
export {
  Easing,
  makeMotion as makeAnimated,
  motion as animate,
} from '@raidipesh78/re-motion';

// react-ui-animate
// Modules
export { AnimationConfig, MountedBlock, ScrollableBlock } from './animation';

// Hooks
export { useValue, useMount, useAnimatedList } from './animation';

// Helpers and Utilities
export {
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  withDecay,
  withLoop,
  withEase,
} from './animation';

// Hooks
export { useMeasure, useOutsideClick, useWindowDimension } from './hooks';

// Interpolation
export { interpolateNumbers } from './animation';

// gestures/hooks
export {
  useDrag,
  useGesture,
  useMouseMove,
  useScroll,
  useWheel,
} from './gestures/hooks';

// gestures/helpers
export { bin, clamp, mix, rubberClamp, move, snapTo } from './gestures/helpers';

// Types
export type { UseMountConfig } from './animation';
