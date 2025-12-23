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

function serializeAnimateProp(prop: AnimateProp | undefined): string {
  if (!prop) return '';
  const propRecord = prop as Record<string, Descriptor | Primitive>;
  const keys = Object.keys(propRecord).sort();
  return keys.map(key => {
    const value = propRecord[key];
    if (typeof value === 'number' || typeof value === 'string') {
      return `${key}:${value}`;
    }
    if (typeof value === 'object' && value !== null && 'type' in value) {
      const desc = value as Descriptor;
      return `${key}:${desc.type}:${JSON.stringify(desc.to || '')}`;
    }
    return `${key}:unknown`;
  }).join('|');
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
      typeof valueOrDescriptor === 'number' || typeof valueOrDescriptor === 'string'
        ? {
            type: 'timing',
            to: valueOrDescriptor,
            options: { duration: 300 },
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
    const stateRef = useRef({
      isHovered: false,
      isTapped: false,
      isFocused: false,
    });
    const initialValuesRef = useRef<Record<string, Primitive>>({});
    const prevAnimatePropRef = useRef<AnimateProp | undefined>(undefined);
    const prevAnimatePropKeyRef = useRef<string>('');

    const presenceContext = useContext(PresenceContext);
    propsRef.current = props;

    useLayoutEffect(() => {
      const node = nodeRef.current;
      if (!node || isExitingRef.current) return;

      const animateProp = props.animate;
      const { style = {}, ...rest } = propsRef.current;
      const isFirstMount = !hasMountedRef.current;
      const currentKey = serializeAnimateProp(animateProp);
      const valuesChanged = prevAnimatePropKeyRef.current !== currentKey;
      const shouldRestart = isFirstMount || valuesChanged;
      
      if (shouldRestart) {
        controllersRef.current.forEach((ctrl) => ctrl.cancel());
        controllersRef.current = [];

        if (animateProp) {
          const computedStyle = window.getComputedStyle(node);
          
          if (isFirstMount) {
            const newAnimateValues: Record<string, AnimateValue<Primitive>> = {};
            for (const key of Object.keys(animateProp)) {
              const initial = getInitialValue(key, style, node, computedStyle);
              newAnimateValues[key] = new AnimateValue(initial);
            }
            animateValuesRef.current = newAnimateValues;
          } else {
            animateValuesRef.current = createAnimateValues(
              animateProp,
              style,
              node,
              computedStyle,
              animateValuesRef.current
            );
          }

          startAnimations(animateProp, animateValuesRef.current, controllersRef.current);
          prevAnimatePropRef.current = animateProp;
        }
      }

      prevAnimatePropKeyRef.current = currentKey;
      cleanupRef.current.forEach((cleanup) => cleanup());
      cleanupRef.current = applyStylesToNode(node, style, animateValuesRef.current, rest);
      hasMountedRef.current = true;

      return () => {
        cleanupRef.current.forEach((cleanup) => cleanup());
        cleanupRef.current = [];
      };
    }, [props.style, props.animate]);

    useEffect(() => {
      return () => {
        controllersRef.current.forEach((ctrl) => ctrl.cancel());
        controllersRef.current = [];
      };
    }, []);

    useEffect(() => {
      const { exit: exitProp } = propsRef.current;
      
      if (!exitProp || !presenceContext?.isExiting || isExitingRef.current) return;

      isExitingRef.current = true;
      controllersRef.current.forEach((ctrl) => ctrl.cancel());
      controllersRef.current = [];

      setupExitAnimations({
        exitProp,
        animateValues: animateValuesRef.current,
        controllers: controllersRef.current,
        onExitComplete: () => {
          presenceContext.onExitComplete();
        },
      });
    }, [presenceContext?.isExiting]);

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

    useEffect(() => {
      const node = nodeRef.current;
      if (!node) return;

      const { hover, press, focus } = propsRef.current;

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
      };

      const handleMouseLeaveForPress = () => {
        if (stateRef.current.isTapped) {
          stateRef.current.isTapped = false;
          applyStateAnimationWrapper(press, false);
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
    }, [props.hover, props.press, props.focus]);

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
