import { renderHook, act } from '@testing-library/react';
import { useScrollReveal } from '../useScrollReveal';

function mockRect(el: HTMLElement, rect: Partial<DOMRect>) {
  el.getBoundingClientRect = () =>
    ({
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: 0,
      height: 0,
      x: 0,
      y: 0,
      toJSON() {},
      ...rect,
    }) as DOMRect;
}

// `window instanceof Window` doesn't hold in jsdom's test realm, so these
// tests drive an explicit scrollable container element instead of relying
// on the (untestable-under-jsdom, but browser-correct) `window` default.
function makeContainer() {
  const container = document.createElement('div');
  document.body.appendChild(container);
  mockRect(container, { top: 0, height: 800 });
  Object.defineProperty(container, 'clientHeight', { value: 800, configurable: true });
  Object.defineProperty(container, 'scrollTop', {
    value: 0,
    writable: true,
    configurable: true,
  });
  return container;
}

describe('useScrollReveal', () => {
  let container: HTMLDivElement;
  let el: HTMLDivElement;

  beforeEach(() => {
    container = makeContainer();
    el = document.createElement('div');
    container.appendChild(el);
  });

  afterEach(() => {
    container.remove();
  });

  it('starts at 0 progress before the element enters the viewport', () => {
    // Element sits entirely below the fold: top edge (900) hasn't yet
    // reached the container's bottom edge (800), so it hasn't started
    // crossing through — reveal progress should read 0.
    mockRect(el, { top: 900, height: 200 });
    const targetRef = { current: el };
    const containerRef = { current: container };

    const { result } = renderHook(() =>
      useScrollReveal(targetRef, { container: containerRef, animate: false })
    );

    act(() => {
      container.dispatchEvent(new Event('scroll'));
    });

    expect(result.current.progress.current).toBe(0);
  });

  it('reaches 1 once the element has fully passed the container top', () => {
    // Bottom edge (-50) is above the container's top edge (0) — the
    // element has fully scrolled past, so reveal progress clamps to 1.
    mockRect(el, { top: -250, height: 200 });
    const targetRef = { current: el };
    const containerRef = { current: container };

    const { result } = renderHook(() =>
      useScrollReveal(targetRef, { container: containerRef, animate: false })
    );

    act(() => {
      container.dispatchEvent(new Event('scroll'));
    });

    expect(result.current.progress.current).toBe(1);
  });

  it('reports the midpoint once the element is halfway through the container', () => {
    mockRect(el, { top: 400, height: 400 });
    const targetRef = { current: el };
    const containerRef = { current: container };

    const { result } = renderHook(() =>
      useScrollReveal(targetRef, { container: containerRef, animate: false })
    );

    act(() => {
      container.dispatchEvent(new Event('scroll'));
    });

    // Range spans from top-hits-end (-400) to bottom-hits-start (800); at
    // scrollTop 0 that's 400 units into a 1200-unit span.
    expect(result.current.progress.current).toBeCloseTo(400 / 1200, 5);
  });

  it('tracks the x axis when configured', () => {
    mockRect(container, { top: 0, height: 800, left: 0, width: 800 });
    mockRect(el, { top: 0, height: 800, left: 800, width: 400 });
    const targetRef = { current: el };
    const containerRef = { current: container };

    const { result } = renderHook(() =>
      useScrollReveal(targetRef, {
        container: containerRef,
        axis: 'x',
        animate: false,
      })
    );

    act(() => {
      container.dispatchEvent(new Event('scroll'));
    });

    // Mirrors the y-axis "before it enters" case: element start (800) hasn't
    // reached the container's trailing edge (800) yet at scrollLeft 0 —
    // right at the boundary, so progress reads 0.
    expect(result.current.progress.current).toBe(0);
  });
});
