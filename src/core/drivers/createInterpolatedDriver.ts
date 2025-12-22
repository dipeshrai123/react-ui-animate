import { MotionValue } from '../MotionValue';
import { AnimationController } from './AnimationController';

type DriverFactory = (
  mv: MotionValue<number>,
  to: number,
  opts: any
) => AnimationController;

export function createInterpolatedDriver(
  mv: MotionValue<number | string>,
  to: number | string,
  opts: any,
  driver: DriverFactory
): AnimationController {
  if (typeof mv.current === 'number' && typeof to === 'number') {
    return driver(mv as MotionValue<number>, to, opts);
  }

  if (typeof mv.current === 'string' && typeof to === 'string') {
    try {
      const progress = new MotionValue(0);
      const interpolated = progress.to([0, 1], [mv.current, to]);

      const ctrl = driver(progress, 1, opts);
      mv.setAnimationController(ctrl);

      progress.subscribe(() => {
        if (mv.getAnimationController() === ctrl) {
          mv._internalSet(interpolated.current);
        }
      });

      return ctrl;
    } catch (err) {
      throw new Error(
        `[${driver.name}] Cannot animate from "${mv.current}" to "${to}": ${err.message}`
      );
    }
  }

  throw new Error(
    `[${driver.name}] Unsupported type: ${typeof mv.current} → ${typeof to}`
  );
}
