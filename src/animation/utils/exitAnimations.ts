import type { AnimateValue } from '../values/AnimateValue';
import type { Descriptor, Primitive } from '../types';
import { buildAnimation } from '../drivers/builder';

type AnimateValuesMap = Record<string, AnimateValue<Primitive>>;
type ControllersList = Array<{ cancel(): void }>;

export interface ExitAnimationContext {
  exitProp: Record<string, Descriptor | Primitive>;
  animateValues: AnimateValuesMap;
  controllers: ControllersList;
  onExitComplete: () => void;
}

export function setupExitAnimations(context: ExitAnimationContext) {
  const { exitProp, animateValues, controllers, onExitComplete } = context;

  // Track completed animations
  let completedCount = 0;
  const totalAnimations = Object.keys(exitProp).length;

  const checkComplete = () => {
    completedCount++;
    if (completedCount >= totalAnimations) {
      onExitComplete();
    }
  };

  // Start exit animations
  for (const [key, valueOrDescriptor] of Object.entries(exitProp)) {
    const value = animateValues[key];
    if (!value) {
      checkComplete();
      continue;
    }

    // Convert primitive values to timing descriptors for convenience
    const baseDescriptor: Descriptor = 
      typeof valueOrDescriptor === 'number' || typeof valueOrDescriptor === 'string'
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
}

