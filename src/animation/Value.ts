import {
  decay,
  delay,
  loop,
  MotionValue,
  sequence,
  spring,
  timing,
} from '@raidipesh78/re-motion';
import { DriverConfig, ToValue } from './types';

export class Value<V extends number | string> {
  private animation: MotionValue<V>;
  private unsubscribe?: () => void;

  constructor(initial: V) {
    this.animation = new MotionValue(initial);
  }

  set(u: MotionValue<V> | ToValue<V>) {
    if (u instanceof MotionValue) return;

    this.unsubscribe?.();
    this.unsubscribe = undefined;

    if (typeof u === 'object' && u !== null) {
      const { type, to, options } = u;

      if (options?.onChange) {
        this.unsubscribe = this.animation.subscribe(options.onChange);
      }

      if (type === 'sequence') {
        const steps = options?.steps ?? [];
        const controllers = steps.map((step) => this.buildDriver(step));
        sequence(controllers).start();
        return;
      }

      if (type === 'loop') {
        const inner = this.buildDriver(options!.controller!);
        loop(inner, options?.iterations!).start();
        return;
      }

      this.buildDriver({ type, to, options }).start?.();
    } else {
      this.animation.set(u as V);
    }
  }

  private buildDriver(cfg: DriverConfig) {
    const anim = this.animation as MotionValue<number>;

    switch (cfg.type) {
      case 'spring':
        return spring(anim, cfg.to!, cfg.options);
      case 'timing':
        return timing(anim, cfg.to!, cfg.options);
      case 'decay':
        return decay(anim, cfg.options?.velocity!, cfg.options);
      case 'delay':
        return delay(cfg.options?.delay!);
      case 'sequence':
        return sequence(cfg.options!.steps!.map(this.buildDriver.bind(this)));
      default:
        throw new Error(`Unsupported driver type "${cfg.type}"`);
    }
  }

  get value(): MotionValue<V> {
    return this.animation;
  }

  get current(): V {
    return this.animation.current;
  }

  destroy() {
    this.unsubscribe?.();
    this.unsubscribe = undefined;
  }
}
