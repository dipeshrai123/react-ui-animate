export { animate, makeAnimated } from './components/animate';

export { AnimateValue } from './values/AnimateValue';

export type {
  AnimateController,
  AnimateHooks,
} from './drivers/AnimateController';
export { timing } from './drivers/timing';
export { spring } from './drivers/spring';
export { decay } from './drivers/decay';
export { parallel, sequence, loop, delay } from './drivers/compose';

export { Easing } from './utils/easing';
export { combine } from './utils/combine';
export { isReducedMotionEnabled, setReducedMotion } from './utils/reducedMotion';

export { interpolate } from './to';
export { animateTo } from './utils/animateTo';

export {
  withSpring,
  withTiming,
  withDecay,
  withDelay,
  withSequence,
  withLoop,
  withStagger,
  withKeyframes,
  withParallel,
} from './descriptors';

export { useValue } from './hooks/useValue';

export {
  Presence,
  PresenceContext,
  usePresence,
  useIsPresent,
  type PresenceProps,
  type PresenceContextValue,
} from './modules/Presence';

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
export type { LayoutOptions } from './layout';

export { recipes } from './recipes';
