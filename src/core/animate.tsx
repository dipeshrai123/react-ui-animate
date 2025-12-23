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
  [K in keyof AnimateStyle]?: Descriptor | Primitive;
};

type AnimateAttributes<T extends EventTarget> = Omit<
  AnimateHTMLAttributes<T> & AnimateSVGAttributes<T>,
  'style' | 'animate' | 'exit' | 'whileHover' | 'whileTap' | 'whileFocus'
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
   * Animations to apply when the element is hovered.
   */
  whileHover?: AnimateProp;
  /**
   * Animations to apply when the element is tapped/pressed.
   */
  whileTap?: AnimateProp;
  /**
   * Animations to apply when the element is focused.
   */
  whileFocus?: AnimateProp;
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

// Helper to check if a property should always be numeric
function isNumericProperty(key: string): boolean {
  // Transform properties should be numeric
  if (isTransformKey(key)) return true;
  // Opacity should be numeric
  if (key === 'opacity') return true;
  // Z-index should be numeric
  if (key === 'zIndex') return true;
  return false;
}

// Helper to get initial value for a property
function getInitialValue(
  key: string,
  style: any,
  node: HTMLElement,
  computedStyle: CSSStyleDeclaration
): Primitive {
  const shouldBeNumeric = isNumericProperty(key);
  
  // Prioritize static value from style prop
  const staticValue = getStaticStyleValue(style, key);
  if (staticValue !== null) {
    // Ensure numeric properties are always numbers
    if (shouldBeNumeric && typeof staticValue === 'string') {
      const num = parseFloat(staticValue);
      return isNaN(num) ? getDefaultInitialValue(key) : num;
    }
    return staticValue;
  }
  
  // Fall back to inline style
  const inlineValue = (node.style as any)[key];
  if (inlineValue) {
    // For numeric properties, always parse to number
    if (shouldBeNumeric) {
      const num = parseFloat(inlineValue);
      return isNaN(num) ? getDefaultInitialValue(key) : num;
    }
    // Preserve strings with units for non-numeric properties
    if (hasUnit(inlineValue)) return inlineValue;
    const num = parseFloat(inlineValue);
    return isNaN(num) ? inlineValue : num;
  }
  
  // Fall back to computed style
  const computedValue = computedStyle.getPropertyValue(
    key.replace(/([A-Z])/g, '-$1').toLowerCase()
  );
  if (computedValue) {
    // For numeric properties, always parse to number
    if (shouldBeNumeric) {
      const num = parseFloat(computedValue);
      return isNaN(num) ? getDefaultInitialValue(key) : num;
    }
    // Preserve strings with units for non-numeric properties
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
    const stateControllersRef = useRef<Array<{ cancel(): void }>>([]);
    const isExitingRef = useRef(false);
    const hasMountedRef = useRef(false);
    const stateRef = useRef<{
      isHovered: boolean;
      isTapped: boolean;
      isFocused: boolean;
    }>({
      isHovered: false,
      isTapped: false,
      isFocused: false,
    });
    const initialValuesRef = useRef<Record<string, Primitive>>({});

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
        for (const [key, valueOrDescriptor] of Object.entries(animateProp)) {
          const value = newAnimateValues[key];
          if (!value) continue;

          // Convert primitive values to timing descriptors for convenience
          const descriptor: Descriptor = 
            typeof valueOrDescriptor === 'number' || typeof valueOrDescriptor === 'string'
              ? {
                  type: 'timing',
                  to: valueOrDescriptor,
                  options: {
                    duration: 300,
                  },
                }
              : valueOrDescriptor;

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
      // Include all AnimateValues (from animate prop and state animations)
      for (const key of Object.keys(animateValuesRef.current)) {
        mergedStyle[key] = animateValuesRef.current[key];
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
      const { exit: exitProp } = propsRef.current;
      
      // Only participate in exit animation flow if this component has an exit prop
      // Nested animate.divs without exit props should NOT call onExitComplete,
      // otherwise they would prematurely remove the parent element
      if (!exitProp) return;
      
      if (!presenceContext?.isExiting || isExitingRef.current) return;

      isExitingRef.current = true;

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
      for (const [key, valueOrDescriptor] of Object.entries(exitProp)) {
        const value = animateValuesRef.current[key];
        if (!value) {
          checkComplete();
          continue;
        }

        // Convert primitive values to timing descriptors for convenience
        const baseDescriptor: Descriptor = 
          typeof valueOrDescriptor === 'number' || typeof valueOrDescriptor === 'string'
            ? {
                type: 'timing',
                to: valueOrDescriptor,
                options: {
                  duration: 300,
                },
              }
            : valueOrDescriptor;

        // Add onComplete callback to track when animation finishes
        const exitDescriptor: Descriptor = {
          ...baseDescriptor,
          options: {
            ...baseDescriptor.options,
            onComplete: () => {
              baseDescriptor.options?.onComplete?.();
              checkComplete();
            },
          },
        };

        const controller = buildAnimation(value, exitDescriptor);
        controllersRef.current.push(controller);
        controller.start();
      }
    }, [presenceContext?.isExiting]);

    // Helper function to apply state animations
    const applyStateAnimation = (
      stateProp: AnimateProp | undefined,
      isActive: boolean
    ) => {
      if (!stateProp) return;

      const node = nodeRef.current;
      if (!node) return;

      // Cancel any existing state animations
      stateControllersRef.current.forEach((ctrl) => ctrl.cancel());
      stateControllersRef.current = [];

      const computedStyle = window.getComputedStyle(node);
      const { style = {} } = propsRef.current;
      const newSubscriptions: (() => void)[] = [];

      // For each property in the state animation
      for (const [key, valueOrDescriptor] of Object.entries(stateProp)) {
        // Get or create AnimateValue for this property
        let value = animateValuesRef.current[key];
        
        if (!value) {
          // Create a new AnimateValue if it doesn't exist
          const initial = getInitialValue(key, style, node, computedStyle);
          value = new AnimateValue(initial);
          animateValuesRef.current[key] = value;
          
          // Store the initial value immediately for state animations
          initialValuesRef.current[key] = initial;
          
          // Manually subscribe to the new AnimateValue
          if (isTransformKey(key)) {
            // For transforms, we need to re-render all transforms
            // So we'll trigger a full transform update
            const render = () => {
              const transformKeyList = Object.keys(animateValuesRef.current).filter(isTransformKey);
              if (transformKeyList.length > 0) {
                const parts = transformKeyList.map((k) => {
                  const v = animateValuesRef.current[k];
                  if (!v) return '';
                  const cur = v.current;
                  const str = String(cur);
                  const numMatch = str.match(/-?\d+(\.\d+)?/)?.[0] ?? '0';
                  const unitMatch = str.match(/px|rem|em|ex|%|cm|mm|in|pt|pc|ch|vh|vw|vmin|vmax|deg/)?.[0] ?? '';
                  let unit = unitMatch;
                  if (!unit) {
                    if (k === 'perspective' || k.startsWith('translate')) unit = 'px';
                    else if (k.startsWith('rotate') || k.startsWith('skew')) unit = 'deg';
                  }
                  return `${k}(${numMatch}${unit})`;
                });
                node.style.transform = parts.join(' ');
              }
            };
            newSubscriptions.push(value.subscribe(render));
            render(); // Initial render
          } else {
            // For normal styles, subscribe directly
            newSubscriptions.push(
              value.subscribe((v) => {
                const css = typeof v === 'number' && 
                  !['opacity', 'zIndex', 'fontWeight', 'lineHeight'].includes(key)
                  ? `${v}px` 
                  : String(v);
                (node.style as any)[key] = css;
              })
            );
          }
        } else {
          // If value already exists, ensure we have the initial value stored
          // This handles the case where the value was created by the animate prop
          if (!(key in initialValuesRef.current)) {
            // Store the current value as the initial for state animations
            // This ensures we revert to the value before state animation starts
            initialValuesRef.current[key] = value.current;
          }
        }

        // Check if it's a raw primitive (set immediately) or a descriptor (animate)
        const isPrimitive = typeof valueOrDescriptor === 'number' || typeof valueOrDescriptor === 'string';
        
        if (isActive) {
          if (isPrimitive) {
            // Set immediately without animation
            value.set(valueOrDescriptor);
          } else {
            // Animate to the state animation target
            const controller = buildAnimation(value, valueOrDescriptor);
            stateControllersRef.current.push(controller);
            controller.start();
          }
        } else {
          // Revert to initial value
          const initialValue = initialValuesRef.current[key];
          
          if (isPrimitive) {
            // If the original was a primitive (set immediately), revert immediately too
            value.set(initialValue);
          } else {
            // Animate back to initial value
            const revertDescriptor: Descriptor = {
              type: 'timing',
              to: initialValue,
              options: {
                duration: 200,
                easing: (t) => t * (2 - t), // ease-out
              },
            };
            
            const controller = buildAnimation(value, revertDescriptor);
            stateControllersRef.current.push(controller);
            controller.start();
          }
        }
      }

      // Add new subscriptions to cleanup
      cleanupRef.current.push(...newSubscriptions);
    };

    // Handle state changes
    useEffect(() => {
      const node = nodeRef.current;
      if (!node) return;

      const { whileHover, whileTap, whileFocus } = propsRef.current;

      // Handle hover state
      const handleMouseEnter = () => {
        if (stateRef.current.isHovered) return;
        stateRef.current.isHovered = true;
        applyStateAnimation(whileHover, true);
      };

      const handleMouseLeave = () => {
        if (!stateRef.current.isHovered) return;
        stateRef.current.isHovered = false;
        applyStateAnimation(whileHover, false);
      };

      // Handle tap state
      const handleMouseDown = () => {
        if (stateRef.current.isTapped) return;
        stateRef.current.isTapped = true;
        applyStateAnimation(whileTap, true);
      };

      const handleMouseUp = () => {
        if (!stateRef.current.isTapped) return;
        stateRef.current.isTapped = false;
        applyStateAnimation(whileTap, false);
      };

      const handleMouseLeaveForTap = () => {
        if (stateRef.current.isTapped) {
          stateRef.current.isTapped = false;
          applyStateAnimation(whileTap, false);
        }
      };

      // Handle focus state
      const handleFocus = () => {
        if (stateRef.current.isFocused) return;
        stateRef.current.isFocused = true;
        applyStateAnimation(whileFocus, true);
      };

      const handleBlur = () => {
        if (!stateRef.current.isFocused) return;
        stateRef.current.isFocused = false;
        applyStateAnimation(whileFocus, false);
      };

      // Add event listeners
      if (whileHover) {
        node.addEventListener('mouseenter', handleMouseEnter);
        node.addEventListener('mouseleave', handleMouseLeave);
      }

      if (whileTap) {
        node.addEventListener('mousedown', handleMouseDown);
        node.addEventListener('mouseup', handleMouseUp);
        node.addEventListener('mouseleave', handleMouseLeaveForTap);
        // Also handle touch events for mobile
        node.addEventListener('touchstart', handleMouseDown);
        node.addEventListener('touchend', handleMouseUp);
        node.addEventListener('touchcancel', handleMouseLeaveForTap);
      }

      if (whileFocus) {
        // Only add focus listeners if element is focusable
        if (
          node instanceof HTMLInputElement ||
          node instanceof HTMLTextAreaElement ||
          node instanceof HTMLSelectElement ||
          node instanceof HTMLButtonElement ||
          node instanceof HTMLAnchorElement ||
          node.getAttribute('tabindex') !== null
        ) {
          node.addEventListener('focus', handleFocus);
          node.addEventListener('blur', handleBlur);
        }
      }

      return () => {
        // Cleanup event listeners
        if (whileHover) {
          node.removeEventListener('mouseenter', handleMouseEnter);
          node.removeEventListener('mouseleave', handleMouseLeave);
        }

        if (whileTap) {
          node.removeEventListener('mousedown', handleMouseDown);
          node.removeEventListener('mouseup', handleMouseUp);
          node.removeEventListener('mouseleave', handleMouseLeaveForTap);
          node.removeEventListener('touchstart', handleMouseDown);
          node.removeEventListener('touchend', handleMouseUp);
          node.removeEventListener('touchcancel', handleMouseLeaveForTap);
        }

        if (whileFocus) {
          node.removeEventListener('focus', handleFocus);
          node.removeEventListener('blur', handleBlur);
        }

        // Cancel state animations on cleanup
        stateControllersRef.current.forEach((ctrl) => ctrl.cancel());
        stateControllersRef.current = [];
      };
    }, [props.whileHover, props.whileTap, props.whileFocus]);

    // Cleanup state animations on unmount
    useEffect(() => {
      return () => {
        stateControllersRef.current.forEach((ctrl) => ctrl.cancel());
        stateControllersRef.current = [];
      };
    }, []);

    const { animate: _, exit: __, whileHover: ___, whileTap: ____, whileFocus: _____, ...domProps } = props;

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

