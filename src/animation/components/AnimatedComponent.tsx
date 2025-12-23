import { forwardRef, useLayoutEffect, useRef, createElement, useContext, useEffect } from 'react';

import { isTransformKey, applyAttrs, applyStyles, applyTransforms } from '../utils/apply';
import { AnimateValue } from '../values/AnimateValue';
import type { Descriptor, Primitive } from '../types';
import { buildAnimation } from '../drivers/builder';
import { PresenceContext } from '../modules/Presence';
import { getInitialValue } from '../utils/initialValues';
import { applyStateAnimation, type StateAnimationContext } from '../utils/stateAnimations';
import { setupExitAnimations } from '../utils/exitAnimations';
import type { AnimateAttributes, AnimateProp } from './types';
import { combineRefs } from './types';

// Deep comparison function for animate props
// Compares by value, not reference, to avoid restarting animations on re-renders
function areAnimatePropsEqual(
  prev: AnimateProp | undefined,
  next: AnimateProp | undefined
): boolean {
  // Both undefined or null
  if (!prev && !next) return true;
  if (!prev || !next) return false;

  const prevKeys = Object.keys(prev);
  const nextKeys = Object.keys(next);

  // Different number of keys
  if (prevKeys.length !== nextKeys.length) return false;

  // Compare each property
  for (const key of prevKeys) {
    if (!(key in next)) return false;

    const prevValue = (prev as Record<string, Descriptor | Primitive>)[key];
    const nextValue = (next as Record<string, Descriptor | Primitive>)[key];

    // Both primitives - direct comparison
    if (
      (typeof prevValue === 'number' || typeof prevValue === 'string') &&
      (typeof nextValue === 'number' || typeof nextValue === 'string')
    ) {
      if (prevValue !== nextValue) return false;
      continue;
    }

    // Both descriptors - deep comparison
    if (
      typeof prevValue === 'object' &&
      prevValue !== null &&
      typeof nextValue === 'object' &&
      nextValue !== null
    ) {
      const prevDesc = prevValue as Descriptor;
      const nextDesc = nextValue as Descriptor;

      // Compare type
      if (prevDesc.type !== nextDesc.type) return false;

      // Compare 'to' value
      if (prevDesc.to !== nextDesc.to) {
        // Handle arrays
        if (Array.isArray(prevDesc.to) && Array.isArray(nextDesc.to)) {
          if (prevDesc.to.length !== nextDesc.to.length) return false;
          for (let i = 0; i < prevDesc.to.length; i++) {
            if (prevDesc.to[i] !== nextDesc.to[i]) return false;
          }
        } else if (
          typeof prevDesc.to === 'object' &&
          prevDesc.to !== null &&
          typeof nextDesc.to === 'object' &&
          nextDesc.to !== null
        ) {
          // Handle objects
          const prevToObj = prevDesc.to as Record<string, Primitive>;
          const nextToObj = nextDesc.to as Record<string, Primitive>;
          const prevToKeys = Object.keys(prevToObj);
          const nextToKeys = Object.keys(nextToObj);
          if (prevToKeys.length !== nextToKeys.length) return false;
          for (const k of prevToKeys) {
            if (prevToObj[k] !== nextToObj[k]) return false;
          }
        } else {
          return false;
        }
      }

      // Compare options (excluding callbacks which are functions)
      const prevOptions = prevDesc.options || {};
      const nextOptions = nextDesc.options || {};

      // Get all option keys (excluding callbacks)
      const optionKeys = new Set([
        ...Object.keys(prevOptions),
        ...Object.keys(nextOptions),
      ]);
      const callbackKeys = ['onStart', 'onChange', 'onComplete'];

      for (const optKey of optionKeys) {
        // Skip callback functions
        if (callbackKeys.includes(optKey)) continue;

        // Handle nested animations in sequences/loops
        if (optKey === 'animations' && Array.isArray(prevOptions.animations) && Array.isArray(nextOptions.animations)) {
          if (prevOptions.animations.length !== nextOptions.animations.length) return false;
          // For simplicity, we'll do a shallow check on nested animations
          // Full deep comparison would be recursive and more complex
          continue;
        }
        if (optKey === 'animation' && prevOptions.animation && nextOptions.animation) {
          // For loop animations, we'll do a shallow check
          continue;
        }

        const prevOptValue = (prevOptions as Record<string, any>)[optKey];
        const nextOptValue = (nextOptions as Record<string, any>)[optKey];
        if (prevOptValue !== nextOptValue) {
          // Special handling for easing functions - compare by string representation
          if (optKey === 'easing' && typeof prevOptValue === 'function' && typeof nextOptValue === 'function') {
            if (prevOptValue.toString() !== nextOptValue.toString()) return false;
          } else {
            return false;
          }
        }
      }
    } else {
      // One is primitive, one is descriptor - not equal
      return false;
    }
  }

  return true;
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
    const prevAnimatePropRef = useRef<AnimateProp | undefined>(undefined);

    // Get presence context for AnimatePresence integration
    const presenceContext = useContext(PresenceContext);

    propsRef.current = props;

    // Handle enter animations - run on mount and when animate prop changes
    useLayoutEffect(() => {
      const node = nodeRef.current;
      if (!node) return;

      // Don't run enter animations if we're exiting
      if (isExitingRef.current) return;

      const { style = {}, animate: animateProp, ...rest } = propsRef.current;
      const isFirstMount = !hasMountedRef.current;

      // Check if animate prop actually changed (by value, not reference)
      const animatePropChanged = !areAnimatePropsEqual(
        prevAnimatePropRef.current,
        animateProp
      );

      // Only restart animations if this is the first mount or the animate prop actually changed
      if (isFirstMount || animatePropChanged) {
        // Cancel any existing animations
        controllersRef.current.forEach((ctrl) => ctrl.cancel());
        controllersRef.current = [];

        if (animateProp) {
          const computedStyle = window.getComputedStyle(node);
          
          // On first mount: create new AnimateValues
          // On subsequent updates: reuse existing or create new ones
          if (isFirstMount) {
            const newAnimateValues: Record<string, AnimateValue<Primitive>> = {};

            // Create AnimateValues for each animated property
            for (const key of Object.keys(animateProp)) {
              const initial = getInitialValue(key, style, node, computedStyle);
              const value = new AnimateValue(initial);
              newAnimateValues[key] = value;
            }

            animateValuesRef.current = newAnimateValues;
          } else {
            // On updates: reset existing values to initial and create new ones for new properties
            for (const key of Object.keys(animateProp)) {
              if (!animateValuesRef.current[key]) {
                // Create new AnimateValue for new property
                const initial = getInitialValue(key, style, node, computedStyle);
                animateValuesRef.current[key] = new AnimateValue(initial);
              } else {
                // Reset existing AnimateValue to initial value
                const initial = getInitialValue(key, style, node, computedStyle);
                animateValuesRef.current[key].set(initial);
              }
            }
          }

          // Build and start animations
          for (const [key, valueOrDescriptor] of Object.entries(animateProp)) {
            const value = animateValuesRef.current[key];
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

        // Update the previous animate prop reference
        prevAnimatePropRef.current = animateProp;
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
    }, [props.style, props.animate]);

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

      // Setup exit animations
      setupExitAnimations({
        exitProp,
        animateValues: animateValuesRef.current,
        controllers: controllersRef.current,
        onExitComplete: () => {
          presenceContext.onExitComplete();
        },
      });
    }, [presenceContext?.isExiting]);

    // Helper function to apply state animations
    const applyStateAnimationWrapper = (
      stateProp: AnimateProp | undefined,
      isActive: boolean
    ) => {
      if (!stateProp) return;

      const node = nodeRef.current;
      if (!node) return;

      const computedStyle = window.getComputedStyle(node);
      const { style = {} } = propsRef.current;

      const context: StateAnimationContext = {
        node,
        style,
        computedStyle,
        animateValues: animateValuesRef.current,
        initialValues: initialValuesRef.current,
        stateControllers: stateControllersRef.current,
        cleanup: cleanupRef.current,
      };

      applyStateAnimation(stateProp, isActive, context);
    };

    // Handle state changes
    useEffect(() => {
      const node = nodeRef.current;
      if (!node) return;

      const { hover, press, focus } = propsRef.current;

      // Handle hover state
      const handleMouseEnter = () => {
        if (stateRef.current.isHovered) return;
        stateRef.current.isHovered = true;
        applyStateAnimationWrapper(hover, true);
      };

      const handleMouseLeave = () => {
        if (!stateRef.current.isHovered) return;
        stateRef.current.isHovered = false;
        applyStateAnimationWrapper(hover, false);
      };

      // Handle press state
      const handleMouseDown = () => {
        if (stateRef.current.isTapped) return;
        stateRef.current.isTapped = true;
        applyStateAnimationWrapper(press, true);
      };

      const handleMouseUp = () => {
        if (!stateRef.current.isTapped) return;
        stateRef.current.isTapped = false;
        applyStateAnimationWrapper(press, false);
      };

      const handleMouseLeaveForPress = () => {
        if (stateRef.current.isTapped) {
          stateRef.current.isTapped = false;
          applyStateAnimationWrapper(press, false);
        }
      };

      // Handle focus state
      const handleFocus = () => {
        if (stateRef.current.isFocused) return;
        stateRef.current.isFocused = true;
        applyStateAnimationWrapper(focus, true);
      };

      const handleBlur = () => {
        if (!stateRef.current.isFocused) return;
        stateRef.current.isFocused = false;
        applyStateAnimationWrapper(focus, false);
      };

      // Add event listeners
      if (hover) {
        node.addEventListener('mouseenter', handleMouseEnter);
        node.addEventListener('mouseleave', handleMouseLeave);
      }

      if (press) {
        node.addEventListener('mousedown', handleMouseDown);
        node.addEventListener('mouseup', handleMouseUp);
        node.addEventListener('mouseleave', handleMouseLeaveForPress);
        // Also handle touch events for mobile
        node.addEventListener('touchstart', handleMouseDown);
        node.addEventListener('touchend', handleMouseUp);
        node.addEventListener('touchcancel', handleMouseLeaveForPress);
      }

      if (focus) {
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
        if (hover) {
          node.removeEventListener('mouseenter', handleMouseEnter);
          node.removeEventListener('mouseleave', handleMouseLeave);
        }

        if (press) {
          node.removeEventListener('mousedown', handleMouseDown);
          node.removeEventListener('mouseup', handleMouseUp);
          node.removeEventListener('mouseleave', handleMouseLeaveForPress);
          node.removeEventListener('touchstart', handleMouseDown);
          node.removeEventListener('touchend', handleMouseUp);
          node.removeEventListener('touchcancel', handleMouseLeaveForPress);
        }

        if (focus) {
          node.removeEventListener('focus', handleFocus);
          node.removeEventListener('blur', handleBlur);
        }

        // Cancel state animations on cleanup
        stateControllersRef.current.forEach((ctrl) => ctrl.cancel());
        stateControllersRef.current = [];
      };
    }, [props.hover, props.press, props.focus]);

    // Cleanup state animations on unmount
    useEffect(() => {
      return () => {
        stateControllersRef.current.forEach((ctrl) => ctrl.cancel());
        stateControllersRef.current = [];
      };
    }, []);

    const { animate: _, exit: __, hover: ___, press: ____, focus: _____, ...domProps } = props;

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

