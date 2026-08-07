import { AnimateValue } from '../values/AnimateValue';
import type { Descriptor, Primitive } from '../types';
import { buildAnimation } from '../drivers/builder';
import { isTransformKey, createTransformRenderer } from '../utils/apply';
import { getInitialValue } from './initialValues';

type AnimateValuesMap = Record<string, AnimateValue<Primitive>>;
type InitialValuesMap = Record<string, Primitive>;
type ControllersList = Array<{ cancel(): void }>;
type CleanupList = Array<() => void>;

export interface StateAnimationContext {
  node: HTMLElement;
  style: any;
  computedStyle: CSSStyleDeclaration;
  animateValues: AnimateValuesMap;
  initialValues: InitialValuesMap;
  stateControllers: ControllersList;
  cleanup: CleanupList;
  /** Preferred over `initialValues` when reverting — avoids snapping back to wherever a hover/press/focus interruption left an in-flight animate/view transition. */
  restingTargets?: Record<string, Primitive>;
}

export function extractRestingTarget(
  descriptor: Descriptor | Primitive | undefined
): Primitive | undefined {
  if (descriptor === undefined) return undefined;
  if (typeof descriptor === 'number' || typeof descriptor === 'string') {
    return descriptor;
  }
  if (descriptor.type === 'sequence') {
    const animations = descriptor.options?.animations ?? [];
    for (let i = animations.length - 1; i >= 0; i--) {
      const target = extractRestingTarget(animations[i]);
      if (target !== undefined) return target;
    }
    return undefined;
  }
  if (descriptor.type === 'loop' || descriptor.type === 'decay') {
    return undefined;
  }
  if (typeof descriptor.to === 'number' || typeof descriptor.to === 'string') {
    return descriptor.to;
  }
  return undefined;
}

export function applyStateAnimation(
  stateProp: Record<string, Descriptor | Primitive> | undefined,
  isActive: boolean,
  context: StateAnimationContext
) {
  if (!stateProp) return;

  const {
    node,
    style,
    computedStyle,
    animateValues,
    initialValues,
    stateControllers,
    cleanup,
    restingTargets,
  } = context;

  stateControllers.forEach((ctrl) => ctrl.cancel());
  stateControllers.length = 0;

  const newSubscriptions: (() => void)[] = [];

  for (const [key, valueOrDescriptor] of Object.entries(stateProp)) {
    let value = animateValues[key];

    if (!value) {
      const initial = getInitialValue(key, style, node, computedStyle);
      value = new AnimateValue(initial);
      animateValues[key] = value;

      initialValues[key] = initial;

      if (isTransformKey(key)) {
        const render = createTransformRenderer(node, animateValues);
        newSubscriptions.push(value.subscribe(render));
        render();
      } else {
        const updateStyle = (v: Primitive) => {
          const css =
            typeof v === 'number' &&
            !['opacity', 'zIndex', 'fontWeight', 'lineHeight'].includes(key)
              ? `${v}px`
              : String(v);
          (node.style as any)[key] = css;
        };
        newSubscriptions.push(value.subscribe(updateStyle));
        updateStyle(initial);
      }
    } else {
      // Captured fresh on every activation, not just once, since animate/view can move the baseline after mount.
      if (isActive) {
        initialValues[key] = value.current;
      } else if (!(key in initialValues)) {
        initialValues[key] = getInitialValue(key, style, node, computedStyle);
      }

      if (isTransformKey(key)) {
        const render = createTransformRenderer(node, animateValues);
        newSubscriptions.push(value.subscribe(render));
      } else {
        newSubscriptions.push(
          value.subscribe((v) => {
            const css =
              typeof v === 'number' &&
              !['opacity', 'zIndex', 'fontWeight', 'lineHeight'].includes(key)
                ? `${v}px`
                : String(v);
            (node.style as any)[key] = css;
          })
        );
      }
    }

    const isPrimitive =
      typeof valueOrDescriptor === 'number' ||
      typeof valueOrDescriptor === 'string';

    if (isActive) {
      if (isPrimitive) {
        const springDescriptor: Descriptor = {
          type: 'spring',
          to: valueOrDescriptor,
          options: {},
        };
        const controller = buildAnimation(value, springDescriptor);
        stateControllers.push(controller);
        controller.start();
      } else {
        const controller = buildAnimation(value, valueOrDescriptor);
        stateControllers.push(controller);
        controller.start();
      }
    } else {
      const initialValue = restingTargets?.[key] ?? initialValues[key];

      // Reuses the configured driver type instead of always springing back, or a
      // withTiming entry/exit would always exit with a default spring.
      const revertDescriptor: Descriptor =
        !isPrimitive &&
        (valueOrDescriptor.type === 'spring' ||
          valueOrDescriptor.type === 'timing' ||
          valueOrDescriptor.type === 'decay')
          ? { ...valueOrDescriptor, to: initialValue }
          : { type: 'spring', to: initialValue, options: {} };

      const controller = buildAnimation(value, revertDescriptor);
      stateControllers.push(controller);
      controller.start();
    }
  }

  cleanup.push(...newSubscriptions);
}
