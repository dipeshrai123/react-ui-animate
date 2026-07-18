import { renderHook } from '@testing-library/react';
import { useGesture } from '../useGesture';
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

describe('useGesture', () => {
  let el: HTMLDivElement;

  beforeEach(() => {
    el = document.createElement('div');
    document.body.appendChild(el);
  });

  afterEach(() => {
    el.remove();
  });

  it('registers on mount and dispatches to the latest handlers', () => {
    const ref = { current: el };
    const onChange = jest.fn();

    const { rerender } = renderHook(
      ({ handler }: { handler: (e: any) => void }) =>
        useGesture(ref, Gesture.Pan().minDistance(5).onChange(handler)),
      { initialProps: { handler: onChange } }
    );

    firePointer(el, 'pointerdown', 0, 0);
    firePointer(window, 'pointermove', 20, 0);
    expect(onChange).toHaveBeenCalledTimes(1);

    const onChange2 = jest.fn();
    rerender({ handler: onChange2 });

    firePointer(window, 'pointermove', 30, 0);
    expect(onChange2).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('unregisters on unmount, stopping further dispatch', () => {
    const ref = { current: el };
    const onStart = jest.fn();

    const { unmount } = renderHook(() =>
      useGesture(ref, Gesture.Pan().minDistance(5).onStart(onStart))
    );

    unmount();

    firePointer(el, 'pointerdown', 0, 0);
    firePointer(window, 'pointermove', 20, 0);

    expect(onStart).not.toHaveBeenCalled();
  });

  it('applies config changes (e.g. minDistance) after mount, unlike useRecognizer', () => {
    const ref = { current: el };
    const onStart = jest.fn();

    const { rerender } = renderHook(
      ({ minDistance }: { minDistance: number }) =>
        useGesture(ref, Gesture.Pan().minDistance(minDistance).onStart(onStart)),
      { initialProps: { minDistance: 1000 } }
    );

    firePointer(el, 'pointerdown', 0, 0);
    firePointer(window, 'pointermove', 5, 0);
    expect(onStart).not.toHaveBeenCalled();

    rerender({ minDistance: 1 });

    firePointer(window, 'pointermove', 10, 0);
    expect(onStart).toHaveBeenCalledTimes(1);
  });

  it('does nothing if the ref has no current element', () => {
    const ref = { current: null as HTMLDivElement | null };
    const onStart = jest.fn();

    renderHook(() => useGesture(ref, Gesture.Pan().minDistance(5).onStart(onStart)));

    firePointer(el, 'pointerdown', 0, 0);
    firePointer(window, 'pointermove', 20, 0);

    expect(onStart).not.toHaveBeenCalled();
  });

  it('attaches once a conditionally-rendered ref is populated on a later render', () => {
    const ref = { current: null as HTMLDivElement | null };
    const onStart = jest.fn();

    const { rerender } = renderHook(
      () => useGesture(ref, Gesture.Pan().minDistance(5).onStart(onStart)),
      { initialProps: {} }
    );

    firePointer(el, 'pointerdown', 0, 0);
    firePointer(window, 'pointermove', 20, 0);
    expect(onStart).not.toHaveBeenCalled();

    // Simulates a node that mounts later (e.g. gated by `activeIndex !== null`).
    ref.current = el;
    rerender({});

    firePointer(window, 'pointerup', 20, 0);
    firePointer(el, 'pointerdown', 0, 0);
    firePointer(window, 'pointermove', 20, 0);
    expect(onStart).toHaveBeenCalledTimes(1);
  });

  describe('array mode', () => {
    let elB: HTMLDivElement;

    beforeEach(() => {
      elB = document.createElement('div');
      document.body.appendChild(elB);
    });

    afterEach(() => {
      elB.remove();
    });

    it('registers each ref independently and merges `index` into events', () => {
      const refA = { current: el };
      const refB = { current: elB };
      const events: any[] = [];

      renderHook(() =>
        useGesture(
          [refA, refB],
          Gesture.Pan()
            .minDistance(5)
            .onChange((e) => events.push(e))
        )
      );

      firePointer(el, 'pointerdown', 0, 0);
      firePointer(window, 'pointermove', 20, 0);
      firePointer(window, 'pointerup', 20, 0);

      firePointer(elB, 'pointerdown', 0, 0);
      firePointer(window, 'pointermove', 20, 0);

      expect(events).toHaveLength(2);
      expect(events[0].index).toBe(0);
      expect(events[1].index).toBe(1);
    });

    it('supports a per-index descriptor factory', () => {
      const refA = { current: el };
      const refB = { current: elB };
      const onStartA = jest.fn();
      const onStartB = jest.fn();

      renderHook(() =>
        useGesture([refA, refB], (index) =>
          Gesture.Pan()
            .minDistance(5)
            .onStart(index === 0 ? onStartA : onStartB)
        )
      );

      firePointer(el, 'pointerdown', 0, 0);
      firePointer(window, 'pointermove', 20, 0);
      firePointer(window, 'pointerup', 20, 0);

      expect(onStartA).toHaveBeenCalledTimes(1);
      expect(onStartB).not.toHaveBeenCalled();
    });

    it('diffs by ref identity: removing a ref unregisters only that one', () => {
      const refA = { current: el };
      const refB = { current: elB };
      const onStartA = jest.fn();
      const onStartB = jest.fn();

      const { rerender } = renderHook(
        ({ refs }: { refs: typeof refA[] }) =>
          useGesture(
            refs,
            (index) =>
              Gesture.Pan()
                .minDistance(5)
                .onStart(index === 0 ? onStartA : onStartB)
          ),
        { initialProps: { refs: [refA, refB] } }
      );

      rerender({ refs: [refA] });

      firePointer(elB, 'pointerdown', 0, 0);
      firePointer(window, 'pointermove', 20, 0);
      expect(onStartB).not.toHaveBeenCalled();

      firePointer(el, 'pointerdown', 0, 0);
      firePointer(window, 'pointermove', 20, 0);
      expect(onStartA).toHaveBeenCalledTimes(1);
    });
  });

  describe('continuous gestures (move/wheel/scroll)', () => {
    it('dispatches Gesture.Move() via the shared ElementGestureTracker', () => {
      const onChange = jest.fn();
      renderHook(() => useGesture({ current: el }, Gesture.Move().onChange(onChange)));

      firePointer(el, 'pointermove', 10, 10);
      expect(onChange).toHaveBeenCalledTimes(1);
    });

    it('keeps Move handlers live without re-subscribing', () => {
      const onChangeA = jest.fn();
      const onChangeB = jest.fn();
      const ref = { current: el };

      const { rerender } = renderHook(
        ({ handler }: { handler: (e: any) => void }) =>
          useGesture(ref, Gesture.Move().onChange(handler)),
        { initialProps: { handler: onChangeA } }
      );

      firePointer(el, 'pointermove', 10, 10);
      expect(onChangeA).toHaveBeenCalledTimes(1);

      rerender({ handler: onChangeB });
      firePointer(el, 'pointermove', 20, 20);

      expect(onChangeB).toHaveBeenCalledTimes(1);
      expect(onChangeA).toHaveBeenCalledTimes(1);
    });
  });
});
