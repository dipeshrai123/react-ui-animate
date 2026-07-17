import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { animate, LayoutGroup } from '../../index';

// LayoutGroup scopes layoutId shared-element transitions to a subtree
// instead of the shared global registry. These tests exercise it exactly
// the way layoutIdTabs.test.tsx exercises the global-registry case (a tab
// indicator that mounts fresh under whichever tab is active), so a passing
// suite here is a real end-to-end guarantee, not just an internal check
// that the right Map got read.
describe('LayoutGroup', () => {
  const rects: Record<string, { left: number; top: number; width: number; height: number }> = {
    a: { left: 0, top: 0, width: 80, height: 40 },
    b: { left: 100, top: 0, width: 80, height: 40 },
    'group2-a': { left: 0, top: 200, width: 80, height: 40 },
    'group2-b': { left: 300, top: 200, width: 80, height: 40 },
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

  function Tabs({ layoutId = 'ind' }: { layoutId?: string }) {
    const [active, setActive] = React.useState<'a' | 'b'>('a');
    return (
      <div>
        <button data-testid="btn-a" onClick={() => setActive('a')}>
          {active === 'a' && (
            <animate.div data-testid="indicator-a" data-tab="a" layoutId={layoutId} />
          )}
          A
        </button>
        <button data-testid="btn-b" onClick={() => setActive('b')}>
          {active === 'b' && (
            <animate.div data-testid="indicator-b" data-tab="b" layoutId={layoutId} />
          )}
          B
        </button>
      </div>
    );
  }

  it('transitions normally for a group sharing one layoutId inside a single LayoutGroup', async () => {
    render(
      <LayoutGroup>
        <Tabs />
      </LayoutGroup>
    );

    fireEvent.click(screen.getByTestId('btn-b'));
    const indicatorB = screen.getByTestId('indicator-b');

    // FLIP inverts on first paint: starts offset by the delta from A to B.
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

  it('does NOT cross-transition between two separate LayoutGroups using the same layoutId', () => {
    function TwoGroups() {
      const [active1, setActive1] = React.useState<'a' | 'b'>('a');
      const [active2, setActive2] = React.useState<'a' | 'b'>('a');
      return (
        <>
          <LayoutGroup>
            <button data-testid="g1-btn-a" onClick={() => setActive1('a')}>
              {active1 === 'a' && (
                <animate.div data-testid="g1-indicator-a" data-tab="a" layoutId="shared" />
              )}
            </button>
            <button data-testid="g1-btn-b" onClick={() => setActive1('b')}>
              {active1 === 'b' && (
                <animate.div data-testid="g1-indicator-b" data-tab="b" layoutId="shared" />
              )}
            </button>
          </LayoutGroup>
          <LayoutGroup>
            <button data-testid="g2-btn-a" onClick={() => setActive2('a')}>
              {active2 === 'a' && (
                <animate.div
                  data-testid="g2-indicator-a"
                  data-tab="group2-a"
                  layoutId="shared"
                />
              )}
            </button>
            <button data-testid="g2-btn-b" onClick={() => setActive2('b')}>
              {active2 === 'b' && (
                <animate.div
                  data-testid="g2-indicator-b"
                  data-tab="group2-b"
                  layoutId="shared"
                />
              )}
            </button>
          </LayoutGroup>
        </>
      );
    }

    render(<TwoGroups />);

    // Move group 1's indicator (A -> B) — a legitimate FLIP *within* group
    // 1's own registry (both A and B share "shared" inside the same group).
    fireEvent.click(screen.getByTestId('g1-btn-b'));
    expect(screen.getByTestId('g1-indicator-b').style.transform).toBe(
      'translateX(-100px) translateY(0px) scaleX(1) scaleY(1)'
    );

    // Now mount group 2's indicator for the very first time. If groups
    // shared a registry, this would FLIP from group 1's last-known rect for
    // "shared" (a bogus cross-group jump). Since it's a DIFFERENT
    // LayoutGroup's own Map, there is no prior entry for it — it must
    // render at rest instead.
    fireEvent.click(screen.getByTestId('g2-btn-a'));
    expect(screen.getByTestId('g2-indicator-a').style.transform).toBe('');
  });

  it('elements outside any LayoutGroup keep transitioning via the global registry unaffected', async () => {
    render(<Tabs layoutId="ungrouped-ind" />);

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

  it('an element inside a LayoutGroup and one outside sharing a layoutId do not cross-transition', () => {
    function Mixed() {
      const [insideMounted, setInsideMounted] = React.useState(true);
      const [outsideMounted, setOutsideMounted] = React.useState(false);
      return (
        <>
          <LayoutGroup>
            {insideMounted && (
              <animate.div data-testid="inside" data-tab="a" layoutId="mixed" />
            )}
          </LayoutGroup>
          {outsideMounted && (
            <animate.div data-testid="outside" data-tab="b" layoutId="mixed" />
          )}
          <button
            data-testid="swap"
            onClick={() => {
              setInsideMounted(false);
              setOutsideMounted(true);
            }}
          />
        </>
      );
    }

    render(<Mixed />);
    fireEvent.click(screen.getByTestId('swap'));

    // "outside" claims a layoutId the global registry has never seen
    // (the "inside" claim lives in the LayoutGroup's own Map), so it must
    // render at rest instead of FLIPping from "inside"'s rect.
    expect(screen.getByTestId('outside').style.transform).toBe('');
  });
});
