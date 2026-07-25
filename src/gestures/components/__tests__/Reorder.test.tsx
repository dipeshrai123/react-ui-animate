import { useState } from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Reorder } from '../Reorder';

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

function List({ onReorderSpy }: { onReorderSpy?: (v: string[]) => void }) {
  const [values, setValues] = useState(['a', 'b', 'c']);
  return (
    <Reorder.Group
      values={values}
      axis="y"
      onReorder={(next) => {
        setValues(next);
        onReorderSpy?.(next);
      }}
    >
      {values.map((v) => (
        <Reorder.Item key={v} value={v}>
          {v}
        </Reorder.Item>
      ))}
    </Reorder.Group>
  );
}

describe('Reorder', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest
      .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockImplementation(
        () =>
          ({
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: 100,
            height: 50,
            x: 0,
            y: 0,
            toJSON() {},
          }) as DOMRect
      );
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('tracks the pointer 1:1 when no real reflow delta is measured', () => {
    // With `getBoundingClientRect` mocked to a fixed rect (no simulated
    // reflow), the post-commit FLIP measurement sees no delta, so `offset`
    // should equal raw pointer movement exactly — no predicted/guessed
    // slot-shift baked in. Regression guard for the jump this component
    // used to have: predicting the shift synchronously inside the drag
    // handler, ahead of React's actual (async) commit, instead of
    // measuring the real DOM delta after it lands.
    render(<List />);
    const itemA = screen.getByText('a');

    expect(itemA).toHaveAttribute('style', expect.stringContaining('translateY'));

    act(() => {
      firePointer(itemA, 'pointerdown', 0, 0);
      firePointer(window, 'pointermove', 0, 75);
    });

    // `offset` tracks the pointer 1:1 — no slot-shift subtracted out.
    expect(itemA.style.transform).toContain('translateY(75px)');

    act(() => {
      firePointer(window, 'pointerup', 0, 75);
      jest.advanceTimersByTime(1000);
    });
  });

  it('folds a real measured reflow delta into the dragged item instantly, but springs it for displaced neighbors', () => {
    // Rects reflect each item's *current* position in a live `order` array
    // (updated alongside the app's own state on every `onReorder`) so the
    // post-commit FLIP measurement sees an actual, real position change —
    // not the static mock the other tests use.
    let order = ['a', 'b', 'c'];
    (HTMLElement.prototype.getBoundingClientRect as jest.Mock).mockImplementation(
      function (this: HTMLElement) {
        const text = this.textContent ?? '';
        const top = order.indexOf(text) * 70;
        return {
          top,
          left: 0,
          right: 0,
          bottom: top + 50,
          width: 100,
          height: 50,
          x: 0,
          y: top,
          toJSON() {},
        } as DOMRect;
      }
    );

    function LiveOrderList() {
      const [values, setValues] = useState(order);
      return (
        <Reorder.Group
          values={values}
          axis="y"
          onReorder={(next) => {
            order = next;
            setValues(next);
          }}
        >
          {values.map((v) => (
            <Reorder.Item key={v} value={v}>
              {v}
            </Reorder.Item>
          ))}
        </Reorder.Group>
      );
    }

    render(<LiveOrderList />);
    const itemA = screen.getByText('a');
    const itemB = screen.getByText('b');

    act(() => {
      firePointer(itemA, 'pointerdown', 0, 0);
      // Past the 70px pitch's half threshold (35) — triggers the a/b swap.
      firePointer(window, 'pointermove', 0, 80);
    });

    // 'a' (dragged) reflowed from top 0 to top 70 (+70) when the swap
    // committed; that's folded into `offset` instantly, so the transform
    // reflects `movement(80) + correction(-70) = 10`, not a raw 80 (which
    // would mean the reflow wasn't compensated) and not 80 unchanged forever
    // (which would mean the correction never ran).
    expect(itemA.style.transform).toContain('translateY(10px)');

    // 'b' (displaced, not dragged) reflowed the other way (top 70 -> 0, a
    // -(-70) = +70 inversion) and should still be settling via spring — not
    // yet at its final resting value of 0.
    expect(itemB.style.transform).not.toContain('translateY(0px)');
    const bBeforeSettle = itemB.style.transform;

    act(() => {
      jest.advanceTimersByTime(1000);
    });
    const settledMatch = itemB.style.transform.match(/translateY\(([-\d.]+)px\)/);
    expect(settledMatch).not.toBeNull();
    expect(Number(settledMatch![1])).toBeCloseTo(0, 1);
    expect(itemB.style.transform).not.toBe(bBeforeSettle);

    act(() => {
      firePointer(window, 'pointerup', 0, 80);
      jest.advanceTimersByTime(1000);
    });
  });

  it('reorders when dragged past a full item slot', () => {
    const onReorderSpy = jest.fn();
    render(<List onReorderSpy={onReorderSpy} />);

    const itemA = screen.getByText('a');

    act(() => {
      firePointer(itemA, 'pointerdown', 0, 0);
      // Item height is 50; dragging past 1.5 slots (75px) should move 'a'
      // two slots down (round(75/50) = round(1.5) = 2).
      firePointer(window, 'pointermove', 0, 75);
    });

    expect(onReorderSpy).toHaveBeenCalledWith(['b', 'c', 'a']);

    act(() => {
      firePointer(window, 'pointerup', 0, 75);
      jest.advanceTimersByTime(1000);
    });
  });

  it('does not reorder for small movements under a slot', () => {
    const onReorderSpy = jest.fn();
    render(<List onReorderSpy={onReorderSpy} />);

    const itemA = screen.getByText('a');

    act(() => {
      firePointer(itemA, 'pointerdown', 0, 0);
      // 20px is well under half the 50px slot — rounds back to index 0.
      firePointer(window, 'pointermove', 0, 20);
      firePointer(window, 'pointerup', 0, 20);
      jest.advanceTimersByTime(1000);
    });

    expect(onReorderSpy).not.toHaveBeenCalled();
  });

  it('accounts for gaps between items, not just their own size', () => {
    // Items are 50px tall with a 20px gap between them (a 70px pitch), like
    // a flex list with `gap: 20`. Positions below assume 'a','b','c' start
    // stacked at y = 0, 70, 140 respectively.
    const rectsByText: Record<string, number> = { a: 0, b: 70, c: 140 };
    (HTMLElement.prototype.getBoundingClientRect as jest.Mock).mockImplementation(
      function (this: HTMLElement) {
        const text = this.textContent ?? '';
        const top = rectsByText[text] ?? 0;
        return {
          top,
          left: 0,
          right: 0,
          bottom: top + 50,
          width: 100,
          height: 50,
          x: 0,
          y: top,
          toJSON() {},
        } as DOMRect;
      }
    );

    const onReorderSpy = jest.fn();
    render(<List onReorderSpy={onReorderSpy} />);

    const itemA = screen.getByText('a');

    act(() => {
      firePointer(itemA, 'pointerdown', 0, 0);
      // Past half the item's own size (25) but under half the real 70px
      // pitch (35) — a measurement that only looked at the item's own
      // height would swap here; the gap-aware pitch shouldn't yet.
      firePointer(window, 'pointermove', 0, 30);
    });
    expect(onReorderSpy).not.toHaveBeenCalled();

    act(() => {
      // Past half the real pitch (35) now.
      firePointer(window, 'pointermove', 0, 40);
    });
    expect(onReorderSpy).toHaveBeenCalledWith(['b', 'a', 'c']);

    act(() => {
      firePointer(window, 'pointerup', 0, 40);
      jest.advanceTimersByTime(1000);
    });
  });

  it('swaps back when dragged back past the threshold', () => {
    const onReorderSpy = jest.fn();
    render(<List onReorderSpy={onReorderSpy} />);

    const itemA = screen.getByText('a');

    act(() => {
      firePointer(itemA, 'pointerdown', 0, 0);
      firePointer(window, 'pointermove', 0, 75);
    });
    expect(onReorderSpy).toHaveBeenLastCalledWith(['b', 'c', 'a']);

    act(() => {
      // Drag back up past the first swap's threshold.
      firePointer(window, 'pointermove', 0, 0);
    });
    expect(onReorderSpy).toHaveBeenLastCalledWith(['a', 'b', 'c']);

    act(() => {
      firePointer(window, 'pointerup', 0, 0);
      jest.advanceTimersByTime(1000);
    });
  });
});
