import { forwardRef, useLayoutEffect, useRef, createElement, type RefObject, type CSSProperties, type AllHTMLAttributes, type SVGAttributes } from 'react';

import { isTransformKey, transformKeys, applyAttrs, applyStyles, applyTransforms } from './apply';
import { AnimateValue } from './AnimateValue';
import type { Descriptor, Primitive } from '../animation/types';
import { buildAnimation } from '../animation/drivers';

// Helper type to accept any AnimateValue with a compatible type
type AnimateValueCompatible = 
  | AnimateValue<number>
  | AnimateValue<string>
  | AnimateValue<number | string>;

// Exclude transform keys from CSSProperties to avoid type conflicts
type CSSPropertiesWithoutTransforms = Omit<
  CSSProperties,
  (typeof transformKeys)[number]
>;

type AnimateStyle = {
  [K in keyof CSSPropertiesWithoutTransforms]?:
    | CSSPropertiesWithoutTransforms[K]
    | AnimateValueCompatible;
} & {
  [key in (typeof transformKeys)[number]]?:
    | AnimateValueCompatible
    | number
    | string;
};

type AnimateHTMLAttributes<T> = {
  [K in keyof AllHTMLAttributes<T>]?:
    | AllHTMLAttributes<T>[K]
    | AnimateValueCompatible;
};

type AnimateSVGAttributes<T> = {
  [K in keyof SVGAttributes<T>]?:
    | SVGAttributes<T>[K]
    | AnimateValueCompatible;
};

type AnimateProp = {
  [K in keyof AnimateStyle]?: Descriptor;
};

type AnimateAttributes<T extends EventTarget> = Omit<
  AnimateHTMLAttributes<T> & AnimateSVGAttributes<T>,
  'style' | 'animate'
> & {
  style?: AnimateStyle;
  animate?: AnimateProp;
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

// Helper to extract initial value from style prop (static values only)
function getStaticStyleValue(style: any, key: string): Primitive | null {
  if (!style || !(key in style)) return null;
  
  const value = style[key];
  if (value === undefined || value === null) return null;
  
  // Skip AnimateValues - we want static initial values
  if (value && typeof value === 'object' && 'subscribe' in value) return null;
  
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const num = parseFloat(value);
    return isNaN(num) ? value : num;
  }
  
  return null;
}

// Helper to get default initial value for a property
function getDefaultInitialValue(key: string): Primitive {
  if (key === 'opacity') return 1;
  if (key === 'scale' || key === 'scaleX' || key === 'scaleY') return 1;
  if (key.startsWith('translate')) return 0;
  if (key.startsWith('rotate')) return 0;
  return 0;
}

// Helper to get initial value for a property
function getInitialValue(
  key: string,
  style: any,
  node: HTMLElement,
  computedStyle: CSSStyleDeclaration
): Primitive {
  // Prioritize static value from style prop
  const staticValue = getStaticStyleValue(style, key);
  if (staticValue !== null) return staticValue;
  
  // Fall back to inline style
  const inlineValue = (node.style as any)[key];
  if (inlineValue) {
    const num = parseFloat(inlineValue);
    return isNaN(num) ? inlineValue : num;
  }
  
  // Fall back to computed style
  const computedValue = computedStyle.getPropertyValue(
    key.replace(/([A-Z])/g, '-$1').toLowerCase()
  );
  if (computedValue) {
    const num = parseFloat(computedValue);
    return isNaN(num) ? computedValue.trim() : num;
  }
  
  // Use default
  return getDefaultInitialValue(key);
}

// Helper to create serialized key for animate prop change detection
function createAnimateKey(animateProp: AnimateProp | undefined): string | null {
  if (!animateProp) return null;
  return JSON.stringify(
    Object.keys(animateProp)
      .sort()
      .map((key) => [key, (animateProp as any)[key]?.type])
  );
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
    const animateValuesRef = useRef<Record<string, AnimateValue<Primitive>>>({});
    const controllersRef = useRef<Array<{ cancel(): void }>>([]);

    propsRef.current = props;

    useLayoutEffect(() => {
      const node = nodeRef.current;
      if (!node) return;

      // Cleanup previous subscriptions and animations
      cleanupRef.current.forEach((cleanup) => cleanup());
      controllersRef.current.forEach((ctrl) => ctrl.cancel());
      cleanupRef.current = [];
      controllersRef.current = [];

      const { style = {}, animate: animateProp, ...rest } = propsRef.current;

      // Handle animate prop - create AnimateValues and start animations
      if (animateProp) {
        const computedStyle = window.getComputedStyle(node);
        const newAnimateValues: Record<string, AnimateValue<Primitive>> = {};

        // Create or reset AnimateValues for each animated property
        for (const key of Object.keys(animateProp)) {
          const initial = getInitialValue(key, style, node, computedStyle);
          
          // Reuse existing AnimateValue or create new one
          const value = animateValuesRef.current[key] || new AnimateValue(initial);
          value.set(initial); // Reset to initial value
          newAnimateValues[key] = value;
        }

        animateValuesRef.current = newAnimateValues;

        // Build and start animations
        for (const [key, descriptor] of Object.entries(animateProp)) {
          const value = newAnimateValues[key];
          if (!value) continue;

          const controller = buildAnimation(value, descriptor);
          controllersRef.current.push(controller);
          controller.start();
        }
      }

      // Merge animate values into style
      const mergedStyle: Record<string, any> = { ...style };
      if (animateProp) {
        for (const key of Object.keys(animateProp)) {
          if (animateValuesRef.current[key]) {
            mergedStyle[key] = animateValuesRef.current[key];
          }
        }
      }

      // Separate normal styles from transforms
      const normal: Record<string, any> = {};
      const transforms: Record<string, any> = {};
      for (const [key, value] of Object.entries(mergedStyle)) {
        (isTransformKey(key) ? transforms : normal)[key] = value;
      }

      // Apply styles and attributes
      cleanupRef.current = [
        ...applyStyles(node, normal),
        ...applyTransforms(node, mergedStyle),
        ...applyAttrs(node, rest),
      ];

      return () => {
        cleanupRef.current.forEach((cleanup) => cleanup());
        controllersRef.current.forEach((ctrl) => ctrl.cancel());
        cleanupRef.current = [];
        controllersRef.current = [];
      };
    }, [createAnimateKey(props.animate), props.style]);

    const { animate: _, ...domProps } = props;

    return createElement(tag, {
      ...domProps,
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

