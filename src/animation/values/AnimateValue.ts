import type { AnimateController } from '../drivers/AnimateController';
import type { ExtrapolateConfig } from '../utils/to';
import { to } from '../utils/to';

type Subscriber<T> = (value: T) => void;

export class AnimateValue<T = number> {
  private subscribers = new Set<Subscriber<T>>();
  private _current: T;
  private _initial: T;
  private controller?: AnimateController;

  constructor(initial: T) {
    this._current = initial;
    this._initial = initial;
  }

  get current(): T {
    return this._current;
  }

  get initial(): T {
    return this._initial;
  }

  set(value: T): void {
    this.controller?.cancel();
    this.controller = undefined;
    this._internalSet(value);
  }

  /**
   * @internal only use internally
   */
  _internalSet(value: T): void {
    if (value === this._current) return;
    this._current = value;
    for (const sub of this.subscribers) sub(value);
  }

  subscribe(fn: Subscriber<T>): () => void {
    this.subscribers.add(fn);
    fn(this._current);
    return () => {
      this.subscribers.delete(fn);
    };
  }

  reset() {
    this.set(this._initial);
  }

  destroy() {
    this.subscribers.clear();
    this.controller?.cancel();
    this.controller = undefined;
  }

  to<U>(mapperFn: (value: T) => U): AnimateValue<U>;
  to(
    inRange: number[],
    outRange: (number | string)[],
    config?: ExtrapolateConfig
  ): AnimateValue<number | string>;
  to(arg1: any, arg2?: any, arg3?: any): AnimateValue<any> {
    if (typeof arg1 === 'function') {
      const mapFn = arg1 as (value: T) => any;
      const output = new AnimateValue(mapFn(this._current));
      this.subscribe((value) => output.set(mapFn(value)));
      return output;
    }

    const inRange = arg1 as number[];
    const outRange = arg2 as (number | string)[];
    const config = arg3 as ExtrapolateConfig | undefined;

    const mapValue = to(inRange, outRange, config);
    const output = new AnimateValue(mapValue(this.current as number));
    this.subscribe((value) => output.set(mapValue(value as number)));

    return output;
  }

  setAnimationController(controller: AnimateController) {
    this.controller?.cancel();
    this.controller = controller;
  }

  getAnimationController() {
    return this.controller;
  }
}

export function isAnimateValue(value: any): value is AnimateValue<any> {
  return value instanceof AnimateValue;
}

