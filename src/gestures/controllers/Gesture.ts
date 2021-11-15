export class Gesture {
  currentIndex?: number;
  lastTimeStamp: number = Date.now();
  isActive: boolean = false;
  targetElement?: HTMLElement; // represents the bounded element
  targetElements: Array<HTMLElement> = []; // represents the bounded elements
  config?: any;
  callback?: <T>(event: T) => void;
  _subscribe?: (eventKeys?: Array<string>) => void;
  static _VELOCITY_LIMIT: number = 20;

  // it must be overridden by other child classes
  _initEvents() {}

  // cancel events
  // we only canceled down and move events because mouse up
  // will not be triggered
  _cancelEvents() {
    if (this._subscribe) {
      this._subscribe();
    }
  }

  // re-apply new callback
  applyCallback(callback: <T>(event: T) => void) {
    this.callback = callback;
  }

  // apply gesture
  applyGesture({
    targetElement,
    targetElements,
    callback,
    config,
  }: {
    targetElement?: any;
    targetElements?: any;
    callback: <T>(event: T) => void;
    config?: any;
  }) {
    this.targetElement = targetElement;
    this.targetElements = targetElements.map(
      (element: { current: any }) => element.current
    );
    this.callback = callback;
    this.config = config;

    // initialize events
    this._initEvents();

    // unbind
    return () => this._subscribe && this._subscribe();
  }
}
