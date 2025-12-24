import { AnimateValue } from '../values/AnimateValue';
import type { Descriptor, Primitive } from '../types';
import { buildAnimation } from '../drivers/builder';
import { getInitialValue } from './initialValues';
import { applyStyles, applyTransforms, isTransformKey } from './apply';

type AnimateValuesMap = Record<string, AnimateValue<Primitive>>;
type ControllersList = Array<{ cancel(): void }>;

export interface ExitAnimationContext {
  exitProp: Record<string, Descriptor | Primitive>;
  animateValues: AnimateValuesMap;
  controllers: ControllersList;
  onExitComplete: () => void;
  node: HTMLElement;
  style: any;
}

export function setupExitAnimations(
  context: ExitAnimationContext
): (() => void)[] {
  const { exitProp, animateValues, controllers, onExitComplete, node, style } =
    context;

  // Track completed animations
  let completedCount = 0;
  const totalAnimations = Object.keys(exitProp).length;
  const newSubscriptions: (() => void)[] = [];

  const checkComplete = () => {
    completedCount++;
    if (completedCount >= totalAnimations) {
      onExitComplete();
    }
  };

  const computedStyle = window.getComputedStyle(node);

  // Create AnimateValues for exit-only properties that don't exist
  for (const key of Object.keys(exitProp)) {
    if (!animateValues[key]) {
      const initial = getInitialValue(key, style, node, computedStyle);
      animateValues[key] = new AnimateValue(initial);
    }
  }

  // Re-apply all styles including the new exit-only properties
  // This ensures all AnimateValues are properly subscribed to the DOM
  const mergedStyle: Record<string, any> = { ...style };
  for (const key of Object.keys(animateValues)) {
    mergedStyle[key] = animateValues[key];
  }

  // Separate normal styles and transforms
  const normal: Record<string, any> = {};
  const transforms: Record<string, any> = {};
  for (const [key, value] of Object.entries(mergedStyle)) {
    if (value && typeof value === 'object' && 'subscribe' in value) {
      // Only include AnimateValues, not static values
      (isTransformKey(key) ? transforms : normal)[key] = value;
    }
  }

  // Apply styles and transforms, collecting subscriptions
  newSubscriptions.push(...applyStyles(node, normal));
  newSubscriptions.push(...applyTransforms(node, transforms));

  // Start exit animations
  for (const [key, valueOrDescriptor] of Object.entries(exitProp)) {
    const value = animateValues[key];
    if (!value) {
      checkComplete();
      continue;
    }

    // Convert primitive values to timing descriptors for convenience
    const baseDescriptor: Descriptor =
      typeof valueOrDescriptor === 'number' ||
      typeof valueOrDescriptor === 'string'
        ? {
            type: 'timing',
            to: valueOrDescriptor,
            options: {
              duration: 300,
            },
          }
        : valueOrDescriptor;

    // Add onComplete callback to track when animation finishes
    const exitDescriptor: Descriptor = {
      ...baseDescriptor,
      options: {
        ...baseDescriptor.options,
        onComplete: () => {
          baseDescriptor.options?.onComplete?.();
          checkComplete();
        },
      },
    };

    const controller = buildAnimation(value, exitDescriptor);
    controllers.push(controller);
    controller.start();
  }

  // Return cleanup subscriptions
  return newSubscriptions;
}
