import { forwardRef, useLayoutEffect, useRef, createElement, type RefObject, type CSSProperties, type AllHTMLAttributes, type SVGAttributes } from 'react';

import { isTransformKey, transformKeys, applyAttrs, applyStyles, applyTransforms } from './apply';
import { MotionValue } from './MotionValue';

type MotionStyle = {
  [K in keyof CSSProperties]?:
    | CSSProperties[K]
    | MotionValue<number | string>;
} & {
  [key in (typeof transformKeys)[number]]?:
    | MotionValue<number | string>
    | number
    | string;
};

type MotionHTMLAttributes<T> = {
  [K in keyof AllHTMLAttributes<T>]?:
    | AllHTMLAttributes<T>[K]
    | MotionValue<number | string>;
};

type MotionSVGAttributes<T> = {
  [K in keyof SVGAttributes<T>]?:
    | SVGAttributes<T>[K]
    | MotionValue<number | string>;
};

type MotionAttributes<T extends EventTarget> = Omit<
  MotionHTMLAttributes<T> & MotionSVGAttributes<T>,
  'style'
> & {
  style?: MotionStyle;
};

function combineRefs<T>(
  ...refs: Array<
    RefObject<T> | ((el: T | null) => void) | null | undefined
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

export function makeMotion<Tag extends keyof JSX.IntrinsicElements>(
  Wrapped: Tag
) {
  const MotionComp = forwardRef<
    HTMLElement,
    MotionAttributes<HTMLElement>
  >((givenProps, givenRef) => {
    const nodeRef = useRef<HTMLElement | null>(null);
    const propsRef = useRef(givenProps);
    const cleanupRef = useRef<(() => void)[]>([]);

    // Update props ref on every render
    propsRef.current = givenProps;

    useLayoutEffect(() => {
      const node = nodeRef.current;
      if (!node) return;

      // Cleanup previous subscriptions
      cleanupRef.current.forEach((c) => c());
      cleanupRef.current = [];

      const { style = {}, ...rest } = propsRef.current;

      const normal: Record<string, any> = {};
      const tx: Record<string, any> = {};

      for (const [k, v] of Object.entries(style)) {
        if (isTransformKey(k)) tx[k] = v;
        else normal[k] = v;
      }

      const cleanSubs = [
        ...applyStyles(node, normal),
        ...applyTransforms(node, style),
        ...applyAttrs(node, rest),
      ];

      cleanupRef.current = cleanSubs;

      return () => {
        cleanupRef.current.forEach((c) => c());
        cleanupRef.current = [];
      };
    });

    return createElement(Wrapped, {
      ...givenProps,
      ref: combineRefs(nodeRef, givenRef),
    });
  });

  MotionComp.displayName =
    typeof Wrapped === 'string'
      ? `Motion.${Wrapped}`
      : `Motion(${
          (Wrapped as any).displayName || (Wrapped as any).name || 'Component'
        })`;

  return MotionComp;
}

const cache = new Map<
  keyof JSX.IntrinsicElements,
  ReturnType<typeof makeMotion>
>();

export const motion = new Proxy({} as any, {
  get(_, tag: keyof JSX.IntrinsicElements) {
    if (!cache.has(tag)) {
      cache.set(tag, makeMotion(tag));
    }
    return cache.get(tag);
  },
}) as {
  [K in keyof JSX.IntrinsicElements]: ReturnType<typeof makeMotion<K>>;
};
