import type {
  RefObject,
  CSSProperties,
  AllHTMLAttributes,
  SVGAttributes,
} from 'react';
import type { AnimateValue } from '../values/AnimateValue';
import type { Descriptor, Primitive } from '../types';
import { transformKeys } from '../utils/apply';
import type { UseInViewOptions } from '../../hooks/observers/useInView';

// Helper type to accept any AnimateValue with a compatible type
export type AnimateValueCompatible =
  | AnimateValue<number>
  | AnimateValue<string>
  | AnimateValue<number | string>;

// Exclude transform keys from CSSProperties to avoid type conflicts
export type CSSPropertiesWithoutTransforms = Omit<
  CSSProperties,
  (typeof transformKeys)[number]
>;

export type AnimateStyle = {
  [K in keyof CSSPropertiesWithoutTransforms]?:
    | CSSPropertiesWithoutTransforms[K]
    | AnimateValueCompatible;
} & {
  [key in (typeof transformKeys)[number]]?:
    | AnimateValueCompatible
    | number
    | string;
};

export type AnimateHTMLAttributes<T> = {
  [K in keyof AllHTMLAttributes<T>]?:
    | AllHTMLAttributes<T>[K]
    | AnimateValueCompatible;
};

export type AnimateSVGAttributes<T> = {
  [K in keyof SVGAttributes<T>]?: SVGAttributes<T>[K] | AnimateValueCompatible;
};

export type AnimateProp = {
  [K in keyof AnimateStyle]?: Descriptor | Primitive;
};

export type AnimateAttributes<T extends EventTarget> = Omit<
  AnimateHTMLAttributes<T> & AnimateSVGAttributes<T>,
  | 'style'
  | 'animate'
  | 'exit'
  | 'hover'
  | 'press'
  | 'focus'
  | 'view'
  | 'viewOptions'
> & {
  style?: AnimateStyle;
  /**
   * Declarative animations to run when the component mounts or updates.
   */
  animate?: AnimateProp;
  /**
   * Declarative animations to run when the component exits (inside AnimatePresence).
   */
  exit?: AnimateProp;
  /**
   * Animations or styles to apply when the element is hovered.
   */
  hover?: AnimateProp;
  /**
   * Animations or styles to apply when the element is pressed (mouse down or touch start).
   */
  press?: AnimateProp;
  /**
   * Animations or styles to apply when the element is focused.
   */
  focus?: AnimateProp;
  /**
   * Animations or styles to apply when the element enters the viewport.
   */
  view?: AnimateProp;
  /**
   * Options for the IntersectionObserver used by view animations.
   */
  viewOptions?: UseInViewOptions;
};

export function combineRefs<T>(
  ...refs: Array<
    RefObject<T> | ((element: T | null) => void) | null | undefined
  >
) {
  return (element: T | null) => {
    for (const ref of refs) {
      if (!ref) continue;
      if (typeof ref === 'function') ref(element);
      else if ('current' in ref) (ref.current as T | null) = element;
    }
  };
}
