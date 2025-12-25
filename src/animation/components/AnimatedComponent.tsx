import {
  forwardRef,
  useLayoutEffect,
  useRef,
  createElement,
  useContext,
  useEffect,
} from 'react';

import {
  isTransformKey,
  applyAttrs,
  applyStyles,
  applyTransforms,
} from '../utils/apply';
import { AnimateValue } from '../values/AnimateValue';
import type { Descriptor, Primitive } from '../types';
import { buildAnimation } from '../drivers/builder';
import { PresenceContext } from '../modules/Presence';
import { getInitialValue } from '../utils/initialValues';
import {
  applyStateAnimation,
  type StateAnimationContext,
} from '../utils/stateAnimations';
import { setupExitAnimations } from '../utils/exitAnimations';
import type { AnimateAttributes, AnimateProp } from './types';
import { combineRefs } from './types';
import { useInView } from '../../hooks/observers/useInView';
import type { UseInViewOptions } from '../../hooks/observers/useInView';

function serializeAnimateProp(prop: AnimateProp | undefined): string {
  if (!prop) return '';
  const propRecord = prop as Record<string, Descriptor | Primitive>;
  const keys = Object.keys(propRecord).sort();
  return keys
    .map((key) => {
      const value = propRecord[key];
      if (typeof value === 'number' || typeof value === 'string') {
        return `${key}:${value}`;
      }
      if (typeof value === 'object' && value !== null && 'type' in value) {
        const desc = value as Descriptor;
        return `${key}:${desc.type}:${JSON.stringify(desc.to || '')}`;
      }
      return `${key}:unknown`;
    })
    .join('|');
}

function createAnimateValues(
  animateProp: AnimateProp,
  style: any,
  node: HTMLElement,
  computedStyle: CSSStyleDeclaration,
  existingValues: Record<string, AnimateValue<Primitive>>
): Record<string, AnimateValue<Primitive>> {
  const newValues: Record<string, AnimateValue<Primitive>> = {};

  for (const key of Object.keys(animateProp)) {
    if (existingValues[key]) {
      const initial = getInitialValue(key, style, node, computedStyle);
      existingValues[key].set(initial);
      newValues[key] = existingValues[key];
    } else {
      const initial = getInitialValue(key, style, node, computedStyle);
      newValues[key] = new AnimateValue(initial);
    }
  }

  return newValues;
}

function startAnimations(
  animateProp: AnimateProp,
  animateValues: Record<string, AnimateValue<Primitive>>,
  controllers: Array<{ cancel(): void }>
) {
  for (const [key, valueOrDescriptor] of Object.entries(animateProp)) {
    const value = animateValues[key];
    if (!value) continue;

    const descriptor: Descriptor =
      typeof valueOrDescriptor === 'number' ||
      typeof valueOrDescriptor === 'string'
        ? {
            type: 'spring',
            to: valueOrDescriptor,
            options: {},
          }
        : valueOrDescriptor;

    const controller = buildAnimation(value, descriptor);
    controllers.push(controller);
    controller.start();
  }
}

function applyStylesToNode(
  node: HTMLElement,
  style: any,
  animateValues: Record<string, AnimateValue<Primitive>>,
  rest: any
): (() => void)[] {
  const mergedStyle: Record<string, any> = { ...style };
  for (const key of Object.keys(animateValues)) {
    mergedStyle[key] = animateValues[key];
  }

  const normal: Record<string, any> = {};
  const transforms: Record<string, any> = {};
  for (const [key, value] of Object.entries(mergedStyle)) {
    (isTransformKey(key) ? transforms : normal)[key] = value;
  }

  return [
    ...applyStyles(node, normal),
    ...applyTransforms(node, mergedStyle),
    ...applyAttrs(node, rest),
  ];
}

function isFocusable(node: HTMLElement): boolean {
  return (
    node instanceof HTMLInputElement ||
    node instanceof HTMLTextAreaElement ||
    node instanceof HTMLSelectElement ||
    node instanceof HTMLButtonElement ||
    node instanceof HTMLAnchorElement ||
    node.getAttribute('tabindex') !== null
  );
}

