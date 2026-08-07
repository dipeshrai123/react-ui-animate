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

function firePointer(
  target: HTMLElement | Window,
  type: string,
  x: number,
  y: number,
  pointerId = 1
) {
  target.dispatchEvent(
    new (window as any).PointerEvent(type, {
      clientX: x,
      clientY: y,
      pointerId,
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

    it('dispatches Swipe end to end on a fast, sufficiently-long drag', () => {
      const tracker = new ElementGestureTracker(el);
      const onSwipe = jest.fn();

      const id = tracker.register(Gesture.Swipe().onSwipe(onSwipe));

      firePointer(el, 'pointerdown', 0, 0);
      firePointer(window, 'pointermove', 100, 0);
      firePointer(window, 'pointerup', 100, 0);

      expect(onSwipe).toHaveBeenCalledTimes(1);
      expect(onSwipe.mock.calls[0][0].direction).toBe('right');

      tracker.unregister(id);
    });

    // Regression test for the documented arbitration gap ("Swipe and Pan
    // both listen on the 'pointer' group with no arbitration between them
    // yet ... a fast enough drag can fire both Pan's onEnd and Swipe's
    // onSwipe" — see Gesture.ts). A single fast, long-enough drag qualifies
    // for both simultaneously; only one should actually fire.
    it('arbitrates between Pan and Swipe registered on the same element — only one fires', () => {
      const tracker = new ElementGestureTracker(el);
      const onPanEnd = jest.fn();
      const onSwipe = jest.fn();

      const panId = tracker.register(Gesture.Pan().minDistance(10).onEnd(onPanEnd));
      const swipeId = tracker.register(Gesture.Swipe().onSwipe(onSwipe));

      firePointer(el, 'pointerdown', 0, 0);
      firePointer(window, 'pointermove', 100, 0);
      firePointer(window, 'pointerup', 100, 0);

      // Pan crosses minDistance during the move (before pointerup), so it
      // claims the stream first — Swipe must stay quiet.
      expect(onPanEnd).toHaveBeenCalledTimes(1);
      expect(onSwipe).not.toHaveBeenCalled();

      tracker.unregister(panId);
      tracker.unregister(swipeId);
    });

    it('two independent Pan registrations on the same element both keep firing (not a conflict)', () => {
      const tracker = new ElementGestureTracker(el);
      const onChangeA = jest.fn();
      const onChangeB = jest.fn();

      const idA = tracker.register(Gesture.Pan().minDistance(5).onChange(onChangeA));
      const idB = tracker.register(Gesture.Pan().minDistance(5).onChange(onChangeB));

      firePointer(el, 'pointerdown', 0, 0);
      firePointer(window, 'pointermove', 20, 0);
      firePointer(window, 'pointerup', 20, 0);

      expect(onChangeA).toHaveBeenCalledTimes(1);
      expect(onChangeB).toHaveBeenCalledTimes(1);

      tracker.unregister(idA);
      tracker.unregister(idB);
    });

    it('dispatches Hover via pointermove/pointerleave on the target', () => {
      const tracker = new ElementGestureTracker(el);
      const onStart = jest.fn();
      const onChange = jest.fn();
      const onEnd = jest.fn();

      const id = tracker.register(
        Gesture.Hover().onStart(onStart).onChange(onChange).onEnd(onEnd)
      );

      firePointer(el, 'pointermove', 10, 10);
      el.dispatchEvent(new (window as any).PointerEvent('pointerleave', { bubbles: false }));

      expect(onStart).toHaveBeenCalledTimes(1);
      expect(onStart.mock.calls[0][0].hovering).toBe(true);
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onEnd).toHaveBeenCalledTimes(1);
      expect(onEnd.mock.calls[0][0].hovering).toBe(false);

      tracker.unregister(id);
    });

    it('lets Move and Hover, registered on the same element, both independently receive pointermove', () => {
      const tracker = new ElementGestureTracker(el);
      const onMoveChange = jest.fn();
      const onHoverChange = jest.fn();

      const moveId = tracker.register(Gesture.Move().onChange(onMoveChange));
      const hoverId = tracker.register(Gesture.Hover().onChange(onHoverChange));

      firePointer(el, 'pointermove', 10, 10);

      expect(onMoveChange).toHaveBeenCalledTimes(1);
      expect(onHoverChange).toHaveBeenCalledTimes(1);

      tracker.unregister(moveId);
      tracker.unregister(hoverId);
    });

    describe('multi-pointer (Pinch/Rotate) end to end', () => {
      it('dispatches Pinch end to end on a real two-pointer sequence, ignored by a registered Pan', () => {
        const tracker = new ElementGestureTracker(el);
        const onPinchChange = jest.fn();
        const onPanChange = jest.fn();

        const pinchId = tracker.register(
          Gesture.Pinch().threshold(0.1).onChange(onPinchChange)
        );
        const panId = tracker.register(Gesture.Pan().minDistance(5).onChange(onPanChange));

        // First finger down: only Pan's primary pointer, no pinch pair yet.
        firePointer(el, 'pointerdown', 0, 0, 1);
        expect(onPanChange).not.toHaveBeenCalled();

        // Second finger joins: hands off from Pan (forced cancel) to Pinch.
        firePointer(el, 'pointerdown', 100, 0, 2);
        firePointer(window, 'pointermove', 200, 0, 2);

        expect(onPinchChange).toHaveBeenCalledTimes(1);
        expect(onPinchChange.mock.calls[0][0].scale).toBeCloseTo(2, 5);
        // Pan never got far enough to move before the 2nd pointer cancelled it.
        expect(onPanChange).not.toHaveBeenCalled();

        tracker.unregister(pinchId);
        tracker.unregister(panId);
      });

      it('cancels an already-ACTIVE Pan when a second pointer joins, handing off to Pinch', () => {
        const tracker = new ElementGestureTracker(el);
        const onPanFinalize = jest.fn();
        const onPinchStart = jest.fn();

        const panId = tracker.register(
          Gesture.Pan().minDistance(5).onFinalize(onPanFinalize)
        );
        const pinchId = tracker.register(Gesture.Pinch().threshold(0.1).onStart(onPinchStart));

        firePointer(el, 'pointerdown', 0, 0, 1);
        firePointer(window, 'pointermove', 20, 0, 1); // Pan crosses minDistance -> ACTIVE

        firePointer(el, 'pointerdown', 120, 0, 2); // 2nd pointer joins
        expect(onPanFinalize).toHaveBeenCalledTimes(1);
        expect(onPanFinalize.mock.calls[0][0].phase).toBe('CANCELLED');

        firePointer(window, 'pointermove', 220, 0, 2);
        expect(onPinchStart).toHaveBeenCalledTimes(1);

        tracker.unregister(panId);
        tracker.unregister(pinchId);
      });

      it('ends Pinch cleanly when one of the two pointers is released', () => {
        const tracker = new ElementGestureTracker(el);
        const onPinchEnd = jest.fn();

        const pinchId = tracker.register(
          Gesture.Pinch().threshold(0.1).onEnd(onPinchEnd)
        );

        firePointer(el, 'pointerdown', 0, 0, 1);
        firePointer(el, 'pointerdown', 100, 0, 2);
        firePointer(window, 'pointermove', 200, 0, 2);
        firePointer(window, 'pointerup', 200, 0, 2);

        expect(onPinchEnd).toHaveBeenCalledTimes(1);

        tracker.unregister(pinchId);
      });

      it('lets Pinch and Rotate, registered on the same element, both independently receive the same two-pointer stream', () => {
        const tracker = new ElementGestureTracker(el);
        const onPinchChange = jest.fn();
        const onRotateChange = jest.fn();

        const pinchId = tracker.register(
          Gesture.Pinch().threshold(0.1).onChange(onPinchChange)
        );
        const rotateId = tracker.register(
          Gesture.Rotate().threshold(1).onChange(onRotateChange)
        );

        firePointer(el, 'pointerdown', 0, 0, 1);
        firePointer(el, 'pointerdown', 100, 0, 2);
        // Both scale (100 -> 200 apart) and rotate (along +x -> +y) at once.
        firePointer(window, 'pointermove', 0, 200, 2);

        expect(onPinchChange).toHaveBeenCalledTimes(1);
        expect(onRotateChange).toHaveBeenCalledTimes(1);

        tracker.unregister(pinchId);
        tracker.unregister(rotateId);
      });
    });
  });
});
