import { FluidValue, timing, decay, spring } from '@raidipesh78/re-motion';

import { isDefined } from '../helpers';

type Fn<T, U> = (value: T) => U;

export interface UseFluidValueConfig {
  mass?: number;
  tension?: number;
  friction?: number;
  duration?: number;
  easing?: Fn<number, number>;
  immediate?: boolean;
  delay?: number;
  restDistance?: number;
  onChange?: Fn<number, void>;
  onRest?: Fn<number, void>;
  onStart?: Fn<number, void>;
  decay?: boolean;
  velocity?: number;
  deceleration?: number;
  loop?: number;
}

export type UpdateValue = {
  toValue?: number;
  config?: UseFluidValueConfig;
};

export class FluidController {
  private fluid: FluidValue;
  private defaultConfig?: UseFluidValueConfig;
  private iterationsSoFar: number = 0;

  constructor(value: number, config?: UseFluidValueConfig) {
    this.fluid = new FluidValue(value);
    this.defaultConfig = config;
  }

  private getAnimation(updateValue: UpdateValue, config: UseFluidValueConfig) {
    if (isDefined(config?.duration) || config?.immediate) {
      if (!isDefined(updateValue.toValue)) {
        throw new Error('No `toValue` is defined');
      }

      const timingConfig = {
        toValue: updateValue.toValue,
        delay: config?.delay,
        duration: config?.immediate ? 0 : config?.duration,
        easing: config?.easing,
      };

      return timing(this.fluid, timingConfig);
    } else if (config?.decay) {
      const decayConfig = {
        velocity: config?.velocity,
        deceleration: config?.deceleration,
        delay: config?.delay,
      };

      return decay(this.fluid, decayConfig);
    } else {
      if (!isDefined(updateValue.toValue)) {
        throw new Error('No `toValue` is defined');
      }

      const springConfig = {
        toValue: updateValue.toValue,
        delay: config?.delay,
        mass: config?.mass,
        tension: config?.tension,
        friction: config?.friction,
        restDistance: config?.restDistance,
      };

      return spring(this.fluid, springConfig);
    }
  }

  private runAnimation(
    updateValue: UpdateValue,
    onComplete?: (value: number) => void
  ) {
    const config = { ...this.defaultConfig, ...updateValue.config };
    const loopCount = config?.loop ?? 0;

    this.fluid.removeAllListeners();
    config?.onStart && config.onStart(this.fluid.get());

    if (config?.onChange) {
      this.fluid.addListener((value) => config?.onChange?.(value));
    }

    const animation = this.getAnimation(updateValue, config);

    const handleRest = (result: { finished: boolean; value: number }) => {
      if (result.finished) {
        config?.onRest?.(result.value);
        onComplete?.(result.value);
      }
    };

    const loopAnimation = (result: { finished: boolean; value: number }) => {
      if (result.finished) {
        this.iterationsSoFar++;

        if (loopCount === -1 || this.iterationsSoFar < loopCount) {
          animation.reset();
          animation.start(loopAnimation);
        } else {
          handleRest(result);
        }
      }
    };

    animation.start(isDefined(config?.loop) ? loopAnimation : handleRest);
  }

  public setFluid(
    updateValue: UpdateValue | UpdateValue[],
    callback?: (value: number) => void
  ) {
    if (!updateValue) {
      return;
    }

    if (Array.isArray(updateValue)) {
      let currentAnimation = 0;

      const onComplete = (value: number) => {
        currentAnimation++;

        if (currentAnimation === updateValue.length) {
          callback && callback(value);

          return;
        }

        this.runAnimation(updateValue[currentAnimation], onComplete);
      };

      this.runAnimation(updateValue[currentAnimation], onComplete);
    } else {
      this.runAnimation(updateValue, callback);
    }
  }

  public getFluid() {
    return this.fluid;
  }
}
