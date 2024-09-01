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
export { bInterpolate, interpolate } from './animation';

// Hooks
export { useAnimatedValue, useMountedValue } from './animation';

// Helpers and Utilities
export {
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  withEase,
  withConfig,
  withDecay,
  delay,
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
export type {
  UseAnimatedValueConfig,
  UseMountedValueConfig,
} from './animation';