function useEnterAnimations(
  nodeRef: React.RefObject<HTMLElement>,
  propsRef: React.MutableRefObject<AnimateAttributes<HTMLElement>>,
  animateProp: AnimateProp | undefined,
  style: any,
  isExitingRef: React.MutableRefObject<boolean>,
  animateValuesRef: React.MutableRefObject<
    Record<string, AnimateValue<Primitive>>
  >,
  controllersRef: React.MutableRefObject<Array<{ cancel(): void }>>
) {
  const presenceContext = useContext(PresenceContext);
  const cleanupRef = useRef<(() => void)[]>([]);
  const hasMountedRef = useRef(false);
  const prevAnimatePropKeyRef = useRef<string>('');
  const wasExitingRef = useRef(false);

  useLayoutEffect(() => {
    const node = nodeRef.current;
    const isExiting = presenceContext?.isExiting ?? false;

    // Track transition from exiting to entering
    const justReEntered = wasExitingRef.current && !isExiting;
    wasExitingRef.current = isExiting;

    // Don't run enter animations if exiting (check both context and ref for safety)
    if (!node || isExiting || isExitingRef.current) return;

    const { style: currentStyle = {}, ...rest } = propsRef.current;
    const isFirstMount = !hasMountedRef.current;
    const currentKey = serializeAnimateProp(animateProp);
    const valuesChanged = prevAnimatePropKeyRef.current !== currentKey;
    // Restart if first mount, values changed, or just re-entered from exit
    const shouldRestart = isFirstMount || valuesChanged || justReEntered;

    if (shouldRestart) {
      controllersRef.current.forEach((ctrl) => ctrl.cancel());
      controllersRef.current = [];

      if (animateProp) {
        const computedStyle = window.getComputedStyle(node);

        if (isFirstMount) {
          const newAnimateValues: Record<string, AnimateValue<Primitive>> = {};
          for (const key of Object.keys(animateProp)) {
            const initial = getInitialValue(
              key,
              currentStyle,
              node,
              computedStyle
            );
            newAnimateValues[key] = new AnimateValue(initial);
          }
          animateValuesRef.current = newAnimateValues;
        } else {
          animateValuesRef.current = createAnimateValues(
            animateProp,
            currentStyle,
            node,
            computedStyle,
            animateValuesRef.current
          );
        }

        startAnimations(
          animateProp,
          animateValuesRef.current,
          controllersRef.current
        );
      }
    }

    prevAnimatePropKeyRef.current = currentKey;
    cleanupRef.current.forEach((cleanup) => cleanup());
    cleanupRef.current = applyStylesToNode(
      node,
      currentStyle,
      animateValuesRef.current,
      rest
    );
    hasMountedRef.current = true;

    return () => {
      cleanupRef.current.forEach((cleanup) => cleanup());
      cleanupRef.current = [];
    };
  }, [style, animateProp, presenceContext?.isExiting]);

  useEffect(() => {
    return () => {
      controllersRef.current.forEach((ctrl) => ctrl.cancel());
      controllersRef.current = [];
    };
  }, []);
}

