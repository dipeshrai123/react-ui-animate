// ============================================================================
// Components
// ============================================================================
export { animate, makeAnimated } from './components/animate';

// ============================================================================
// Core Values
// ============================================================================
export { AnimateValue, isAnimateValue } from './values/AnimateValue';

// ============================================================================
// Animation Drivers (low-level APIs)
// ============================================================================
export type {
  AnimateController,
  AnimateHooks,
} from './drivers/AnimateController';
export { timing } from './drivers/timing';
export { spring } from './drivers/spring';
export { decay } from './drivers/decay';
export { parallel, sequence, loop, delay } from './drivers/compose';

// ============================================================================
// Utilities
// ============================================================================
export { Easing } from './utils/easing';
export { combine } from './utils/combine';

// ============================================================================
// Interpolation
// ============================================================================
export { to } from './to';

// ============================================================================
// Animation Descriptors
// ============================================================================
export {
  withSpring,
  withTiming,
  withDecay,
  withDelay,
  withSequence,
  withLoop,
} from './descriptors';

// ============================================================================
// Configuration
// ============================================================================
export { Config } from './Config';

// ============================================================================
// React Hooks
// ============================================================================
export { useValue } from './hooks/useValue';

// ============================================================================
// Modules
// ============================================================================
export {
  Presence,
  PresenceContext,
  usePresence,
  useIsPresent,
  type PresenceProps,
  type PresenceContextValue,
} from './modules/Presence';

// ============================================================================
// Types
// ============================================================================
export type {
  Primitive,
  ExtrapolateConfig,
  ExtrapolateType,
  Callbacks,
  SpringOptions,
  TimingOptions,
  DecayOptions,
  SequenceOptions,
  DelayOptions,
  LoopOptions,
  DriverType,
  Descriptor,
  Controls,
} from './types';
export type {
  AnimateProp,
  AnimateStyle,
  AnimateAttributes,
  AnimateHTMLAttributes,
  AnimateSVGAttributes,
} from './components/types';

// ============================================================================
// Animation Recipes
// ============================================================================
export { recipes } from './recipes';
export {
  fadeIn,
  fadeOut,
  fadeInUp,
  fadeInDown,
  fadeInLeft,
  fadeInRight,
  slideInUp,
  slideInDown,
  slideInLeft,
  slideInRight,
  slideOutUp,
  slideOutDown,
  slideOutLeft,
  slideOutRight,
  scaleIn,
  scaleOut,
  scaleUp,
  scaleDown,
  bounceIn,
  bounceOut,
  rotateIn,
  rotateOut,
  spin,
  zoomIn,
  zoomOut,
  flipX,
  flipY,
  slideFadeIn,
  slideFadeOut,
  scaleFadeIn,
  scaleFadeOut,
  hoverScale,
  hoverLift,
  hoverGlow,
  pressScale,
  pressDown,
  exitFade,
  exitSlideUp,
  exitSlideDown,
  exitScale,
} from './recipes';
