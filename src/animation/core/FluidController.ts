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
  loop?: boolean | number;
}

export type AssignValue = {
  toValue?: number;
  config?: UseFluidValueConfig;
};

export class FluidController {
  private fluid: FluidValue;
  private defaultConfig?: UseFluidValueConfig;

  constructor(value: number, config?: UseFluidValueConfig) {
    this.fluid = new FluidValue(value);
    this.defaultConfig = config;
  }

  private getAnimation(updateValue: AssignValue, config?: UseFluidValueConfig) {
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
    updateValue: AssignValue,
    onComplete?: (value: number) => void
  ) {
    const config = { ...this.defaultConfig, ...updateValue.config };

    this.fluid.removeAllListeners();
    config?.onStart && config.onStart(this.fluid.get());

    if (config?.onChange) {
      this.fluid.addListener((value) => config?.onChange?.(value));
    }

    const onRest = ({
      finished,
      value,
    }: {
      finished: boolean;
      value: number;
    }) => {
      if (finished) {
        config?.onRest?.(value);
        onComplete?.(value);
      }
    };

    const animation = this.getAnimation(updateValue, config);
    animation.start(onRest);
  }

  public setFluid(
    updateValue: AssignValue,
    callback?: (value: number) => void
  ) {
    if (!updateValue) {
      return;
    }

    this.runAnimation(updateValue, callback);
  }

  public getFluid() {
    return this.fluid;
  }
}