function useExitAnimations(
  nodeRef: React.RefObject<HTMLElement>,
  propsRef: React.MutableRefObject<AnimateAttributes<HTMLElement>>,
  isExitingRef: React.MutableRefObject<boolean>,
  animateValuesRef: React.MutableRefObject<
    Record<string, AnimateValue<Primitive>>
  >,
  enterControllersRef: React.MutableRefObject<Array<{ cancel(): void }>>
) {
  const presenceContext = useContext(PresenceContext);
  const exitControllersRef = useRef<Array<{ cancel(): void }>>([]);
  const exitCleanupRef = useRef<(() => void)[]>([]);
  const onExitCompleteRef = useRef<(() => void) | null>(null);
  const prevIsExitingRef = useRef<boolean>(false);

  // Store the latest onExitComplete callback in a ref so it's always current
  useLayoutEffect(() => {
    onExitCompleteRef.current = presenceContext?.onExitComplete ?? null;
  });

  // Use useLayoutEffect to ensure this runs in sync with useEnterAnimations
  useLayoutEffect(() => {
    const { exit: exitProp, style: currentStyle = {} } = propsRef.current;
    const node = nodeRef.current;
    const isExiting = presenceContext?.isExiting ?? false;
    const prevIsExiting = prevIsExitingRef.current;
    prevIsExitingRef.current = isExiting;

    // If not exiting, reset the flag and cancel any ongoing exit animations
    if (!isExiting) {
      if (isExitingRef.current) {
        // Child was exiting but is now re-entering - cancel exit animations only
        isExitingRef.current = false;
        exitControllersRef.current.forEach((ctrl) => ctrl.cancel());
        exitControllersRef.current = [];
        exitCleanupRef.current.forEach((cleanup) => cleanup());
        exitCleanupRef.current = [];
      }
      return;
    }

    // If already exiting, don't start another exit animation
    // Only start if we transitioned from not-exiting to exiting
    if (isExitingRef.current || !exitProp || !node) {
      return;
    }

    // Only start exit animation if we just transitioned to exiting state
    // This prevents cancelling ongoing animations when context object reference changes
    if (!prevIsExiting && isExiting) {
      isExitingRef.current = true;
      // Cancel enter animations when starting exit
      enterControllersRef.current.forEach((ctrl) => ctrl.cancel());
      enterControllersRef.current = [];

      // Clean up any previous exit subscriptions
      exitCleanupRef.current.forEach((cleanup) => cleanup());
      exitCleanupRef.current = [];

      // Setup exit animations with separate controllers
      exitCleanupRef.current = setupExitAnimations({
        exitProp,
        animateValues: animateValuesRef.current,
        controllers: exitControllersRef.current,
        onExitComplete: () => {
          // Only call onExitComplete if we're still exiting
          // (child might have been re-added during exit animation)
          if (isExitingRef.current && onExitCompleteRef.current) {
            exitCleanupRef.current.forEach((cleanup) => cleanup());
            exitCleanupRef.current = [];
            isExitingRef.current = false;
            onExitCompleteRef.current();
          }
        },
        node,
        style: currentStyle,
      });
    }

    // Cleanup function - only runs when isExiting changes or on unmount
    return () => {
      // Only clean up if we're actually exiting (prevents cancelling on every render)
      // This handles the unmount case where we need to clean up
      if (isExitingRef.current) {
        exitControllersRef.current.forEach((ctrl) => ctrl.cancel());
        exitControllersRef.current = [];
        exitCleanupRef.current.forEach((cleanup) => cleanup());
        exitCleanupRef.current = [];
      }
    };
  }, [presenceContext?.isExiting]);
}

function useViewAnimations(
  nodeRef: React.RefObject<HTMLElement>,
  propsRef: React.MutableRefObject<AnimateAttributes<HTMLElement>>,
  view: AnimateProp | undefined,
  viewOptions: UseInViewOptions | undefined,
  animateValuesRef: React.MutableRefObject<
    Record<string, AnimateValue<Primitive>>
  >
) {
  const stateControllersRef = useRef<Array<{ cancel(): void }>>([]);
  const initialValuesRef = useRef<Record<string, Primitive>>({});
  const isInView = useInView(nodeRef, viewOptions || {});

  const applyViewAnimationWrapper = (isActive: boolean) => {
    if (!view) return;

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
      cleanup: [],
    };

    applyStateAnimation(view, isActive, context);
  };

  useEffect(() => {
    if (!view) return;

    // Apply animation based on view state
    applyViewAnimationWrapper(isInView);

    return () => {
      stateControllersRef.current.forEach((ctrl) => ctrl.cancel());
      stateControllersRef.current = [];
    };
  }, [isInView, view]);

  useEffect(() => {
    return () => {
      stateControllersRef.current.forEach((ctrl) => ctrl.cancel());
      stateControllersRef.current = [];
    };
  }, []);
}

