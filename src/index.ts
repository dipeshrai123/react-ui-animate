// Core
export { Easing, makeFluid, fluid } from '@raidipesh78/re-motion';

// react-ui-animate
// Modules
export {
  AnimatedBlock,
  AnimatedImage,
  AnimatedInline,
  AnimationConfigUtils,
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
