/**
 * Base Animation class
 */
export class Animation {
  _active: boolean;
  _onEnd: any;

  _debounceOnEnd(result: { finished: boolean; value: number }) {
    const onEnd = this._onEnd;
    this._onEnd = null;
    onEnd && onEnd(result);
  }

  stop() {}
}
