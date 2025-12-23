import { forwardRef, useLayoutEffect, useRef, createElement, useContext, useEffect, type RefObject, type CSSProperties, type AllHTMLAttributes, type SVGAttributes } from 'react';

import { isTransformKey, transformKeys, applyAttrs, applyStyles, applyTransforms } from './apply';
import { AnimateValue } from './AnimateValue';
import type { Descriptor, Primitive } from '../animation/types';
import { buildAnimation } from '../animation/drivers';
import { PresenceContext } from '../animation/modules/Presence';

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
  'style' | 'animate' | 'exit'
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
    // Check if the string has a CSS unit - if so, keep it as a string
    if (/\d+(px|rem|em|ex|%|cm|mm|in|pt|pc|ch|vh|vw|vmin|vmax)$/i.test(value)) return value;
    
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

// Helper to check if a string has a CSS unit
function hasUnit(value: string): boolean {
  return /\d+(px|rem|em|ex|%|cm|mm|in|pt|pc|ch|vh|vw|vmin|vmax)$/i.test(value);
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
    // Preserve strings with units
    if (hasUnit(inlineValue)) return inlineValue;
    const num = parseFloat(inlineValue);
    return isNaN(num) ? inlineValue : num;
  }
  
  // Fall back to computed style
  const computedValue = computedStyle.getPropertyValue(
    key.replace(/([A-Z])/g, '-$1').toLowerCase()
  );
  if (computedValue) {
    // Preserve strings with units
    if (hasUnit(computedValue)) return computedValue.trim();
    const num = parseFloat(computedValue);
    return isNaN(num) ? computedValue.trim() : num;
  }
  
  // Use default
  return getDefaultInitialValue(key);
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
    const isExitingRef = useRef(false);
    const hasMountedRef = useRef(false);

    // Get presence context for AnimatePresence integration
    const presenceContext = useContext(PresenceContext);

    propsRef.current = props;

    // Handle enter animations - only run on first mount
    useLayoutEffect(() => {
      const node = nodeRef.current;
      if (!node) return;

      // Don't run enter animations if we're exiting
      if (isExitingRef.current) return;

      const { style = {}, animate: animateProp, ...rest } = propsRef.current;
      const isFirstMount = !hasMountedRef.current;

      // On first mount: setup AnimateValues and start animations
      // On subsequent renders: just update style subscriptions without restarting animations
      if (isFirstMount && animateProp) {
        const computedStyle = window.getComputedStyle(node);
        const newAnimateValues: Record<string, AnimateValue<Primitive>> = {};

        // Create AnimateValues for each animated property
        for (const key of Object.keys(animateProp)) {
          const initial = getInitialValue(key, style, node, computedStyle);
          const value = new AnimateValue(initial);
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

      // Cleanup previous subscriptions (but not animations on re-render)
      cleanupRef.current.forEach((cleanup) => cleanup());
      cleanupRef.current = [];

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

      hasMountedRef.current = true;

      return () => {
        cleanupRef.current.forEach((cleanup) => cleanup());
        cleanupRef.current = [];
      };
    }, [props.style]);

    // Cleanup animations on unmount
    useEffect(() => {
      return () => {
        controllersRef.current.forEach((ctrl) => ctrl.cancel());
        controllersRef.current = [];
      };
    }, []);

    // Handle exit animations when inside AnimatePresence
    useEffect(() => {
      if (!presenceContext?.isExiting || isExitingRef.current) return;

      isExitingRef.current = true;
      const { exit: exitProp } = propsRef.current;

      if (!exitProp) {
        // No exit animation defined, complete immediately
        presenceContext.onExitComplete();
        return;
      }

      // Cancel any running animations
      controllersRef.current.forEach((ctrl) => ctrl.cancel());
      controllersRef.current = [];

      // Track completed animations
      let completedCount = 0;
      const totalAnimations = Object.keys(exitProp).length;

      const checkComplete = () => {
        completedCount++;
        if (completedCount >= totalAnimations) {
          presenceContext.onExitComplete();
        }
      };

      // Start exit animations
      for (const [key, descriptor] of Object.entries(exitProp)) {
        const value = animateValuesRef.current[key];
        if (!value) {
          checkComplete();
          continue;
        }

        // Add onComplete callback to track when animation finishes
        const exitDescriptor: Descriptor = {
          ...descriptor,
          options: {
            ...descriptor.options,
            onComplete: () => {
              descriptor.options?.onComplete?.();
              checkComplete();
            },
          },
        };

        const controller = buildAnimation(value, exitDescriptor);
        controllersRef.current.push(controller);
        controller.start();
      }
    }, [presenceContext?.isExiting]);

    const { animate: _, exit: __, ...domProps } = props;

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

