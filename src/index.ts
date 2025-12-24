// ============================================================================
// Main entry point - re-export public APIs with named exports for tree-shaking
// ============================================================================

// Animation APIs
export {
  animate,
  makeAnimated,
  AnimateValue,
  isAnimateValue,
  timing,
  spring,
  decay,
  parallel,
  sequence,
  loop,
  delay,
  Easing,
  combine,
  to,
  withSpring,
  withTiming,
  withDecay,
  withDelay,
  withSequence,
  withLoop,
  Config,
  useValue,
  Presence,
  PresenceContext,
  usePresence,
  useIsPresent,
  recipes,
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
} from './animation';

// Type exports
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
  AnimateProp,
  AnimateStyle,
  AnimateAttributes,
  AnimateHTMLAttributes,
  AnimateSVGAttributes,
  PresenceProps,
  PresenceContextValue,
  AnimateController,
  AnimateHooks,
} from './animation';

// General hooks
export { useOutsideClick } from './hooks/events/useOutsideClick';
export { useInView, type UseInViewOptions } from './hooks/observers/useInView';

// Gesture hooks
export { useDrag } from './gestures/hooks/useDrag';
export { useMove } from './gestures/hooks/useMove';
export { useScroll } from './gestures/hooks/useScroll';
export {
  useScrollProgress,
  type UseScrollProgressOptions,
} from './gestures/hooks/useScrollProgress';
export { useWheel } from './gestures/hooks/useWheel';
export { useRecognizer } from './gestures/hooks/useRecognizer';

// Gesture types
export type { DragEvent, DragConfig } from './gestures/controllers/DragGesture';
export type { MoveEvent } from './gestures/controllers/MoveGesture';
export type { ScrollEvent } from './gestures/controllers/ScrollGesture';
export type { WheelEvent } from './gestures/controllers/WheelGesture';

// Utilities
export { clamp, rubberClamp, snapTo, move } from './utils';
