import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { animate } from '../animate';

// These tests mirror a tab-indicator built out of `layoutId` (buttons in a
// row, an indicator element that mounts fresh under whichever tab is
// active) rather than a single element diffing its own rect across renders
// (already covered in layout.test.tsx). That structural difference matters:
// the indicator's FLIP animation starts on the *first* commit of a brand
// new component instance, which is exactly the window React StrictMode's
// mount/cleanup/remount simulation runs in.
describe('layoutId — tab indicator (sibling swap within one tree)', () => {
  const rects: Record<string, { left: number; top: number; width: number; height: number }> = {
    a: { left: 0, top: 0, width: 80, height: 40 },
    b: { left: 100, top: 0, width: 80, height: 40 },
  };

  beforeEach(() => {
    jest.useFakeTimers();
    jest
      .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockImplementation(function (this: HTMLElement) {
        const id = this.getAttribute('data-tab');
        const r = id ? rects[id] : { left: 0, top: 0, width: 0, height: 0 };
        return {
          ...r,
          right: r.left + r.width,
          bottom: r.top + r.height,
          x: r.left,
          y: r.top,
          toJSON() {},
        } as DOMRect;
      });
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  function Tabs() {
    const [active, setActive] = React.useState<'a' | 'b'>('a');
    return (
      <div>
        <button data-testid="btn-a" onClick={() => setActive('a')}>
          {active === 'a' && (
            <animate.div data-testid="indicator-a" data-tab="a" layoutId="ind" />
          )}
          A
        </button>
        <button data-testid="btn-b" onClick={() => setActive('b')}>
          {active === 'b' && (
            <animate.div data-testid="indicator-b" data-tab="b" layoutId="ind" />
          )}
          B
        </button>
      </div>
    );
  }

  it('animates the indicator when switching tabs, settling at identity', async () => {
    render(<Tabs />);
    expect(screen.getByTestId('indicator-a').style.transform).toBe('');

    fireEvent.click(screen.getByTestId('btn-b'));

    const indicatorB = screen.getByTestId('indicator-b');
    expect(indicatorB.style.transform).toBe(
      'translateX(-100px) translateY(0px) scaleX(1) scaleY(1)'
    );

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(indicatorB.style.transform).toBe(
        'translateX(0px) translateY(0px) scaleX(1) scaleY(1)'
      );
    });
  });

  // Regression test: under React.StrictMode, a freshly-mounted layoutId
  // element's effects run twice in immediate succession (mount, cleanup,
  // mount again) as part of the very first commit. The cleanup pass used to
  // cancel the just-started spring without the second pass detecting
  // anything to resume (it compares the element's rect against the rect it
  // just registered for itself, sees no delta), leaving the transform
  // permanently stuck at its initial inverted value instead of settling at
  // identity.
  it('still settles at identity under React.StrictMode', async () => {
    render(
      <React.StrictMode>
        <Tabs />
      </React.StrictMode>
    );

    fireEvent.click(screen.getByTestId('btn-b'));
    const indicatorB = screen.getByTestId('indicator-b');
    expect(indicatorB.style.transform).not.toBe('');

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(indicatorB.style.transform).toBe(
        'translateX(0px) translateY(0px) scaleX(1) scaleY(1)'
      );
    });
  });
});

describe('layoutId — four tabs of varying widths, sequential switches', () => {
  const rects: Record<string, { left: number; top: number; width: number; height: number }> = {
    Overview: { left: 0, top: 0, width: 100, height: 40 },
    Features: { left: 104, top: 0, width: 90, height: 40 },
    Pricing: { left: 198, top: 0, width: 80, height: 40 },
    FAQ: { left: 282, top: 0, width: 60, height: 40 },
  };

  beforeEach(() => {
    jest.useFakeTimers();
    jest
      .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockImplementation(function (this: HTMLElement) {
        const id = this.getAttribute('data-tab');
        const r = id ? rects[id] : { left: 0, top: 0, width: 0, height: 0 };
        return {
          ...r,
          right: r.left + r.width,
          bottom: r.top + r.height,
          x: r.left,
          y: r.top,
          toJSON() {},
        } as DOMRect;
      });
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  const TABS = ['Overview', 'Features', 'Pricing', 'FAQ'];

  function Tabs() {
    const [active, setActive] = React.useState(TABS[0]);
    return (
      <div style={{ display: 'inline-flex', gap: 4 }}>
        {TABS.map((tab) => (
          <button key={tab} data-testid={`btn-${tab}`} onClick={() => setActive(tab)}>
            {tab === active && (
              <animate.div
                data-testid={`indicator-${tab}`}
                data-tab={tab}
                layoutId="tab-indicator"
                style={{ position: 'absolute', inset: 0 }}
              />
            )}
            {tab}
          </button>
        ))}
      </div>
    );
  }

  it('animates on every sequential switch, including a switch mid-animation', () => {
    render(<Tabs />);
    expect(screen.getByTestId('indicator-Overview').style.transform).toBe('');

    fireEvent.click(screen.getByTestId('btn-Features'));
    expect(screen.getByTestId('indicator-Features').style.transform).not.toBe('');

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    fireEvent.click(screen.getByTestId('btn-Pricing'));
    expect(screen.getByTestId('indicator-Pricing').style.transform).not.toBe('');

    // Switch again before the Pricing transition has settled.
    fireEvent.click(screen.getByTestId('btn-FAQ'));
    expect(screen.getByTestId('indicator-FAQ').style.transform).not.toBe('');
  });
});
