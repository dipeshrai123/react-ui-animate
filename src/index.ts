// Core
export {
  Easing,
  makeFluid as makeAnimated,
  fluid as animate,
} from '@raidipesh78/re-motion';

// react-ui-animate
// Modules
export {
  AnimationConfig,
  MountedBlock,
  ScrollableBlock,
  TransitionBlock,
} from './animation';

// Interpolation
export { interpolate, bInterpolate } from './animation';

// Hooks
export {
  useValue,
  useMount,
  useValues,
  useNewValue,
  useNewMount,
} from './animation';

// Helpers and Utilities
export {
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  withDecay,
  withLoop,
} from './animation';

// Hooks
export { useMeasure, useOutsideClick, useWindowDimension } from './hooks';

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
export type { UseValueConfig, UseMountConfig } from './animation';
