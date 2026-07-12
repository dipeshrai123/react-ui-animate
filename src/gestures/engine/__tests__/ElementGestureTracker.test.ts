import { ElementGestureTracker } from '../ElementGestureTracker';
import { Gesture } from '../../api/Gesture';

beforeAll(() => {
  if (!(window as any).PointerEvent) {
    (window as any).PointerEvent = class PointerEvent extends MouseEvent {
      pointerId: number;
      constructor(type: string, params: any = {}) {
        super(type, params);
        this.pointerId = params.pointerId ?? 1;
      }
    };
  }
});

function firePointer(target: HTMLElement | Window, type: string, x: number, y: number) {
  target.dispatchEvent(
    new (window as any).PointerEvent(type, {
      clientX: x,
      clientY: y,
      pointerId: 1,
      bubbles: true,
      cancelable: true,
      button: 0,
    })
  );
}

describe('ElementGestureTracker', () => {
  let el: HTMLElement;

  beforeEach(() => {
    el = document.createElement('div');
    document.body.appendChild(el);
  });

  afterEach(() => {
    el.remove();
  });

  it('dispatches pointer events to a registered Pan gesture end to end', () => {
    const tracker = new ElementGestureTracker(el);
    const onStart = jest.fn();
    const onChange = jest.fn();
    const onEnd = jest.fn();

    const id = tracker.register(
      Gesture.Pan().minDistance(10).onStart(onStart).onChange(onChange).onEnd(onEnd)
    );

    firePointer(el, 'pointerdown', 0, 0);
    firePointer(window, 'pointermove', 20, 0);
    firePointer(window, 'pointerup', 20, 0);

    expect(onStart).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onEnd).toHaveBeenCalledTimes(1);

    tracker.unregister(id);
  });

  it('lets two registered gestures on the same element both receive events (shared listeners)', () => {
    const tracker = new ElementGestureTracker(el);
    const onChangeA = jest.fn();
    const onChangeB = jest.fn();

    const idA = tracker.register(Gesture.Pan().minDistance(5).onChange(onChangeA));
    const idB = tracker.register(Gesture.Pan().minDistance(5).onChange(onChangeB));

    firePointer(el, 'pointerdown', 0, 0);
    firePointer(window, 'pointermove', 20, 0);

    expect(onChangeA).toHaveBeenCalledTimes(1);
    expect(onChangeB).toHaveBeenCalledTimes(1);

    tracker.unregister(idA);
    tracker.unregister(idB);
  });

  it('stops dispatching after unregister', () => {
    const tracker = new ElementGestureTracker(el);
    const onStart = jest.fn();
    const id = tracker.register(Gesture.Pan().minDistance(5).onStart(onStart));

    tracker.unregister(id);

    firePointer(el, 'pointerdown', 0, 0);
    firePointer(window, 'pointermove', 20, 0);

    expect(onStart).not.toHaveBeenCalled();
  });

  it('pushes live config updates without re-registering', () => {
    const tracker = new ElementGestureTracker(el);
    const onStart = jest.fn();
    const id = tracker.register(Gesture.Pan().minDistance(1000).onStart(onStart));

    firePointer(el, 'pointerdown', 0, 0);
    firePointer(window, 'pointermove', 5, 0);
    expect(onStart).not.toHaveBeenCalled();

    tracker.updateConfig(id, { minDistance: 1 });

    firePointer(window, 'pointermove', 10, 0);
    expect(onStart).toHaveBeenCalledTimes(1);

    tracker.unregister(id);
  });
});
