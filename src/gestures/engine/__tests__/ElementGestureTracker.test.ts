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

  HTMLElement.prototype.setPointerCapture = jest.fn();
  HTMLElement.prototype.releasePointerCapture = jest.fn();
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

  describe('unified dispatch across gesture types', () => {
    it('dispatches Move via ungated pointermove on the target, independent of Pan', () => {
      const tracker = new ElementGestureTracker(el);
      const onPanChange = jest.fn();
      const onMoveChange = jest.fn();

      const panId = tracker.register(Gesture.Pan().minDistance(1000).onChange(onPanChange));
      const moveId = tracker.register(Gesture.Move().onChange(onMoveChange));

      // No pointerdown at all — Move should still fire, Pan (press-gated) should not.
      firePointer(el, 'pointermove', 10, 10);

      expect(onMoveChange).toHaveBeenCalledTimes(1);
      expect(onPanChange).not.toHaveBeenCalled();

      tracker.unregister(panId);
      tracker.unregister(moveId);
    });

    it('dispatches Wheel and Scroll independently on the same tracker', () => {
      const tracker = new ElementGestureTracker(el);
      const onWheelChange = jest.fn();
      const onScrollChange = jest.fn();

      const wheelId = tracker.register(Gesture.Wheel().onChange(onWheelChange));
      const scrollId = tracker.register(Gesture.Scroll().onChange(onScrollChange));

      el.dispatchEvent(
        new WheelEvent('wheel', { deltaX: 10, deltaY: 0, bubbles: true, cancelable: true })
      );
      expect(onWheelChange).toHaveBeenCalledTimes(1);
      expect(onScrollChange).not.toHaveBeenCalled();

      el.dispatchEvent(new Event('scroll', { bubbles: true }));
      expect(onScrollChange).toHaveBeenCalledTimes(1);
      expect(onWheelChange).toHaveBeenCalledTimes(1);

      tracker.unregister(wheelId);
      tracker.unregister(scrollId);
    });

    it('only attaches native listeners for categories that are actually registered', () => {
      const addSpy = jest.spyOn(el, 'addEventListener');
      const tracker = new ElementGestureTracker(el);

      const id = tracker.register(Gesture.Wheel().onChange(() => {}));

      const types = addSpy.mock.calls.map(([type]) => type);
      expect(types).toContain('wheel');
      expect(types).not.toContain('pointerdown');
      expect(types).not.toContain('scroll');

      tracker.unregister(id);
      addSpy.mockRestore();
    });

    it('removes a category listener once its last registration leaves, keeps others attached', () => {
      const tracker = new ElementGestureTracker(el);
      const onWheelChange = jest.fn();
      const onScrollChange = jest.fn();

      const wheelId = tracker.register(Gesture.Wheel().onChange(onWheelChange));
      const scrollId = tracker.register(Gesture.Scroll().onChange(onScrollChange));

      tracker.unregister(wheelId);

      el.dispatchEvent(
        new WheelEvent('wheel', { deltaX: 10, deltaY: 0, bubbles: true, cancelable: true })
      );
      expect(onWheelChange).not.toHaveBeenCalled();

      el.dispatchEvent(new Event('scroll', { bubbles: true }));
      expect(onScrollChange).toHaveBeenCalledTimes(1);

      tracker.unregister(scrollId);
    });
  });
});
