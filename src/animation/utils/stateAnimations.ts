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

  // Cancel any existing state animations
  stateControllers.forEach((ctrl) => ctrl.cancel());
  stateControllers.length = 0;

  const newSubscriptions: (() => void)[] = [];

  // For each property in the state animation
  for (const [key, valueOrDescriptor] of Object.entries(stateProp)) {
    // Get or create AnimateValue for this property
    let value = animateValues[key];

    if (!value) {
      // Create a new AnimateValue if it doesn't exist
      const initial = getInitialValue(key, style, node, computedStyle);
      value = new AnimateValue(initial);
      animateValues[key] = value;

      // Store the initial value immediately for state animations
      initialValues[key] = initial;

      // Manually subscribe to the new AnimateValue
      if (isTransformKey(key)) {
        // For transforms, we need to re-render all transforms
        // So we'll trigger a full transform update
        const render = createTransformRenderer(node, animateValues);
        newSubscriptions.push(value.subscribe(render));
        render(); // Initial render
      } else {
        // For normal styles, subscribe directly
        const updateStyle = (v: Primitive) => {
          const css =
            typeof v === 'number' &&
            !['opacity', 'zIndex', 'fontWeight', 'lineHeight'].includes(key)
              ? `${v}px`
              : String(v);
          (node.style as any)[key] = css;
        };
        newSubscriptions.push(value.subscribe(updateStyle));
        // Immediately apply the initial value to ensure it's set before animation starts
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

      // Ensure subscriptions exist for pre-initialized AnimateValues (e.g., from view prop initialization)
      // This is necessary because AnimateValues created in useLayoutEffect need subscriptions to update the DOM
      if (isTransformKey(key)) {
        // For transforms, we need to re-render all transforms
        const render = createTransformRenderer(node, animateValues);
        newSubscriptions.push(value.subscribe(render));
      } else {
        // For normal styles, subscribe directly
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

    // Check if it's a raw primitive (animate with spring) or a descriptor (animate)
    const isPrimitive =
      typeof valueOrDescriptor === 'number' ||
      typeof valueOrDescriptor === 'string';

    if (isActive) {
      if (isPrimitive) {
        // Animate to the state animation target with spring
        const springDescriptor: Descriptor = {
          type: 'spring',
          to: valueOrDescriptor,
          options: {},
        };
        const controller = buildAnimation(value, springDescriptor);
        stateControllers.push(controller);
        controller.start();
      } else {
        // Animate to the state animation target
        const controller = buildAnimation(value, valueOrDescriptor);
        stateControllers.push(controller);
        controller.start();
      }
    } else {
      // Revert to the real settled target if `animate`/`view` declares one
      // for this key (see `restingTargets` doc above); otherwise fall back
      // to the captured value.
      const initialValue = restingTargets?.[key] ?? initialValues[key];

      if (isPrimitive) {
        // Animate back to initial value with spring
        const revertDescriptor: Descriptor = {
          type: 'spring',
          to: initialValue,
          options: {},
        };

        const controller = buildAnimation(value, revertDescriptor);
        stateControllers.push(controller);
        controller.start();
      } else {
        // Animate back to initial value with spring (consistent behavior)
        const revertDescriptor: Descriptor = {
          type: 'spring',
          to: initialValue,
          options: {},
        };

        const controller = buildAnimation(value, revertDescriptor);
        stateControllers.push(controller);
        controller.start();
      }
    }
  }

  // Add new subscriptions to cleanup
  cleanup.push(...newSubscriptions);
}
