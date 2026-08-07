import { renderHook, act } from '@testing-library/react';
import { useDrag } from '../useDrag';
import { withTiming } from '../../../animation';

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

  it('bounces off bounds during a momentum fling when `bounce` is set, instead of sticking', () => {
    const ref = { current: el };
    const { result } = renderHook(() =>
      useDrag(ref, {
        bounds: { left: 0, right: 20 },
        elastic: false,
        momentum: true,
        decay: 0.995,
        bounce: 0.6,
      })
    );

    act(() => {
      firePointer(el, 'pointerdown', 0, 0);
      firePointer(window, 'pointermove', 5, 0);
      firePointer(window, 'pointermove', 15, 0);
      firePointer(window, 'pointerup', 15, 0);
    });

    let touchedBound = false;
    let movedAwayAfterTouch = false;

    act(() => {
      for (let i = 0; i < 200; i++) {
        jest.advanceTimersByTime(16);
        const x = result.current.x.current;
        expect(x).toBeLessThanOrEqual(20);
        expect(x).toBeGreaterThanOrEqual(0);
        if (x === 20 || x === 0) touchedBound = true;
        else if (touchedBound) movedAwayAfterTouch = true;
      }
    });

    expect(touchedBound).toBe(true);
    expect(movedAwayAfterTouch).toBe(true);
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

  it('snaps to the nearest point on release, ignoring momentum', () => {
    const ref = { current: el };
    const { result } = renderHook(() =>
      useDrag(ref, { snapPoints: { x: [0, 100, 200] }, momentum: true })
    );

    act(() => {
      firePointer(el, 'pointerdown', 0, 0);
      firePointer(window, 'pointermove', 60, 0);
      firePointer(window, 'pointerup', 60, 0);
      jest.advanceTimersByTime(1000);
    });

    // Released closest to 100, not carried further by momentum.
    expect(result.current.x.current).toBeCloseTo(100, 0);
  });

  it('projects the snap target ahead using release velocity', () => {
    const ref = { current: el };
    const { result } = renderHook(() =>
      useDrag(ref, { snapPoints: { x: [0, 5] } })
    );

    act(() => {
      firePointer(el, 'pointerdown', 0, 0);
      // Lands at 2, closer to 0 by raw distance — but released moving fast
      // rightward (velocity clamps to the tracker's max, 20), and the
      // release-velocity projection (`snapTo`'s `value + velocity * 0.2`)
      // pushes the projected landing point past the midpoint, to 5.
      firePointer(window, 'pointermove', 2, 0);
      firePointer(window, 'pointerup', 2, 0);
      jest.advanceTimersByTime(1000);
    });

    expect(result.current.x.current).toBeCloseTo(5, 0);
  });

  it('only snaps the axis with snap points, leaving the other free', () => {
    const ref = { current: el };
    const { result } = renderHook(() =>
      useDrag(ref, { snapPoints: { x: [0, 100] }, momentum: false })
    );

    act(() => {
      firePointer(el, 'pointerdown', 0, 0);
      firePointer(window, 'pointermove', 60, 45);
      firePointer(window, 'pointerup', 60, 45);
      jest.advanceTimersByTime(1000);
    });

    expect(result.current.x.current).toBeCloseTo(100, 0);
    expect(result.current.y.current).toBe(45);
  });

  it('clamps the snap target to bounds when both are set', () => {
    const ref = { current: el };
    const { result } = renderHook(() =>
      useDrag(ref, {
        snapPoints: { x: [0, 100, 200] },
        bounds: { left: -Infinity, right: 50 },
        elastic: false,
      })
    );

    act(() => {
      firePointer(el, 'pointerdown', 0, 0);
      firePointer(window, 'pointermove', 60, 0);
      firePointer(window, 'pointerup', 60, 0);
      jest.advanceTimersByTime(1000);
    });

    // Nearest snap point (100) is outside the bound, so it clamps to 50.
    expect(result.current.x.current).toBeCloseTo(50, 0);
  });

  it('settles into bounds via a custom `transition` (timing) instead of the default spring', () => {
    const ref = { current: el };
    const { result } = renderHook(() =>
      useDrag(ref, {
        momentum: false,
        bounds: { left: -20, right: 20 },
        transition: withTiming({ duration: 100 }),
      })
    );

    act(() => {
      firePointer(el, 'pointerdown', 0, 0);
      firePointer(window, 'pointermove', 100, 0);
      firePointer(window, 'pointerup', 100, 0);
    });

    // Mid-transition: still unsettled.
    act(() => {
      jest.advanceTimersByTime(50);
    });
    expect(result.current.x.current).not.toBeCloseTo(20, 0);

    // Past the full duration: settled exactly, not still springing.
    act(() => {
      jest.advanceTimersByTime(200);
    });
    expect(result.current.x.current).toBeCloseTo(20, 0);
  });

  it('lets a custom `decay` tune how far the momentum fling travels', () => {
    const highFriction = { current: document.createElement('div') };
    document.body.appendChild(highFriction.current);
    const defaultFriction = { current: document.createElement('div') };
    document.body.appendChild(defaultFriction.current);

    const { result: lowDecayResult } = renderHook(() =>
      useDrag(highFriction, { decay: 0.9 })
    );
    const { result: defaultDecayResult } = renderHook(() => useDrag(defaultFriction));

    act(() => {
      firePointer(highFriction.current, 'pointerdown', 0, 0);
      firePointer(window, 'pointermove', 10, 0);
      firePointer(window, 'pointermove', 30, 0);
      firePointer(window, 'pointerup', 30, 0);
    });
    act(() => {
      firePointer(defaultFriction.current, 'pointerdown', 0, 0);
      firePointer(window, 'pointermove', 10, 0);
      firePointer(window, 'pointermove', 30, 0);
      firePointer(window, 'pointerup', 30, 0);
    });

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // Lower `decay` (more friction) should have coasted a shorter distance
    // past the release point than the default.
    expect(lowDecayResult.current.x.current).toBeLessThan(defaultDecayResult.current.x.current);

    highFriction.current.remove();
    defaultFriction.current.remove();
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
