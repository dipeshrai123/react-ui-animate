import type { AnimationController } from './drivers/AnimationController';
import { ExtrapolateConfig, to } from './to/to';

type Subscriber<T> = (v: T) => void;

export class MotionValue<T = number> {
  private subs = new Set<Subscriber<T>>();
  private _current: T;
  private initial: T;
  private currentController?: AnimationController;

  constructor(initial: T) {
    this._current = initial;
    this.initial = initial;
  }

  get current(): T {
    return this._current;
  }

  set(v: T): void {
    this.currentController?.cancel();
    this.currentController = undefined;
    this._internalSet(v);
  }

  /**
   * @internal only use internally
   */
  _internalSet(v: T): void {
    if (v === this._current) return;
    this._current = v;
    for (const sub of this.subs) sub(v);
  }

  subscribe(fn: Subscriber<T>): () => void {
    this.subs.add(fn);
    fn(this._current);
    return () => {
      this.subs.delete(fn);
    };
  }

  reset() {
    this.set(this.initial);
  }

  destroy() {
    this.subs.clear();
    this.currentController?.cancel();
    this.currentController = undefined;
  }

  to<U>(mapperFn: (v: T) => U): MotionValue<U>;
  to(
    inRange: number[],
    outRange: (number | string)[],
    config?: ExtrapolateConfig
  ): MotionValue<number | string>;
  to(arg1: any, arg2?: any, arg3?: any): MotionValue<any> {
    if (typeof arg1 === 'function') {
      const mapFn = arg1 as (v: T) => any;
      const out = new MotionValue(mapFn(this._current));
      this.subscribe((v) => out.set(mapFn(v)));
      return out;
    }

    const inRange = arg1 as number[];
    const outRange = arg2 as (number | string)[];
    const config = arg3 as ExtrapolateConfig | undefined;

    const mapValue = to(inRange, outRange, config);
    const out = new MotionValue(mapValue(this.current as number));
    this.subscribe((t) => out.set(mapValue(t as number)));

    return out;
  }

  setAnimationController(ctrl: AnimationController) {
    this.currentController?.cancel();
    this.currentController = ctrl;
  }

  getAnimationController() {
    return this.currentController;
  }
}
