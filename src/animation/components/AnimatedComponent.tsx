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
  applyStyleProp,
  applyTransforms,
  createTransformRenderer,
  formatTransformString,
} from '../utils/apply';
import { AnimateValue } from '../values/AnimateValue';
import type { Descriptor, Primitive } from '../types';
import { buildAnimation } from '../drivers/builder';
import { UnmountContext } from '../presence/Unmount';
import { getInitialValue } from './initialValues';
import {
  applyStateAnimation,
  extractRestingTarget,
  type StateAnimationContext,
} from './stateAnimations';
import { setupUnmountAnimations } from './unmountAnimations';
import {
  useFlipAnimations,
  useFlipIdAnimations,
} from '../layout';
import type { AnimateAttributes, AnimateProp } from './types';
import { combineRefs } from './types';
import { useInView, type UseInViewOptions } from '../../shared/hooks';

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

function useSyncAnimatedStyles(
  nodeRef: React.RefObject<HTMLElement>,
  animateValuesRef: React.MutableRefObject<
    Record<string, AnimateValue<Primitive>>
  >
) {
  useLayoutEffect(() => {
    const node = nodeRef.current;
    if (!node) return;

    for (const [key, value] of Object.entries(animateValuesRef.current)) {
      if (isTransformKey(key)) continue;
      applyStyleProp(node, key, value.current);
    }
  });
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
  isExitingRef: React.MutableRefObject<boolean>,
  animateValuesRef: React.MutableRefObject<
    Record<string, AnimateValue<Primitive>>
  >,
  controllersRef: React.MutableRefObject<Array<{ cancel(): void }>>
) {
  const unmountContext = useContext(UnmountContext);
  const cleanupRef = useRef<(() => void)[]>([]);
  const hasMountedRef = useRef(false);
  const prevAnimatePropKeyRef = useRef<string>('');
  const wasExitingRef = useRef(false);

  useLayoutEffect(() => {
    const node = nodeRef.current;
    const isExiting = unmountContext?.isExiting ?? false;

    const justReEntered = wasExitingRef.current && !isExiting;
    wasExitingRef.current = isExiting;

    if (!node || isExiting || isExitingRef.current) return;

    const { style: currentStyle = {}, ...rest } = propsRef.current;
    const currentKey = serializeAnimateProp(animateProp);
    const valuesChanged = prevAnimatePropKeyRef.current !== currentKey;

    const isFirstMount = !hasMountedRef.current;
    const shouldRestart = isFirstMount || valuesChanged || justReEntered;

    if (shouldRestart) {
      controllersRef.current.forEach((ctrl) => ctrl.cancel());
      controllersRef.current = [];

      if (animateProp) {
        const computedStyle = window.getComputedStyle(node);

        if (Object.keys(animateValuesRef.current).length === 0) {
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
        }

        startAnimations(
          animateProp,
          animateValuesRef.current,
          controllersRef.current
        );
      }
    }

    cleanupRef.current.forEach((cleanup) => cleanup());
    cleanupRef.current = applyStylesToNode(
      node,
      currentStyle,
      animateValuesRef.current,
      rest
    );

    prevAnimatePropKeyRef.current = currentKey;
    hasMountedRef.current = true;

    return () => {
      cleanupRef.current.forEach((cleanup) => cleanup());
      cleanupRef.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- style omitted intentionally; refs are stable
  }, [animateProp, unmountContext?.isExiting]);
}

function useUnmountAnimations(
  nodeRef: React.RefObject<HTMLElement>,
  propsRef: React.MutableRefObject<AnimateAttributes<HTMLElement>>,
  isExitingRef: React.MutableRefObject<boolean>,
  animateValuesRef: React.MutableRefObject<
    Record<string, AnimateValue<Primitive>>
  >,
  enterControllersRef: React.MutableRefObject<Array<{ cancel(): void }>>
) {
  const unmountContext = useContext(UnmountContext);
  const exitControllersRef = useRef<Array<{ cancel(): void }>>([]);
  const exitCleanupRef = useRef<(() => void)[]>([]);
  const onExitCompleteRef = useRef<(() => void) | null>(null);
  const prevIsExitingRef = useRef<boolean>(false);

  useLayoutEffect(() => {
    onExitCompleteRef.current = unmountContext?.onExitComplete ?? null;
  });

  // useLayoutEffect (not useEffect) so this runs in sync with useEnterAnimations.
  useLayoutEffect(() => {
    const { unmount: unmountProp, style: currentStyle = {} } = propsRef.current;
    const node = nodeRef.current;
    const isExiting = unmountContext?.isExiting ?? false;
    const prevIsExiting = prevIsExitingRef.current;
    prevIsExitingRef.current = isExiting;

    if (!isExiting) {
      if (isExitingRef.current) {
        isExitingRef.current = false;
        exitControllersRef.current.forEach((ctrl) => ctrl.cancel());
        exitControllersRef.current = [];
        exitCleanupRef.current.forEach((cleanup) => cleanup());
        exitCleanupRef.current = [];
      }
      return;
    }

    if (isExitingRef.current || !unmountProp || !node) {
      return;
    }

    if (!prevIsExiting && isExiting) {
      isExitingRef.current = true;
      unmountContext?.registerExit();
      enterControllersRef.current.forEach((ctrl) => ctrl.cancel());
      enterControllersRef.current = [];

      exitCleanupRef.current.forEach((cleanup) => cleanup());
      exitCleanupRef.current = [];

      exitCleanupRef.current = setupUnmountAnimations({
        exitProp: unmountProp,
        animateValues: animateValuesRef.current,
        controllers: exitControllersRef.current,
        onExitComplete: () => {
          // Guards against a child re-added mid-exit before this fires.
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

    return () => {
      if (isExitingRef.current) {
        exitControllersRef.current.forEach((ctrl) => ctrl.cancel());
        exitControllersRef.current = [];
        exitCleanupRef.current.forEach((cleanup) => cleanup());
        exitCleanupRef.current = [];
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refs are stable
  }, [unmountContext?.isExiting]);
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
  const cleanupRef = useRef<Array<() => void>>([]);
  const isInView = useInView(nodeRef, viewOptions || {});
  const hasInitializedRef = useRef(false);

  // Applies initial values before any animation runs to avoid a flash of default styles.
  useLayoutEffect(() => {
    if (!view) return;

    const node = nodeRef.current;
    if (!node) return;

    if (hasInitializedRef.current) return;

    const computedStyle = window.getComputedStyle(node);
    const { style = {} } = propsRef.current;

    for (const key of Object.keys(view)) {
      if (!animateValuesRef.current[key]) {
        const initial = getInitialValue(key, style, node, computedStyle);
        const value = new AnimateValue(initial);
        animateValuesRef.current[key] = value;
        initialValuesRef.current[key] = initial;

        if (isTransformKey(key)) {
          const render = createTransformRenderer(
            node,
            animateValuesRef.current
          );
          render();
        } else {
          const css =
            typeof initial === 'number' &&
            !['opacity', 'zIndex', 'fontWeight', 'lineHeight'].includes(key)
              ? `${initial}px`
              : String(initial);
          (node.style as any)[key] = css;
        }
      }
    }

    hasInitializedRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refs are stable
  }, [view]);

  const applyViewAnimationWrapper = (isActive: boolean) => {
    if (!view) return;

    const node = nodeRef.current;
    if (!node) return;

    cleanupRef.current.forEach((cleanup) => cleanup());
    cleanupRef.current = [];

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

    applyStateAnimation(view, isActive, context);
  };

  useEffect(() => {
    if (!view) return;

    applyViewAnimationWrapper(isInView);

    return () => {
      stateControllersRef.current.forEach((ctrl) => ctrl.cancel());
      stateControllersRef.current = [];
      cleanupRef.current.forEach((cleanup) => cleanup());
      cleanupRef.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- wrapper only closes over view/isActive
  }, [isInView, view]);

  useEffect(() => {
    return () => {
      stateControllersRef.current.forEach((ctrl) => ctrl.cancel());
      stateControllersRef.current = [];
      cleanupRef.current.forEach((cleanup) => cleanup());
      cleanupRef.current = [];
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
  const hoverRef = useRef(hover);
  const pressRef = useRef(press);
  const focusRef = useRef(focus);
  hoverRef.current = hover;
  pressRef.current = press;
  focusRef.current = focus;

  const applyStateAnimationWrapper = (
    stateProp: AnimateProp | undefined,
    isActive: boolean
  ) => {
    if (!stateProp) return;

    const node = nodeRef.current;
    if (!node) return;

    const computedStyle = window.getComputedStyle(node);
    const { style = {}, animate: animateProp, view: viewProp } = propsRef.current;

    const restingTargets: Record<string, Primitive> = {};
    for (const key of Object.keys(stateProp)) {
      const viewRecord = viewProp as Record<string, Descriptor | Primitive> | undefined;
      const animateRecord = animateProp as Record<string, Descriptor | Primitive> | undefined;
      const target =
        (viewRecord && key in viewRecord
          ? extractRestingTarget(viewRecord[key])
          : undefined) ??
        (animateRecord && key in animateRecord
          ? extractRestingTarget(animateRecord[key])
          : undefined);
      if (target !== undefined) restingTargets[key] = target;
    }

    const context: StateAnimationContext = {
      node,
      style,
      computedStyle,
      animateValues: animateValuesRef.current,
      initialValues: initialValuesRef.current,
      stateControllers: stateControllersRef.current,
      cleanup: [],
      restingTargets,
    };

    applyStateAnimation(stateProp, isActive, context);
  };

  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;

    const handleMouseEnter = () => {
      if (stateRef.current.isHovered) return;
      stateRef.current.isHovered = true;
      applyStateAnimationWrapper(hoverRef.current, true);
    };

    const handleMouseLeave = () => {
      if (!stateRef.current.isHovered) return;
      stateRef.current.isHovered = false;
      applyStateAnimationWrapper(hoverRef.current, false);
    };

    const handleMouseDown = () => {
      if (stateRef.current.isTapped) return;
      stateRef.current.isTapped = true;
      applyStateAnimationWrapper(pressRef.current, true);
    };

    const handleMouseUp = () => {
      if (!stateRef.current.isTapped) return;
      stateRef.current.isTapped = false;
      applyStateAnimationWrapper(pressRef.current, false);
      if (stateRef.current.isHovered && hoverRef.current) {
        applyStateAnimationWrapper(hoverRef.current, true);
      }
    };

    const handleMouseLeaveForPress = () => {
      if (stateRef.current.isTapped) {
        stateRef.current.isTapped = false;
        applyStateAnimationWrapper(pressRef.current, false);
        if (stateRef.current.isHovered && hoverRef.current) {
          applyStateAnimationWrapper(hoverRef.current, true);
        }
      }
    };

    const handleFocus = () => {
      if (stateRef.current.isFocused) return;
      stateRef.current.isFocused = true;
      applyStateAnimationWrapper(focusRef.current, true);
    };

    const handleBlur = () => {
      if (!stateRef.current.isFocused) return;
      stateRef.current.isFocused = false;
      applyStateAnimationWrapper(focusRef.current, false);
    };

    if (hoverRef.current) {
      node.addEventListener('mouseenter', handleMouseEnter);
      node.addEventListener('mouseleave', handleMouseLeave);
    }

    if (pressRef.current) {
      node.addEventListener('mousedown', handleMouseDown);
      node.addEventListener('mouseup', handleMouseUp);
      node.addEventListener('mouseleave', handleMouseLeaveForPress);
      node.addEventListener('touchstart', handleMouseDown);
      node.addEventListener('touchend', handleMouseUp);
      node.addEventListener('touchcancel', handleMouseLeaveForPress);
    }

    if (focusRef.current && isFocusable(node)) {
      node.addEventListener('focus', handleFocus);
      node.addEventListener('blur', handleBlur);
    }

    if (stateRef.current.isHovered && hoverRef.current) {
      applyStateAnimationWrapper(hoverRef.current, true);
    }
    if (stateRef.current.isTapped && pressRef.current) {
      applyStateAnimationWrapper(pressRef.current, true);
    }
    if (stateRef.current.isFocused && focusRef.current) {
      applyStateAnimationWrapper(focusRef.current, true);
    }

    return () => {
      if (hoverRef.current) {
        node.removeEventListener('mouseenter', handleMouseEnter);
        node.removeEventListener('mouseleave', handleMouseLeave);
      }

      if (pressRef.current) {
        node.removeEventListener('mousedown', handleMouseDown);
        node.removeEventListener('mouseup', handleMouseUp);
        node.removeEventListener('mouseleave', handleMouseLeaveForPress);
        node.removeEventListener('touchstart', handleMouseDown);
        node.removeEventListener('touchend', handleMouseUp);
        node.removeEventListener('touchcancel', handleMouseLeaveForPress);
      }

      if (focusRef.current) {
        node.removeEventListener('focus', handleFocus);
        node.removeEventListener('blur', handleBlur);
      }

      stateControllersRef.current.forEach((ctrl) => ctrl.cancel());
      stateControllersRef.current = [];
    };
    /* eslint-disable react-hooks/exhaustive-deps -- deps are serialized structural values by design */
  }, [
    serializeAnimateProp(hover),
    serializeAnimateProp(press),
    serializeAnimateProp(focus),
  ]);
  /* eslint-enable react-hooks/exhaustive-deps */

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
    const animateValuesRef = useRef<Record<string, AnimateValue<Primitive>>>(
      {}
    );
    const enterControllersRef = useRef<Array<{ cancel(): void }>>([]);

    propsRef.current = props;

    useUnmountAnimations(
      nodeRef,
      propsRef,
      isExitingRef,
      animateValuesRef,
      enterControllersRef
    );

    useEnterAnimations(
      nodeRef,
      propsRef,
      props.animate,
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

    useFlipAnimations(nodeRef, propsRef, isExitingRef, animateValuesRef);
    useFlipIdAnimations(nodeRef, propsRef, isExitingRef, animateValuesRef);
    useSyncAnimatedStyles(nodeRef, animateValuesRef);

    const {
      animate,
      unmount: _unmount,
      hover: _hover,
      press: _press,
      focus: _focus,
      view: _view,
      viewOptions: _viewOptions,
      flip: _flip,
      flipOptions: _flipOptions,
      flipId: _flipId,
      style,
      ...restProps
    } = props;

    const filteredStyle: Record<string, any> = {};
    const animatedKeys = new Set([
      ...Object.keys(animateValuesRef.current),
      ...(animate ? Object.keys(animate) : []),
    ]);

    // Rendering `.current` here (not just imperatively via effect) avoids a flash of the
    // un-animated default on first paint of server-rendered pages, before hydration runs.
    const transformStyleProps: Record<string, any> = {};

    if (style) {
      for (const [key, value] of Object.entries(style)) {
        const current =
          value && typeof (value as AnimateValue<any>).subscribe === 'function'
            ? (value as AnimateValue<any>).current
            : value;

        if (isTransformKey(key)) {
          transformStyleProps[key] = current;
          continue;
        }

        if (animatedKeys.has(key)) continue;
        filteredStyle[key] = current;
      }
    }

    if (Object.keys(transformStyleProps).length > 0) {
      filteredStyle.transform = formatTransformString(transformStyleProps);
    }

    // AnimateValue-driven attrs are set imperatively by applyAttrs; passing them here
    // would have React render the raw object (e.g. cx="[object Object]").
    const filteredRestProps: Record<string, any> = {};
    for (const [key, value] of Object.entries(restProps)) {
      if (value instanceof AnimateValue) continue;
      filteredRestProps[key] = value;
    }

    return createElement(tag, {
      ...filteredRestProps,
      style: filteredStyle,
      ref: combineRefs(nodeRef, ref),
    });
  });

  AnimatedComponent.displayName = `Animated.${tag}`;
  return AnimatedComponent;
}
