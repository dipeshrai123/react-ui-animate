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
      // If value already exists, ensure we have the initial value stored
      // This handles the case where the value was created by the animate prop or pre-initialized
      if (!(key in initialValues)) {
        // On deactivate, always resolve from static style — never capture the
        // current (hovered) value as the revert target.
        initialValues[key] = isActive
          ? value.current
          : getInitialValue(key, style, node, computedStyle);
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
      // Revert to initial value
      const initialValue = initialValues[key];

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
