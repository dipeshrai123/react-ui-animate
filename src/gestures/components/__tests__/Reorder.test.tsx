import { useState } from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Reorder } from '../Reorder';
import { withTiming } from '../../../animation';

function HandleList({ onReorderSpy }: { onReorderSpy?: (v: string[]) => void }) {
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
          <Reorder.Handle>
            <span data-testid={`handle-${v}`}>::</span>
          </Reorder.Handle>
          <span>{v}</span>
        </Reorder.Item>
      ))}
    </Reorder.Group>
  );
}

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

  it('respects a custom `transition` for the release settle', () => {
    function TimingList() {
      const [values, setValues] = useState(['a', 'b', 'c']);
      return (
        <Reorder.Group
          values={values}
          axis="y"
          onReorder={setValues}
          transition={withTiming({ duration: 100 })}
        >
          {values.map((v) => (
            <Reorder.Item key={v} value={v}>
              {v}
            </Reorder.Item>
          ))}
        </Reorder.Group>
      );
    }

    render(<TimingList />);
    const itemA = screen.getByText('a');

    act(() => {
      firePointer(itemA, 'pointerdown', 0, 0);
      firePointer(window, 'pointermove', 0, 20);
      firePointer(window, 'pointerup', 0, 20);
    });

    // Mid-transition (50ms into a 100ms linear timing): still unsettled.
    act(() => {
      jest.advanceTimersByTime(50);
    });
    expect(itemA.style.transform).not.toContain('translateY(0px)');

    // Past the full 100ms duration: settled at 0 (timing, unlike a spring,
    // reaches its target and stops there instead of continuing to oscillate).
    act(() => {
      jest.advanceTimersByTime(200);
    });
    const settled = itemA.style.transform.match(/translateY\(([-\d.]+)px\)/);
    expect(settled).not.toBeNull();
    expect(Number(settled![1])).toBeCloseTo(0, 1);
  });

  it('raises the dragged item above its neighbors and restores it on release', () => {
    render(<List />);
    const itemA = screen.getByText('a');

    expect(itemA.style.zIndex).not.toBe('1');

    act(() => {
      firePointer(itemA, 'pointerdown', 0, 0);
      firePointer(window, 'pointermove', 0, 20);
    });
    expect(itemA.style.zIndex).toBe('1');

    act(() => {
      firePointer(window, 'pointerup', 0, 20);
      jest.advanceTimersByTime(1000);
    });
    expect(itemA.style.zIndex).not.toBe('1');
  });

  it('blocks text selection on the item and its handle', () => {
    render(<HandleList />);
    const itemA = screen.getByText('a').closest('div')!;
    const handleA = screen.getByTestId('handle-a').closest('div')!;

    expect(itemA.style.userSelect).toBe('none');
    expect(handleA.style.userSelect).toBe('none');
  });

  it('with Reorder.Handle, ignores drags started on the item body', () => {
    const onReorderSpy = jest.fn();
    render(<HandleList onReorderSpy={onReorderSpy} />);

    const itemABody = screen.getByText('a');

    act(() => {
      firePointer(itemABody, 'pointerdown', 0, 0);
      firePointer(window, 'pointermove', 0, 75);
      firePointer(window, 'pointerup', 0, 75);
    });

    expect(onReorderSpy).not.toHaveBeenCalled();
  });

  it('with Reorder.Handle, starts the drag from the handle', () => {
    const onReorderSpy = jest.fn();
    render(<HandleList onReorderSpy={onReorderSpy} />);

    const handleA = screen.getByTestId('handle-a');

    act(() => {
      firePointer(handleA, 'pointerdown', 0, 0);
      firePointer(window, 'pointermove', 0, 75);
    });

    expect(onReorderSpy).toHaveBeenCalledWith(['b', 'c', 'a']);

    act(() => {
      firePointer(window, 'pointerup', 0, 75);
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

describe('Reorder.Context (cross-list drag-and-drop)', () => {
  function rect(left: number, top: number, right: number, bottom: number) {
    return {
      left,
      top,
      right,
      bottom,
      width: right - left,
      height: bottom - top,
      x: left,
      y: top,
      toJSON() {},
    } as DOMRect;
  }

  function KanbanTest({
    onReorderA,
    onReorderB,
  }: {
    onReorderA?: (v: string[]) => void;
    onReorderB?: (v: string[]) => void;
  }) {
    const [a, setA] = useState(['a1', 'a2']);
    const [b, setB] = useState(['b1']);
    return (
      <Reorder.Context>
        <Reorder.Group
          className="group-a"
          values={a}
          onReorder={(next) => {
            setA(next);
            onReorderA?.(next);
          }}
        >
          {a.map((v) => (
            <Reorder.Item key={v} value={v}>
              {v}
            </Reorder.Item>
          ))}
        </Reorder.Group>
        <Reorder.Group
          className="group-b"
          values={b}
          onReorder={(next) => {
            setB(next);
            onReorderB?.(next);
          }}
        >
          {b.map((v) => (
            <Reorder.Item key={v} value={v}>
              {v}
            </Reorder.Item>
          ))}
        </Reorder.Group>
      </Reorder.Context>
    );
  }

  beforeEach(() => {
    jest.useFakeTimers();
    // Group A spans x:[0,200], group B spans x:[250,450]; items are 150x50
    // boxes positioned per a small lookup, keyed by class or text content.
    const itemPositions: Record<string, [number, number]> = {
      a1: [0, 0],
      a2: [0, 60],
      b1: [250, 0],
    };
    jest
      .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockImplementation(function (this: HTMLElement) {
        if (this.classList.contains('group-a')) return rect(0, 0, 200, 400);
        if (this.classList.contains('group-b')) return rect(250, 0, 450, 400);
        const [left, top] = itemPositions[this.textContent ?? ''] ?? [0, 0];
        return rect(left, top, left + 150, top + 50);
      });
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('transfers an item from one group to another when dropped inside its bounds', () => {
    const onReorderA = jest.fn();
    const onReorderB = jest.fn();
    render(<KanbanTest onReorderA={onReorderA} onReorderB={onReorderB} />);

    const itemA1 = screen.getByText('a1');

    act(() => {
      firePointer(itemA1, 'pointerdown', 0, 0);
      // a1 starts centered at (75, 25); +300/+20 lands its center at
      // (375, 45) — inside group B's bounds (x:[250,450]), below b1's
      // center (25), so it should insert after b1.
      firePointer(window, 'pointermove', 300, 20);
      firePointer(window, 'pointerup', 300, 20);
      jest.advanceTimersByTime(1000);
    });

    expect(onReorderA).toHaveBeenLastCalledWith(['a2']);
    expect(onReorderB).toHaveBeenLastCalledWith(['b1', 'a1']);
  });

  it('leaves both lists untouched when released back inside the origin group', () => {
    const onReorderA = jest.fn();
    const onReorderB = jest.fn();
    render(<KanbanTest onReorderA={onReorderA} onReorderB={onReorderB} />);

    const itemA1 = screen.getByText('a1');

    act(() => {
      firePointer(itemA1, 'pointerdown', 0, 0);
      // Small move, well within group A's own bounds.
      firePointer(window, 'pointermove', 10, 10);
      firePointer(window, 'pointerup', 10, 10);
      jest.advanceTimersByTime(1000);
    });

    expect(onReorderB).not.toHaveBeenCalled();
  });

  it('standalone Reorder.Group (no Reorder.Context) is unaffected by cross-group logic', () => {
    function StandaloneList() {
      const [values, setValues] = useState(['x', 'y', 'z']);
      return (
        <Reorder.Group values={values} onReorder={setValues}>
          {values.map((v) => (
            <Reorder.Item key={v} value={v}>
              {v}
            </Reorder.Item>
          ))}
        </Reorder.Group>
      );
    }

    render(<StandaloneList />);
    const itemX = screen.getByText('x');

    // No error thrown reaching for a null dnd context, and normal
    // same-group behavior still works.
    act(() => {
      firePointer(itemX, 'pointerdown', 0, 0);
      firePointer(window, 'pointermove', 0, 1000);
      firePointer(window, 'pointerup', 0, 1000);
      jest.advanceTimersByTime(1000);
    });

    expect(screen.getByText('x')).toBeInTheDocument();
  });
});
