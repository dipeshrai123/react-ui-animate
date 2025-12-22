import { forwardRef, useLayoutEffect, useRef, createElement, type RefObject, type CSSProperties, type AllHTMLAttributes, type SVGAttributes } from 'react';

import { isTransformKey, transformKeys, applyAttrs, applyStyles, applyTransforms } from './apply';
import { AnimateValue } from './AnimateValue';

type AnimateStyle = {
  [K in keyof CSSProperties]?:
    | CSSProperties[K]
    | AnimateValue<number | string>;
} & {
  [key in (typeof transformKeys)[number]]?:
    | AnimateValue<number | string>
    | number
    | string;
};

type AnimateHTMLAttributes<T> = {
  [K in keyof AllHTMLAttributes<T>]?:
    | AllHTMLAttributes<T>[K]
    | AnimateValue<number | string>;
};

type AnimateSVGAttributes<T> = {
  [K in keyof SVGAttributes<T>]?:
    | SVGAttributes<T>[K]
    | AnimateValue<number | string>;
};

type AnimateAttributes<T extends EventTarget> = Omit<
  AnimateHTMLAttributes<T> & AnimateSVGAttributes<T>,
  'style'
> & {
  style?: AnimateStyle;
};

function combineRefs<T>(
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

export function makeAnimated<Tag extends keyof JSX.IntrinsicElements>(
  tag: Tag
) {
  const AnimatedComponent = forwardRef<
    HTMLElement,
    AnimateAttributes<HTMLElement>
  >((props, ref) => {
    const nodeRef = useRef<HTMLElement | null>(null);
    const propsRef = useRef(props);
    const cleanupRef = useRef<(() => void)[]>([]);

    propsRef.current = props;

    useLayoutEffect(() => {
      const node = nodeRef.current;
      if (!node) return;

      cleanupRef.current.forEach((cleanup) => cleanup());
      cleanupRef.current = [];

      const { style = {}, ...rest } = propsRef.current;

      const normal: Record<string, any> = {};
      const transforms: Record<string, any> = {};

      for (const [key, value] of Object.entries(style)) {
        if (isTransformKey(key)) transforms[key] = value;
        else normal[key] = value;
      }

      const subscriptions = [
        ...applyStyles(node, normal),
        ...applyTransforms(node, style),
        ...applyAttrs(node, rest),
      ];

      cleanupRef.current = subscriptions;

      return () => {
        cleanupRef.current.forEach((cleanup) => cleanup());
        cleanupRef.current = [];
      };
    });

    return createElement(tag, {
      ...props,
      ref: combineRefs(nodeRef, ref),
    });
  });

  AnimatedComponent.displayName =
    typeof tag === 'string'
      ? `Animated.${tag}`
      : `Animated(${
          (tag as any).displayName || (tag as any).name || 'Component'
        })`;

  return AnimatedComponent;
}

const cache = new Map<
  keyof JSX.IntrinsicElements,
  ReturnType<typeof makeAnimated>
>();

export const animate = new Proxy({} as any, {
  get(_, tag: keyof JSX.IntrinsicElements) {
    if (!cache.has(tag)) {
      cache.set(tag, makeAnimated(tag));
    }
    return cache.get(tag);
  },
}) as {
  [K in keyof JSX.IntrinsicElements]: ReturnType<typeof makeAnimated<K>>;
};

