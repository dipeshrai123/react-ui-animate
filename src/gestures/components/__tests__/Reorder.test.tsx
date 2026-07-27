import { useState } from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Reorder } from '../Reorder';
import { withTiming } from '../../../animation';

function HandleList({
  onReorderSpy,
}: {
  onReorderSpy?: (v: string[]) => void;
}) {
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

function firePointer(
  target: HTMLElement | Window,
  type: string,
  x: number,
  y: number
) {
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
    render(<List />);
    const itemA = screen.getByText('a');

    expect(itemA).toHaveAttribute(
      'style',
      expect.stringContaining('translateY')
    );

    act(() => {
      firePointer(itemA, 'pointerdown', 0, 0);
      firePointer(window, 'pointermove', 0, 75);
    });

    expect(itemA.style.transform).toContain('translateY(75px)');

    act(() => {
      firePointer(window, 'pointerup', 0, 75);
      jest.advanceTimersByTime(1000);
    });
  });

  it('folds a real measured reflow delta into the dragged item instantly, but springs it for displaced neighbors', () => {
    let order = ['a', 'b', 'c'];
    (
      HTMLElement.prototype.getBoundingClientRect as jest.Mock
    ).mockImplementation(function (this: HTMLElement) {
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
    });

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
      firePointer(window, 'pointermove', 0, 80);
    });

    expect(itemA.style.transform).toContain('translateY(10px)');

    expect(itemB.style.transform).not.toContain('translateY(0px)');
    const bBeforeSettle = itemB.style.transform;

    act(() => {
      jest.advanceTimersByTime(1000);
    });
    const settledMatch = itemB.style.transform.match(
      /translateY\(([-\d.]+)px\)/
    );
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

    act(() => {
      jest.advanceTimersByTime(50);
    });
    expect(itemA.style.transform).not.toContain('translateY(0px)');

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

    expect(itemA.style.zIndex).not.toBe('2');

    act(() => {
      firePointer(itemA, 'pointerdown', 0, 0);
      firePointer(window, 'pointermove', 0, 20);
    });
    expect(itemA.style.zIndex).toBe('2');

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
      firePointer(window, 'pointermove', 0, 20);
      firePointer(window, 'pointerup', 0, 20);
      jest.advanceTimersByTime(1000);
    });

    expect(onReorderSpy).not.toHaveBeenCalled();
  });

  it('accounts for gaps between items, not just their own size', () => {
    const rectsByText: Record<string, number> = { a: 0, b: 70, c: 140 };
    (
      HTMLElement.prototype.getBoundingClientRect as jest.Mock
    ).mockImplementation(function (this: HTMLElement) {
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
    });

    const onReorderSpy = jest.fn();
    render(<List onReorderSpy={onReorderSpy} />);

    const itemA = screen.getByText('a');

    act(() => {
      firePointer(itemA, 'pointerdown', 0, 0);
      firePointer(window, 'pointermove', 0, 30);
    });
    expect(onReorderSpy).not.toHaveBeenCalled();

    act(() => {
      firePointer(window, 'pointermove', 0, 40);
    });
    expect(onReorderSpy).toHaveBeenCalledWith(['b', 'a', 'c']);

    act(() => {
      firePointer(window, 'pointerup', 0, 40);
      jest.advanceTimersByTime(1000);
    });
  });

  it('keeps the dragged item elevated (zIndex) until its post-drop settle animation completes', () => {
    let order = ['a', 'b', 'c', 'd', 'e'];
    (
      HTMLElement.prototype.getBoundingClientRect as jest.Mock
    ).mockImplementation(function (this: HTMLElement) {
      const text = this.textContent ?? '';
      const top = order.indexOf(text) * 70;
      return {
        top,
        left: 0,
        right: 100,
        bottom: top + 50,
        width: 100,
        height: 50,
        x: 0,
        y: top,
        toJSON() {},
      } as DOMRect;
    });

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

    act(() => {
      firePointer(itemA, 'pointerdown', 0, 0);
      firePointer(window, 'pointermove', 0, 150);
    });

    act(() => {
      firePointer(window, 'pointerup', 0, 150);
    });

    // Right after drop the item is still visually mid-flight back to its
    // resting slot (translateY isn't 0 yet) — zIndex must still be elevated
    // here, or it can render underneath a neighbor it's sliding past.
    act(() => {
      jest.advanceTimersByTime(16);
    });
    expect(itemA.style.transform).not.toContain('translateY(0px)');
    expect(itemA.style.zIndex).toBe('1');

    // Once the settle spring actually finishes, zIndex releases.
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(itemA.style.zIndex).not.toBe('1');
  });

  it('gives a freshly started drag a higher zIndex than an item still settling from a previous drop', () => {
    let order = ['a', 'b', 'c', 'd', 'e'];
    (
      HTMLElement.prototype.getBoundingClientRect as jest.Mock
    ).mockImplementation(function (this: HTMLElement) {
      const text = this.textContent ?? '';
      const top = order.indexOf(text) * 70;
      return {
        top,
        left: 0,
        right: 100,
        bottom: top + 50,
        width: 100,
        height: 50,
        x: 0,
        y: top,
        toJSON() {},
      } as DOMRect;
    });

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
    const itemE = screen.getByText('e');

    act(() => {
      firePointer(itemA, 'pointerdown', 0, 0);
      firePointer(window, 'pointermove', 0, 90);
    });
    act(() => {
      firePointer(window, 'pointerup', 0, 90);
    });

    // Grab a different item before 'a's settle spring has finished.
    act(() => {
      firePointer(itemE, 'pointerdown', 0, 0);
      firePointer(window, 'pointermove', 0, 10);
    });

    expect(itemA.style.zIndex).toBe('1');
    expect(itemE.style.zIndex).toBe('2');

    act(() => {
      firePointer(window, 'pointerup', 0, 10);
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
      firePointer(window, 'pointermove', 300, 20);
      firePointer(window, 'pointerup', 300, 20);
      jest.advanceTimersByTime(1000);
    });

    expect(onReorderA).toHaveBeenLastCalledWith(['a2']);
    expect(onReorderB).toHaveBeenLastCalledWith(['b1', 'a1']);
  });

  it('previews a gap in the target group while hovering, without touching its array until drop', () => {
    const onReorderA = jest.fn();
    const onReorderB = jest.fn();
    render(<KanbanTest onReorderA={onReorderA} onReorderB={onReorderB} />);

    const itemA1 = screen.getByText('a1');
    const itemB1 = screen.getByText('b1');

    act(() => {
      firePointer(itemA1, 'pointerdown', 0, 0);
      firePointer(window, 'pointermove', 300, -20);
    });

    expect(onReorderB).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    const previewMatch = itemB1.style.transform.match(
      /translateY\(([-\d.]+)px\)/
    );
    expect(previewMatch).not.toBeNull();
    expect(Number(previewMatch![1])).toBeCloseTo(50, 0);

    act(() => {
      firePointer(window, 'pointerup', 300, -20);
    });
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(onReorderA).toHaveBeenLastCalledWith(['a2']);
    expect(onReorderB).toHaveBeenLastCalledWith(['a1', 'b1']);

    const afterMatch = itemB1.style.transform.match(
      /translateY\(([-\d.]+)px\)/
    );
    expect(afterMatch).not.toBeNull();
    expect(Number(afterMatch![1])).toBeCloseTo(0, 0);
  });

  it('clears the preview gap if the pointer leaves the target group without dropping', () => {
    const onReorderA = jest.fn();
    const onReorderB = jest.fn();
    render(<KanbanTest onReorderA={onReorderA} onReorderB={onReorderB} />);

    const itemA1 = screen.getByText('a1');
    const itemB1 = screen.getByText('b1');

    act(() => {
      firePointer(itemA1, 'pointerdown', 0, 0);
      firePointer(window, 'pointermove', 300, -20);
    });
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(
      Number(itemB1.style.transform.match(/translateY\(([-\d.]+)px\)/)![1])
    ).toBeCloseTo(50, 0);

    act(() => {
      firePointer(window, 'pointermove', 10, 10);
    });
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    const clearedMatch = itemB1.style.transform.match(
      /translateY\(([-\d.]+)px\)/
    );
    expect(clearedMatch).not.toBeNull();
    expect(Number(clearedMatch![1])).toBeCloseTo(0, 0);

    act(() => {
      firePointer(window, 'pointerup', 10, 10);
      jest.advanceTimersByTime(1000);
    });
    expect(onReorderB).not.toHaveBeenCalled();
  });

  it('drops into the middle of a multi-item target group without erroring or losing items', () => {
    let orderB = ['b1', 'b2'];
    (
      HTMLElement.prototype.getBoundingClientRect as jest.Mock
    ).mockImplementation(function (this: HTMLElement) {
      if (this.classList.contains('group-a')) return rect(0, 0, 200, 400);
      if (this.classList.contains('group-b')) return rect(250, 0, 450, 400);
      const text = this.textContent ?? '';
      if (text === 'a1') return rect(0, 0, 150, 50);
      const top = orderB.indexOf(text) * 70;
      return rect(250, top, 400, top + 50);
    });

    function LiveKanbanTest({
      onReorderB,
    }: {
      onReorderB?: (v: string[]) => void;
    }) {
      const [a, setA] = useState(['a1']);
      const [b, setB] = useState(orderB);
      return (
        <Reorder.Context>
          <Reorder.Group className="group-a" values={a} onReorder={setA}>
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
              orderB = next;
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

    const onReorderB = jest.fn();
    render(<LiveKanbanTest onReorderB={onReorderB} />);
    const itemA1 = screen.getByText('a1');

    act(() => {
      firePointer(itemA1, 'pointerdown', 0, 0);
      firePointer(window, 'pointermove', 300, 60);
    });
    act(() => {
      jest.advanceTimersByTime(500);
    });

    act(() => {
      firePointer(window, 'pointerup', 300, 60);
    });
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(onReorderB).toHaveBeenLastCalledWith(['b1', 'a1', 'b2']);
    expect(screen.getByText('a1')).toBeInTheDocument();
    expect(screen.getByText('b1')).toBeInTheDocument();
    expect(screen.getByText('b2')).toBeInTheDocument();
  });

  it('leaves both lists untouched when released back inside the origin group', () => {
    const onReorderA = jest.fn();
    const onReorderB = jest.fn();
    render(<KanbanTest onReorderA={onReorderA} onReorderB={onReorderB} />);

    const itemA1 = screen.getByText('a1');

    act(() => {
      firePointer(itemA1, 'pointerdown', 0, 0);
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

    act(() => {
      firePointer(itemX, 'pointerdown', 0, 0);
      firePointer(window, 'pointermove', 0, 1000);
      firePointer(window, 'pointerup', 0, 1000);
      jest.advanceTimersByTime(1000);
    });

    expect(screen.getByText('x')).toBeInTheDocument();
  });
});
