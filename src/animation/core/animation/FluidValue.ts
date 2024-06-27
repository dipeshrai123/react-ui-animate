import type {
  Length,
  ResultType,
  SubscribeFn,
  FluidValueConfig,
  OnUpdateFn,
  AssignValue,
} from '../types/animation';
import { Fn } from '../types/common';

export class FluidValue {
  public _subscribe: SubscribeFn;
  public _value: Length;
  public _config?: FluidValueConfig;
  public _currentValue: { current: Length };
  public _subscriptions: Map<{ uuid: number; property: string }, OnUpdateFn>;

  public get: () => Length;

  constructor(initialValue: Length, config?: FluidValueConfig) {
    this._subscriptions = new Map();
    this._subscribe = (
      onUpdate: OnUpdateFn,
      property: string,
      uuid: number
    ) => {
      this._subscriptions.set({ uuid, property }, onUpdate);

      return () => {
        this._subscriptions.delete({ uuid, property });
      };
    };
    this._value = initialValue;
    this._currentValue = { current: initialValue };
    this._config = config;
    this.get = () => this._currentValue.current;
  }

  /**
   * Animates from initial value to updated value, determines the transition type `multistage`
   * or `singlestage` according to updatedValue
   */
  setValue(
    updatedValue: AssignValue,
    config?: FluidValueConfig,
    callback?: Fn<ResultType, void>
  ) {
    /** Multistage transition */
    if (typeof updatedValue === 'function') {
      updatedValue((nextValue, nextConfig) => {
        const multiStagePromise = new Promise((resolve) => {
          for (const subscriptionKey of this._subscriptions.keys()) {
            const updater = this._subscriptions.get(subscriptionKey);

            if (updater) {
              updater(nextValue, nextConfig ?? config, function (result) {
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

      updater && updater(updatedValue, config, callback);
    }
  }
}
