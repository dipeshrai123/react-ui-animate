export {
  animate,
  makeAnimated,
  AnimateValue,
  Easing,
  combine,
  interpolate,
  animateTo,
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
  withCustom,
  useValue,
  Presence,
  PresenceContext,
  usePresence,
  useIsPresent,
  recipes,
  LayoutGroup,
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
  CustomOptions,
  CustomTickFn,
  CustomTickContext,
  Descriptor,
  Controls,
  AnimateProp,
  AnimateStyle,
  AnimateAttributes,
  AnimateHTMLAttributes,
  AnimateSVGAttributes,
  LayoutOptions,
  LayoutGroupProps,
  PresenceProps,
  PresenceContextValue,
} from './animation';

export { useOutsideClick, useInView, type UseInViewOptions } from './shared/hooks';

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
  PinchEvent,
  PinchGestureConfig,
  RotateEvent,
  RotateGestureConfig,
} from './gestures/api/Gesture';

export { clamp, rubberClamp, snapTo, move } from './shared/utils';
