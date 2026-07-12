import { AnimateValue } from '../values/AnimateValue';
import type { Descriptor, Primitive } from '../types';
import { buildAnimation } from '../drivers/builder';
import { isTransformKey, createTransformRenderer } from './apply';
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
  /**
   * The real destination each key is meant to settle at, as declared by
   * `animate`/`view` (unwrapping `withSequence`/`withDelay` to find the
   * final step). Preferred over `initialValues` when reverting, since a
   * hover/press/focus interaction can interrupt an in-flight `animate`/`view`
   * transition before it ever reaches its target — reverting to a merely
   * *captured* value would then snap back to wherever that interruption left
   * it (e.g. a still-unrevealed `view` starting value), not where it was
   * actually headed.
   */
  restingTargets?: Record<string, Primitive>;
}

// Unwraps a descriptor (including `withSequence`/`withDelay` chains) to find
// the final numeric/string destination it's headed towards. Returns
// `undefined` for open-ended animations (e.g. `withLoop`) that have no
// settled target to speak of.
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
      // If value already exists (e.g. pre-initialized by `animate`/`view`),
      // capture the revert target fresh on every activation rather than only
      // once. The value right before a hover/press/focus starts is always
      // the correct "resting" baseline to snap back to — a *view* (or
      // `animate`) transition can move that baseline well after mount (e.g.
      // translateY settling from 40 -> 0), and caching the target only once
      // would permanently lock in whatever the value happened to be during
      // the very first activation, even after the real baseline has moved on.
      if (isActive) {
        initialValues[key] = value.current;
      } else if (!(key in initialValues)) {
        // Deactivating without ever having activated (shouldn't normally
        // happen) — fall back to resolving from static style.
        initialValues[key] = getInitialValue(key, style, node, computedStyle);
      }

      // AnimateValues created in useLayoutEffect (e.g. by the `view` prop)
      // need their subscriptions (re)established here too, or they'd never
      // reach the DOM.
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
      // Revert to the real settled target if `animate`/`view` declares one
      // for this key (see `restingTargets` doc above); otherwise fall back
      // to the captured value.
      const initialValue = restingTargets?.[key] ?? initialValues[key];

      // Reuse the driver type/options the developer configured for this key
      // (spring/timing/decay) rather than always springing back — otherwise
      // a `withTiming` entry/exit would enter with the declared timing but
      // always exit with a default spring.
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
