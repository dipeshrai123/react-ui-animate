import { AnimateValue } from '../AnimateValue';
import { AnimationController } from './AnimationController';

type DriverFactory = (
  value: AnimateValue<number>,
  target: number,
  options: any
) => AnimationController;

export function createInterpolatedDriver(
  value: AnimateValue<number | string>,
  target: number | string,
  options: any,
  driver: DriverFactory
): AnimationController {
  if (typeof value.current === 'number' && typeof target === 'number') {
    return driver(value as AnimateValue<number>, target, options);
  }

  if (typeof value.current === 'string' && typeof target === 'string') {
    try {
      const progress = new AnimateValue(0);
      const interpolated = progress.to([0, 1], [value.current, target]);

      const controller = driver(progress, 1, options);
      value.setAnimationController(controller);

      progress.subscribe(() => {
        if (value.getAnimationController() === controller) {
          value._internalSet(interpolated.current);
        }
      });

      return controller;
    } catch (err: any) {
      throw new Error(
        `[${driver.name}] Cannot animate from "${value.current}" to "${target}": ${err.message}`
      );
    }
  }

  throw new Error(
    `[${driver.name}] Unsupported type: ${typeof value.current} → ${typeof target}`
  );
}
