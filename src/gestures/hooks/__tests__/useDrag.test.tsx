import { renderHook, act } from '@testing-library/react';
import { useDrag } from '../useDrag';

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

describe('useDrag', () => {
  let el: HTMLDivElement;

  beforeEach(() => {
    jest.useFakeTimers();
    el = document.createElement('div');
    document.body.appendChild(el);
  });

  afterEach(() => {
    jest.useRealTimers();
    el.remove();
  });

  it('tracks pointer movement 1:1 with no bounds', () => {
    const ref = { current: el };
    const { result } = renderHook(() => useDrag(ref, { momentum: false }));

    expect(result.current.isDragging).toBe(false);

    act(() => {
      firePointer(el, 'pointerdown', 0, 0);
      firePointer(window, 'pointermove', 40, 15);
    });

    expect(result.current.isDragging).toBe(true);
    expect(result.current.x.current).toBe(40);
    expect(result.current.y.current).toBe(15);

    act(() => {
      firePointer(window, 'pointerup', 40, 15);
    });

    expect(result.current.isDragging).toBe(false);
  });

  it('persists position across separate drags instead of resetting', () => {
    const ref = { current: el };
    const { result } = renderHook(() => useDrag(ref, { momentum: false }));

    act(() => {
      firePointer(el, 'pointerdown', 0, 0);
      firePointer(window, 'pointermove', 50, 0);
      firePointer(window, 'pointerup', 50, 0);
    });

    expect(result.current.x.current).toBe(50);

    act(() => {
      firePointer(el, 'pointerdown', 100, 100);
      firePointer(window, 'pointermove', 130, 100);
      firePointer(window, 'pointerup', 130, 100);
    });

    // Second drag moved +30 more, starting from the settled 50.
    expect(result.current.x.current).toBe(80);
  });

  it('locks movement to a single axis', () => {
    const ref = { current: el };
    const { result } = renderHook(() => useDrag(ref, { axis: 'x', momentum: false }));

    act(() => {
      firePointer(el, 'pointerdown', 0, 0);
      firePointer(window, 'pointermove', 40, 25);
    });

    expect(result.current.x.current).toBe(40);
    expect(result.current.y.current).toBe(0);
  });

  it('hard-clamps to bounds during the drag when elastic is false', () => {
    const ref = { current: el };
    const { result } = renderHook(() =>
      useDrag(ref, {
        momentum: false,
        elastic: false,
        bounds: { left: -20, right: 20, top: -20, bottom: 20 },
      })
    );

    act(() => {
      firePointer(el, 'pointerdown', 0, 0);
      firePointer(window, 'pointermove', 100, 0);
    });

    expect(result.current.x.current).toBe(20);

    act(() => {
      firePointer(window, 'pointerup', 100, 0);
    });
  });

  it('rubber-bands past bounds during the drag by default', () => {
    const ref = { current: el };
    const { result } = renderHook(() =>
      useDrag(ref, { momentum: false, bounds: { left: -20, right: 20 } })
    );

    act(() => {
      firePointer(el, 'pointerdown', 0, 0);
      firePointer(window, 'pointermove', 100, 0);
    });

    // Elastic: over the edge but resisted, not hard-clamped to exactly 20.
    expect(result.current.x.current).toBeGreaterThan(20);
    expect(result.current.x.current).toBeLessThan(100);
  });

  it('springs back into bounds on release even with momentum enabled, if released while rubber-banded out', () => {
    const ref = { current: el };
    const { result } = renderHook(() =>
      useDrag(ref, { bounds: { left: -20, right: 20 }, momentum: true })
    );

    act(() => {
      firePointer(el, 'pointerdown', 0, 0);
      firePointer(window, 'pointermove', 100, 0);
    });

    expect(result.current.x.current).toBeGreaterThan(20);

    act(() => {
      firePointer(window, 'pointerup', 100, 0);
      jest.advanceTimersByTime(1000);
    });

    // Should have settled back at the boundary, not coasted further out.
    expect(result.current.x.current).toBeCloseTo(20, 0);
  });

  it('never overshoots bounds during a momentum fling, even with elastic on', () => {
    const ref = { current: el };
    const { result } = renderHook(() =>
      useDrag(ref, { bounds: { left: 0, right: 20 }, elastic: true, momentum: true })
    );

    act(() => {
      firePointer(el, 'pointerdown', 0, 0);
      // Fast, large movement so release velocity is high.
      firePointer(window, 'pointermove', 5, 0);
      firePointer(window, 'pointermove', 15, 0);
      firePointer(window, 'pointerup', 15, 0);
    });

    act(() => {
      for (let i = 0; i < 200; i++) {
        jest.advanceTimersByTime(16);
        expect(result.current.x.current).toBeLessThanOrEqual(20);
        expect(result.current.x.current).toBeGreaterThanOrEqual(0);
      }
    });
  });

  it('applies momentum via decay after release', () => {
    const ref = { current: el };
    const { result } = renderHook(() => useDrag(ref));

    act(() => {
      firePointer(el, 'pointerdown', 0, 0);
      firePointer(window, 'pointermove', 10, 0);
      firePointer(window, 'pointermove', 30, 0);
      firePointer(window, 'pointerup', 30, 0);
    });

    const settledAfterRelease = result.current.x.current;

    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Momentum should have carried it further than where the pointer let go
    // (or at least changed the value away from the raw release position).
    expect(result.current.x.current).not.toBe(settledAfterRelease);
  });

  it('snaps back into bounds via spring when momentum is disabled', () => {
    const ref = { current: el };
    const { result } = renderHook(() =>
      useDrag(ref, { momentum: false, bounds: { left: -20, right: 20 } })
    );

    act(() => {
      firePointer(el, 'pointerdown', 0, 0);
      firePointer(window, 'pointermove', 100, 0);
      firePointer(window, 'pointerup', 100, 0);
    });

    expect(result.current.x.current).toBeGreaterThan(20);

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(result.current.x.current).toBeCloseTo(20, 0);
  });

  it('does not respond to pointer events when disabled', () => {
    const ref = { current: el };
    const onStart = jest.fn();
    const { result } = renderHook(() =>
      useDrag(ref, { enabled: false, onStart })
    );

    act(() => {
      firePointer(el, 'pointerdown', 0, 0);
      firePointer(window, 'pointermove', 40, 0);
    });

    expect(onStart).not.toHaveBeenCalled();
    expect(result.current.x.current).toBe(0);
  });

  it('fires onStart/onChange/onEnd', () => {
    const ref = { current: el };
    const onStart = jest.fn();
    const onChange = jest.fn();
    const onEnd = jest.fn();

    renderHook(() =>
      useDrag(ref, { momentum: false, onStart, onChange, onEnd })
    );

    act(() => {
      firePointer(el, 'pointerdown', 0, 0);
      firePointer(window, 'pointermove', 10, 0);
      firePointer(window, 'pointerup', 10, 0);
    });

    expect(onStart).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onEnd).toHaveBeenCalledTimes(1);
  });

  it('exposes controls that can cancel in-flight momentum', () => {
    const ref = { current: el };
    const { result } = renderHook(() => useDrag(ref));

    act(() => {
      firePointer(el, 'pointerdown', 0, 0);
      firePointer(window, 'pointermove', 30, 0);
      firePointer(window, 'pointerup', 30, 0);
    });

    act(() => {
      result.current.controls.cancel();
    });

    const valueAfterCancel = result.current.x.current;

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(result.current.x.current).toBe(valueAfterCancel);
  });
});
