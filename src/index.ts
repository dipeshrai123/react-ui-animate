/**
 * Modules
 */
export {
  /**
   * AnimatedBlock: Animated Div Element
   * accepts animated node for block level elements
   */
  AnimatedBlock,
  /**
   * AnimatedInline: Animated Span Element
   * accepts animated node for inline elements
   */
  AnimatedInline,
  /**
   * AnimatedImage: Animated Img Element
   * accepts animated node for img elements
   */
  AnimatedImage,
  /**
   * ScrollableBlock
   * Used to animate element when enter into viewport
   */
  ScrollableBlock,
  /**
   * Make any component animatable
   * can accept any useAnimatedValue() node
   */
  makeAnimatedComponent,
} from "./Modules";

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
export {
  /**
   * linear interpolation - both SpringValue and normal values
   * used for mapping array of input ranges into array of output ranges
   * interpolate(value, inputRange[], outputRange[], extrapolateConfig?)
   * inputRange.length must be equal to outputRange.length
   * extrapolate, extrapolateLeft or extrapolateRight can be
   * "identity" | "extend" | "clamp"
   */
  interpolate,
  /**
   * linear interpolation - both SpringValue and normal values
   * bInterpolate(value, outputRange[], extrapolateConfig?)
   * inputRange is by default [0, 1]
   */
  bInterpolate,
} from "./Interpolation";

/**
 * Clamp
 */
export {
  /**
   * clamp(value, min, max)
   * clamps value for min and max bounds
   */
  clamp,
  /**
   * mix(progress, a, b)
   * linear interpolation between a and b
   */
  mix,
  /**
   * rubberClamp(value, min, max, constant?)
   * constant is optional : default 0.15
   * clamps the value for min and max value and
   * extends beyond min and max values with constant
   * factor to create elastic rubber band effect
   */
  rubberClamp,
  /**
   * snapTo(value, velocity, snapPoints[])
   * Calculates the final snapPoint according to given current value,
   * velocity and snapPoints array
   */
  snapTo,
  /**
   * bin(booleanValue)
   * returns 1 if booleanValue == true and 0 if booleanValue == false
   */
  bin,
  /**
   * swap(array, moveIndex, toIndex)
   * swap array item from moveIndex to toIndex without array modification
   */
  swap,
} from "./Math";

/**
 * Spring functions
 */
export * as SpringCore from "react-spring";
