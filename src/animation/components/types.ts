import type {
  RefObject,
  CSSProperties,
  AllHTMLAttributes,
  SVGAttributes,
} from 'react';
import type { AnimateValue } from '../values/AnimateValue';
import type { Descriptor, Primitive } from '../types';
import { transformKeys } from '../utils/apply';
import type { UseInViewOptions } from '../../shared/hooks';
import type { FlipOptions } from '../layout/flip';

export type AnimateValueCompatible =
  | AnimateValue<number>
  | AnimateValue<string>
  | AnimateValue<number | string>;

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
  | 'unmount'
  | 'hover'
  | 'press'
  | 'focus'
  | 'view'
  | 'viewOptions'
  | 'flip'
  | 'flipOptions'
  | 'flipId'
> & {
  style?: AnimateStyle;
  /** Declarative animations to run when the component mounts or updates. */
  animate?: AnimateProp;
  /** Declarative animations to run when the component unmounts (inside Unmount). */
  unmount?: AnimateProp;
  /** Animations or styles to apply when the element is hovered. */
  hover?: AnimateProp;
  /** Animations or styles to apply when the element is pressed (mouse down or touch start). */
  press?: AnimateProp;
  /** Animations or styles to apply when the element is focused. */
  focus?: AnimateProp;
  /** Animations or styles to apply when the element enters the viewport. */
  view?: AnimateProp;
  /** Options for the IntersectionObserver used by `view` animations. */
  viewOptions?: UseInViewOptions;
  /**
   * When true, automatically animates position and size changes caused by
   * layout shifts (reordering, resizing, insertion/removal of siblings, etc.)
   * using a FLIP-style transform animation. Composes with any other transform
   * already applied to the element (via `style`, `animate`, `hover`, `press`,
   * or `view`) instead of overwriting it.
   */
  flip?: boolean;
  /**
   * Transition used by `flip` / `flipId`. Same descriptor helpers as
   * `animate` / `hover` / etc., in options-only form (no target — FLIP
   * always settles at identity):
   *
   *   flipOptions={withSpring({ stiffness: 400, damping: 32 })}
   *   flipOptions={withTiming({ duration: 300 })}
   *
   * Raw spring option objects are still accepted for backwards compatibility.
   */
  flipOptions?: FlipOptions;
  /**
   * Identifies this element as part of a shared flip transition. When an
   * element carrying a given `flipId` unmounts (or moves elsewhere) and a
   * different element mounts with the same `flipId`, the new element
   * automatically plays a FLIP-style transform animation from the previous
   * element's last known position/size to its own — useful for tab
   * indicators, expanding cards, and other "morph between elements"
   * patterns. Uses `flipOptions` for the transition (spring or timing).
   * Note: `flipId`s are tracked in a single global registry, so keep them
   * unique per active transition group.
   */
  flipId?: string;
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
