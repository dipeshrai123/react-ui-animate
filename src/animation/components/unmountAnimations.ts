import { AnimateValue } from '../values/AnimateValue';
import type { Descriptor, Primitive } from '../types';
import { buildAnimation } from '../drivers/builder';
import { getInitialValue } from './initialValues';
import { applyStyles, applyTransforms, isTransformKey } from '../utils/apply';

type AnimateValuesMap = Record<string, AnimateValue<Primitive>>;
type ControllersList = Array<{ cancel(): void }>;

export interface UnmountAnimationContext {
  exitProp: Record<string, Descriptor | Primitive>;
  animateValues: AnimateValuesMap;
  controllers: ControllersList;
  onExitComplete: () => void;
  node: HTMLElement;
  style: any;
}

export function setupUnmountAnimations(
  context: UnmountAnimationContext
): (() => void)[] {
  const { exitProp, animateValues, controllers, onExitComplete, node, style } =
    context;

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

  for (const key of Object.keys(exitProp)) {
    if (!animateValues[key]) {
      const initial = getInitialValue(key, style, node, computedStyle);
      animateValues[key] = new AnimateValue(initial);
    }
  }

  // Re-apply the full merged style (including the unmount-only AnimateValues
  // just created above) so every value is actually subscribed to the DOM.
  const mergedStyle: Record<string, any> = { ...style };
  for (const key of Object.keys(animateValues)) {
    mergedStyle[key] = animateValues[key];
  }

  const normal: Record<string, any> = {};
  const transforms: Record<string, any> = {};
  for (const [key, value] of Object.entries(mergedStyle)) {
    if (value && typeof value === 'object' && 'subscribe' in value) {
      (isTransformKey(key) ? transforms : normal)[key] = value;
    }
  }

  newSubscriptions.push(...applyStyles(node, normal));
  newSubscriptions.push(...applyTransforms(node, transforms));

  for (const [key, valueOrDescriptor] of Object.entries(exitProp)) {
    const value = animateValues[key];
    if (!value) {
      checkComplete();
      continue;
    }

    const baseDescriptor: Descriptor =
      typeof valueOrDescriptor === 'number' ||
      typeof valueOrDescriptor === 'string'
        ? {
            type: 'spring',
            to: valueOrDescriptor,
            options: {},
          }
        : valueOrDescriptor;

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

  return newSubscriptions;
}
