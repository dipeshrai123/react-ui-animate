// Core
export {
  Easing,
  makeMotion as makeAnimated,
  motion as animate,
  combine,
} from '@raidipesh78/re-motion';

// Animation
export {
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  withDecay,
  withLoop,
  useValue,
  useMount,
  AnimationConfig,
  interpolateNumbers,
} from './animation';

// Hooks
export { useMeasure, useOutsideClick, useWindowDimension } from './hooks';

// Gestures
export {
  useDrag,
  useGesture,
  useMouseMove,
  useScroll,
  useWheel,
} from './gestures/hooks';

// Utility functions for gestures
export { bin, clamp, mix, rubberClamp, move, snapTo } from './gestures/helpers';
