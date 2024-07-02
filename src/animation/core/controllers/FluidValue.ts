import type {
  Length,
  ResultType,
  SubscribeFn,
  FluidValueConfig,
  OnUpdateFn,
  AssignValue,
} from '../types/animation';
import type { Fn } from '../types/common';

/**
 * Represents a fluid value that can animate between states.
 */
export class FluidValue {
  public _subscribe: SubscribeFn;
  public _value: Length;
  public _config?: FluidValueConfig;
  public _currentValue: { current: Length };
  public _subscriptions: Map<{ uuid: number; property: string }, OnUpdateFn>;

  public get: () => Length;

  /**
   * Creates a new FluidValue instance.
   * @param initialValue - The initial value of the fluid value.
   * @param config - Optional configuration for the fluid value.
   */
  constructor(initialValue: Length, config?: FluidValueConfig) {
    this._subscriptions = new Map();
    this._subscribe = (
      onUpdate: OnUpdateFn,
      property: string,
      uuid: number
    ) => {
      this._subscriptions.set({ uuid, property }, onUpdate);

      return () => {
        for (const key of this._subscriptions.keys()) {
          this._subscriptions.delete(key);
        }
      };
    };
    this._value = initialValue;
    this._currentValue = { current: initialValue };
    this._config = config;
    this.get = () => this._currentValue.current;
  }

  /**
   * Animates from the current value to the updated value.
   * Determines whether to perform a multi-stage or single-stage transition.
   * @param updatedValue - The value to animate to, or a function that defines a multi-stage transition.
   * @param config - Optional configuration for the animation.
   * @param callback - Optional callback to be called after the animation ends.
   */
  setValue(updatedValue: AssignValue, callback?: Fn<ResultType, void>) {
    /** Multistage transition */
    if (typeof updatedValue === 'function') {
      updatedValue((nextValue) => {
        const multiStagePromise = new Promise((resolve) => {
          for (const subscriptionKey of this._subscriptions.keys()) {
            const updater = this._subscriptions.get(subscriptionKey);

            if (updater) {
              updater(nextValue, function (result) {
                if (result.finished) {
                  resolve(nextValue);
                }

                if (callback) {
                  callback(result);
                }
              });
            }
          }
        });

        return multiStagePromise;
      });

      return;
    }

    /** Singlestage transition */
    for (const subscriptionKey of this._subscriptions.keys()) {
      const updater = this._subscriptions.get(subscriptionKey);

      updater && updater(updatedValue, callback);
    }
  }
}
