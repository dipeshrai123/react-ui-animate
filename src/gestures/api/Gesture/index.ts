export type { GestureType, GestureHandlers, BaseGestureConfig, GestureDescriptor } from './types';
export { PanGestureBuilder, type PanEvent } from './pan';
export {
  SwipeGestureBuilder,
  type SwipeEvent,
  type SwipeGestureConfig,
  type SwipeHandlers,
} from './swipe';
export {
  ContinuousGestureBuilder,
  type MoveEvent,
  type WheelEvent,
  type ScrollEvent,
  type HoverEvent,
} from './continuous';
export {
  TwoPointerGestureBuilder,
  type PinchEvent,
  type RotateEvent,
  type PinchGestureConfig,
  type RotateGestureConfig,
} from './twoPointer';

import { PanGestureBuilder } from './pan';
import { SwipeGestureBuilder } from './swipe';
import { ContinuousGestureBuilder, type MoveEvent, type WheelEvent, type ScrollEvent, type HoverEvent } from './continuous';
import { TwoPointerGestureBuilder, type PinchEvent, type RotateEvent, type PinchGestureConfig, type RotateGestureConfig } from './twoPointer';

export const Gesture = {
  Pan: () => new PanGestureBuilder(),
  Move: () => new ContinuousGestureBuilder<MoveEvent>('move'),
  Wheel: () => new ContinuousGestureBuilder<WheelEvent>('wheel'),
  Scroll: () => new ContinuousGestureBuilder<ScrollEvent>('scroll'),
  Swipe: () => new SwipeGestureBuilder(),
  Hover: () => new ContinuousGestureBuilder<HoverEvent>('hover'),
  Pinch: () => new TwoPointerGestureBuilder<PinchEvent, PinchGestureConfig>('pinch'),
  Rotate: () => new TwoPointerGestureBuilder<RotateEvent, RotateGestureConfig>('rotate'),
};
