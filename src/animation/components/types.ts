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
  animate?: AnimateProp;
  unmount?: AnimateProp;
  hover?: AnimateProp;
  press?: AnimateProp;
  focus?: AnimateProp;
  view?: AnimateProp;
  viewOptions?: UseInViewOptions;
  flip?: boolean;
  flipOptions?: FlipOptions;
  /** Must be unique per active transition group — tracked in a single global registry. */
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
