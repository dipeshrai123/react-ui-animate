/**
 * Modules
 */
export { AnimatedBlock, ScrollableBlock } from "./Modules";

/**
 * Animated Values
 */
export { useAnimatedValue, useMountedValue } from "./Animation";

/**
 * Hooks
 */
export {
  /* Handles the dragging of element.
   * Usage:
   * bind = useDrag(({
   *  down,
   *  movementX,
   *  movementY,
   *  offsetX,
   *  offsetY,
   *  velocityX,
   *  velocityY,
   *  distanceX,
   *  distanceY,
   *  directionX,
   *  directionY,
   *  cancel,
   * }) => {})
   */
  useDrag,
  /*
   * Measure any HTMLElement renderered in DOM.
   * callback is called in first layout render & when element size is changed.
   * Usage:
   * useMeasure(({ left, top, width, height, vLeft, vTop }) => {...})
   * left and top accounts horizontal and vertical scrolled amount
   * vLeft and vTop gives relative to viewport
   * All values will be array if bound to multiple elements
   */
  useMeasure,
  /*
   * Handles outside click of any element.
   * callback is called when user clicks outside the reference element.
   * Usage:
   * useOutsideClick(elementRef, () => {...})
   * ...bind() or ...bind(index) for multiple
   */
  useOutsideClick,
  /*
   * Gives scrolling measurement through callback.
   * Usage:
   * bind = useScroll(({isScrolling, scrollX, scrollY, scrollDirection}) => {...})
   * if bind() spread over any HTMLElement then element scrolling is measured else window's
   */
  useScroll,
  /*
   * Gives width and height of viewport in callback
   * Resizeobserver for watching window resize
   * Usage:
   * useWindowDimension(({width, height}) => {...})
   */
  useWindowDimension,
} from "./Hooks";

/**
 * Interpolation
 */
export { interpolate, bInterpolate } from "./Interpolation";

/**
 * Clamp
 */
export { clamp, mix, rubberClamp } from "./Math";
