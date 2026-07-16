export {
  animate,
  makeAnimated,
  AnimateValue,
  Easing,
  combine,
  interpolate,
  isReducedMotionEnabled,
  setReducedMotion,
  withSpring,
  withTiming,
  withDecay,
  withDelay,
  withSequence,
  withLoop,
  withStagger,
  withKeyframes,
  withParallel,
  useValue,
  Presence,
  PresenceContext,
  usePresence,
  useIsPresent,
  recipes,
} from './animation';

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
  StaggerOptions,
  KeyframeStep,
  KeyframeOptions,
  ParallelOptions,
  Descriptor,
  Controls,
  AnimateProp,
  AnimateStyle,
  AnimateAttributes,
  AnimateHTMLAttributes,
  AnimateSVGAttributes,
  LayoutOptions,
  PresenceProps,
  PresenceContextValue,
} from './animation';

export { useOutsideClick } from './hooks/events/useOutsideClick';
export { useInView, type UseInViewOptions } from './hooks/observers/useInView';

export {
  useScrollProgress,
  type UseScrollProgressOptions,
} from './gestures/hooks/useScrollProgress';

export {
  useDrag,
  type UseDragOptions,
  type UseDragResult,
  type DragBounds,
} from './gestures/hooks/useDrag';

export { Gesture } from './gestures/api/Gesture';
export { useGesture } from './gestures/hooks/useGesture';
export type {
  GestureType,
  GestureHandlers,
  BaseGestureConfig,
  GestureDescriptor,
  PanEvent,
  MoveEvent,
  WheelEvent,
  ScrollEvent,
  SwipeEvent,
  SwipeGestureConfig,
  SwipeHandlers,
  HoverEvent,
} from './gestures/api/Gesture';

export { clamp, rubberClamp, snapTo, move } from './utils';
