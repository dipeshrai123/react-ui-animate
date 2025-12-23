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

