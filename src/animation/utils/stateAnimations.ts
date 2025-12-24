import { AnimateValue } from '../values/AnimateValue';
import type { Descriptor, Primitive } from '../types';
import { buildAnimation } from '../drivers/builder';
import { isTransformKey } from './apply';
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
        const render = () => {
          const transformKeyList =
            Object.keys(animateValues).filter(isTransformKey);
          if (transformKeyList.length > 0) {
            const parts = transformKeyList.map((k) => {
              const v = animateValues[k];
              if (!v) return '';
              const cur = v.current;
              const str = String(cur);
              const numMatch = str.match(/-?\d+(\.\d+)?/)?.[0] ?? '0';
              const unitMatch =
                str.match(
                  /px|rem|em|ex|%|cm|mm|in|pt|pc|ch|vh|vw|vmin|vmax|deg/
                )?.[0] ?? '';
              let unit = unitMatch;
              if (!unit) {
                if (k === 'perspective' || k.startsWith('translate'))
                  unit = 'px';
                else if (k.startsWith('rotate') || k.startsWith('skew'))
                  unit = 'deg';
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
            const css =
              typeof v === 'number' &&
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
      if (!(key in initialValues)) {
        // Store the current value as the initial for state animations
        // This ensures we revert to the value before state animation starts
        initialValues[key] = value.current;
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