function useStateAnimations(
  nodeRef: React.RefObject<HTMLElement>,
  propsRef: React.MutableRefObject<AnimateAttributes<HTMLElement>>,
  hover: AnimateProp | undefined,
  press: AnimateProp | undefined,
  focus: AnimateProp | undefined,
  animateValuesRef: React.MutableRefObject<
    Record<string, AnimateValue<Primitive>>
  >
) {
  const stateControllersRef = useRef<Array<{ cancel(): void }>>([]);
  const initialValuesRef = useRef<Record<string, Primitive>>({});
  const stateRef = useRef({
    isHovered: false,
    isTapped: false,
    isFocused: false,
  });

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
      cleanup: [],
    };

    applyStateAnimation(stateProp, isActive, context);
  };

  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;

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

    const handleMouseDown = () => {
      if (stateRef.current.isTapped) return;
      stateRef.current.isTapped = true;
      applyStateAnimationWrapper(press, true);
    };

    const handleMouseUp = () => {
      if (!stateRef.current.isTapped) return;
      stateRef.current.isTapped = false;
      applyStateAnimationWrapper(press, false);
      // Re-apply hover if still active
      if (stateRef.current.isHovered && hover) {
        applyStateAnimationWrapper(hover, true);
      }
    };

    const handleMouseLeaveForPress = () => {
      if (stateRef.current.isTapped) {
        stateRef.current.isTapped = false;
        applyStateAnimationWrapper(press, false);
        // Re-apply hover if still active
        if (stateRef.current.isHovered && hover) {
          applyStateAnimationWrapper(hover, true);
        }
      }
    };

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

    if (hover) {
      node.addEventListener('mouseenter', handleMouseEnter);
      node.addEventListener('mouseleave', handleMouseLeave);
    }

    if (press) {
      node.addEventListener('mousedown', handleMouseDown);
      node.addEventListener('mouseup', handleMouseUp);
      node.addEventListener('mouseleave', handleMouseLeaveForPress);
      node.addEventListener('touchstart', handleMouseDown);
      node.addEventListener('touchend', handleMouseUp);
      node.addEventListener('touchcancel', handleMouseLeaveForPress);
    }

    if (focus && isFocusable(node)) {
      node.addEventListener('focus', handleFocus);
      node.addEventListener('blur', handleBlur);
    }

    return () => {
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

      stateControllersRef.current.forEach((ctrl) => ctrl.cancel());
      stateControllersRef.current = [];
    };
  }, [hover, press, focus]);

  useEffect(() => {
    return () => {
      stateControllersRef.current.forEach((ctrl) => ctrl.cancel());
      stateControllersRef.current = [];
    };
  }, []);
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
    const isExitingRef = useRef(false);

    propsRef.current = props;

    // Create refs that will be shared between hooks
    const animateValuesRef = useRef<Record<string, AnimateValue<Primitive>>>(
      {}
    );
    const enterControllersRef = useRef<Array<{ cancel(): void }>>([]);

    // Exit animations hook must run FIRST to reset isExitingRef before enter animations check it
    useExitAnimations(
      nodeRef,
      propsRef,
      isExitingRef,
      animateValuesRef,
      enterControllersRef
    );

    // Enter animations hook runs SECOND, after exit has reset state
    useEnterAnimations(
      nodeRef,
      propsRef,
      props.animate,
      props.style,
      isExitingRef,
      animateValuesRef,
      enterControllersRef
    );

    useStateAnimations(
      nodeRef,
      propsRef,
      props.hover,
      props.press,
      props.focus,
      animateValuesRef
    );

    useViewAnimations(
      nodeRef,
      propsRef,
      props.view,
      props.viewOptions,
      animateValuesRef
    );

    const {
      animate: _,
      exit: __,
      hover: ___,
      press: ____,
      focus: _____,
      view: ______,
      viewOptions: _______,
      style,
      ...restProps
    } = props;

    // Filter out transform keys from style since we handle them via transform property
    // Also filter out keys that are being animated
    const filteredStyle: Record<string, any> = {};
    const animatedKeys = new Set([
      ...Object.keys(animateValuesRef.current),
      ...(props.animate ? Object.keys(props.animate) : []),
    ]);

    if (style) {
      for (const [key, value] of Object.entries(style)) {
        // Skip transform keys - we handle these via node.style.transform
        if (isTransformKey(key)) continue;
        // Skip animated keys - we handle these via AnimateValue subscriptions
        if (animatedKeys.has(key)) continue;
        // Skip AnimateValue objects
        if (value && typeof value === 'object' && 'subscribe' in value)
          continue;
        filteredStyle[key] = value;
      }
    }

    return createElement(tag, {
      ...restProps,
      style: filteredStyle,
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
