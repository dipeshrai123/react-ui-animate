import { ResultType } from '../types';

/**
 * Base Animation class
 */
export class Animation {
  _active: boolean;
  _onEnd: any;
  /**
   * it is necessary to add _onRest function as well
   * because _onEnd is always re-assigned with onUpdate callback
   * so that _onRest function is not fired, so we have to duplicate it
   */
  _onRest?: any;

  _debounceOnEnd(result: ResultType) {
    const onEnd = this._onEnd;
    const onRest = this._onRest;
    this._onEnd = null;
    this._onRest = null;

    onRest && onRest(result);
    onEnd && onEnd(result);
  }

  stop() {}
}
