import React, { act } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { animate } from '../animate';
import { AnimateValue } from '../../values/AnimateValue';
import { withSpring, withTiming } from '../../descriptors';
import { resolveFlipTransition } from '../../layout';

describe('resolveFlipTransition', () => {
  it('defaults to the flip spring when options are omitted', () => {
    expect(resolveFlipTransition(undefined)).toEqual({
      type: 'spring',
      to: 0,
      options: { stiffness: 500, damping: 50, mass: 1 },
    });
  });

  it('treats raw spring option objects as an implicit spring (back-compat)', () => {
    expect(resolveFlipTransition({ stiffness: 300, damping: 30 })).toEqual({
      type: 'spring',
      to: 0,
      options: { stiffness: 300, damping: 30, mass: 1 },
    });
  });

  it('passes through withSpring / withTiming descriptors', () => {
    expect(resolveFlipTransition(withSpring({ stiffness: 200 }))).toMatchObject({
      type: 'spring',
      options: expect.objectContaining({ stiffness: 200 }),
    });
    expect(
      resolveFlipTransition(withTiming({ duration: 250 }))
    ).toMatchObject({
      type: 'timing',
      options: expect.objectContaining({ duration: 250 }),
    });
  });
});

describe('flip animation', () => {
  let mockRect: { left: number; top: number; width: number; height: number };

  beforeEach(() => {
    jest.useFakeTimers();
    mockRect = { left: 0, top: 0, width: 100, height: 50 };
    jest
      .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockImplementation(
        () =>
          ({
            ...mockRect,
            right: mockRect.left + mockRect.width,
            bottom: mockRect.top + mockRect.height,
            x: mockRect.left,
            y: mockRect.top,
            toJSON() {},
          }) as DOMRect
      );
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('does not animate on initial mount', () => {
    render(<animate.div data-testid="box" flip />);
    const el = screen.getByTestId('box');
    expect(el.style.transform).toBe('');
  });

  it('animates position/size changes with a FLIP transform, settling at identity', async () => {
    const { rerender } = render(<animate.div data-testid="box" flip />);
    const el = screen.getByTestId('box');

    // Simulate a layout shift caused by a parent re-render (e.g. reorder/filter)
    mockRect = { left: 150, top: 80, width: 200, height: 50 };
    rerender(<animate.div data-testid="box" flip />);

    // Immediately after the shift, the element should be inverted back to its
    // previous visual position/size (FLIP "invert" step)
    expect(el.style.transform).toBe('translateX(-150px) translateY(-80px) scaleX(0.5) scaleY(1)');
    expect(el.style.transformOrigin).toBe('top left');

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(el.style.transform).toBe(
        'translateX(0px) translateY(0px) scaleX(1) scaleY(1)'
      );
    });
  });

  it('ignores layout shifts smaller than the animation threshold', () => {
    const { rerender } = render(<animate.div data-testid="box" flip />);
    const el = screen.getByTestId('box');

    mockRect = { left: 0.1, top: 0, width: 100, height: 50 };
    rerender(<animate.div data-testid="box" flip />);

    expect(el.style.transform).toBe('');
  });

  it('does nothing when the flip prop is absent', () => {
    const { rerender } = render(<animate.div data-testid="box" />);
    const el = screen.getByTestId('box');

    mockRect = { left: 150, top: 80, width: 200, height: 50 };
    rerender(<animate.div data-testid="box" />);

    expect(el.style.transform).toBe('');
  });

  it('composes with a custom transform set via style, instead of dropping it', async () => {
    const { rerender } = render(
      <animate.div data-testid="box" flip style={{ translateY: 10 }} />
    );
    const el = screen.getByTestId('box');
    expect(el.style.transform).toBe('translateY(10px)');

    mockRect = { left: 150, top: 80, width: 200, height: 50 };
    rerender(<animate.div data-testid="box" flip style={{ translateY: 10 }} />);

    // The static translateY(10px) must survive alongside flip's own FLIP invert.
    expect(el.style.transform).toBe(
      'translateY(10px) translateX(-150px) translateY(-80px) scaleX(0.5) scaleY(1)'
    );

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(el.style.transform).toBe(
        'translateY(10px) translateX(0px) translateY(0px) scaleX(1) scaleY(1)'
      );
    });
  });

  it('composes with a real translateX key already in use on the same element, instead of one overwriting the other', () => {
    const customTranslateX = new AnimateValue(5);

    const { rerender } = render(
      <animate.div data-testid="box" flip style={{ translateX: customTranslateX }} />
    );
    const el = screen.getByTestId('box');
    expect(el.style.transform).toBe('translateX(5px)');

    mockRect = { left: 150, top: 80, width: 200, height: 50 };
    rerender(
      <animate.div data-testid="box" flip style={{ translateX: customTranslateX }} />
    );

    // Both the pre-existing "translateX" and flip's own internal contribution
    // must be present — neither should silently overwrite the other.
    expect(el.style.transform).toBe(
      'translateX(5px) translateX(-150px) translateY(-80px) scaleX(0.5) scaleY(1)'
    );
  });

  it('accepts withTiming as flipOptions and settles at identity', async () => {
    const { rerender } = render(
      <animate.div
        data-testid="box"
        flip
        flipOptions={withTiming({ duration: 200 })}
      />
    );
    const el = screen.getByTestId('box');

    mockRect = { left: 100, top: 0, width: 100, height: 50 };
    rerender(
      <animate.div
        data-testid="box"
        flip
        flipOptions={withTiming({ duration: 200 })}
      />
    );

    expect(el.style.transform).toBe(
      'translateX(-100px) translateY(0px) scaleX(1) scaleY(1)'
    );

    act(() => {
      jest.advanceTimersByTime(250);
    });

    await waitFor(() => {
      expect(el.style.transform).toBe(
        'translateX(0px) translateY(0px) scaleX(1) scaleY(1)'
      );
    });
  });

  it('accepts withSpring as flipOptions and settles at identity', async () => {
    const { rerender } = render(
      <animate.div
        data-testid="box"
        flip
        flipOptions={withSpring({ stiffness: 400, damping: 40 })}
      />
    );
    const el = screen.getByTestId('box');

    mockRect = { left: 80, top: 40, width: 100, height: 50 };
    rerender(
      <animate.div
        data-testid="box"
        flip
        flipOptions={withSpring({ stiffness: 400, damping: 40 })}
      />
    );

    expect(el.style.transform).toBe(
      'translateX(-80px) translateY(-40px) scaleX(1) scaleY(1)'
    );

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(el.style.transform).toBe(
        'translateX(0px) translateY(0px) scaleX(1) scaleY(1)'
      );
    });
  });
});

describe('flip animation — scroll invariance', () => {
  // getBoundingClientRect() is viewport-relative: it shifts by the scroll
  // offset even when the element hasn't actually moved in the document.
  // This mock tracks the element's real *document* position and reports the
  // viewport-relative rect a browser would (subtracting window.scrollY),
  // reproducing the bug where scrolling the page between two flip-effect
  // measurements got misread as the element itself moving.
  let docTop: number;

  beforeEach(() => {
    jest.useFakeTimers();
    docTop = 100;
    window.scrollTo = jest.fn();
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true, configurable: true });
    jest
      .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockImplementation(
        () =>
          ({
            left: 0,
            top: docTop - window.scrollY,
            width: 100,
            height: 50,
            right: 100,
            bottom: docTop - window.scrollY + 50,
            x: 0,
            y: docTop - window.scrollY,
            toJSON() {},
          }) as DOMRect
      );
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('does not trigger a FLIP animation when only the page scroll changed, not the element', () => {
    const { rerender } = render(<animate.div data-testid="box" flip />);
    const el = screen.getByTestId('box');

    // User scrolls the page — the element's document position (`docTop`) is
    // untouched, only the viewport-relative rect the browser reports shifts.
    Object.defineProperty(window, 'scrollY', { value: 400, writable: true, configurable: true });
    rerender(<animate.div data-testid="box" flip />);

    // Before the fix, this read as a 400px jump and incorrectly FLIPped.
    expect(el.style.transform).toBe('');
  });

  it('still animates a real flip change that happens to coincide with a scroll', async () => {
    const { rerender } = render(<animate.div data-testid="box" flip />);
    const el = screen.getByTestId('box');

    // The element genuinely moves 60px down in the document *and* the page
    // scrolls 400px in the same commit — the animation must reflect only
    // the real 60px document-relative delta, not the scroll offset.
    docTop = 160;
    Object.defineProperty(window, 'scrollY', { value: 400, writable: true, configurable: true });
    rerender(<animate.div data-testid="box" flip />);

    expect(el.style.transform).toBe(
      'translateX(0px) translateY(-60px) scaleX(1) scaleY(1)'
    );

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(el.style.transform).toBe(
        'translateX(0px) translateY(0px) scaleX(1) scaleY(1)'
      );
    });
  });
});

describe('flip animation — rapid re-triggering', () => {
  // getBoundingClientRect() reflects the currently-applied CSS transform in a
  // real browser. This mock replicates that so the test actually exercises the
  // measurement path that broke when shuffling faster than the spring settles.
  let flipRect: { left: number; top: number; width: number; height: number };

  function parseTransform(transform: string) {
    const tx = parseFloat(transform.match(/translateX\(([-\d.]+)px\)/)?.[1] ?? '0');
    const ty = parseFloat(transform.match(/translateY\(([-\d.]+)px\)/)?.[1] ?? '0');
    const sx = parseFloat(transform.match(/scaleX\(([-\d.]+)\)/)?.[1] ?? '1');
    const sy = parseFloat(transform.match(/scaleY\(([-\d.]+)\)/)?.[1] ?? '1');
    return { tx, ty, sx, sy };
  }

  beforeEach(() => {
    jest.useFakeTimers();
    flipRect = { left: 0, top: 0, width: 100, height: 50 };
    jest
      .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockImplementation(function (this: HTMLElement) {
        const { tx, ty, sx, sy } = parseTransform(this.style.transform || '');
        const rendered = {
          left: flipRect.left + tx,
          top: flipRect.top + ty,
          width: flipRect.width * sx,
          height: flipRect.height * sy,
        };
        return {
          ...rendered,
          right: rendered.left + rendered.width,
          bottom: rendered.top + rendered.height,
          x: rendered.left,
          y: rendered.top,
          toJSON() {},
        } as DOMRect;
      });
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('measures the true flip box instead of the in-flight transform when re-triggered mid-animation', async () => {
    const { rerender } = render(<animate.div data-testid="box" flip />);
    const el = screen.getByTestId('box');

    flipRect = { left: 200, top: 0, width: 100, height: 50 };
    rerender(<animate.div data-testid="box" flip />);
    expect(el.style.transform).toBe(
      'translateX(-200px) translateY(0px) scaleX(1) scaleY(1)'
    );

    // Let the spring run partway — it should not have reached identity yet.
    act(() => {
      jest.advanceTimersByTime(50);
    });
    expect(el.style.transform).not.toBe(
      'translateX(-200px) translateY(0px) scaleX(1) scaleY(1)'
    );
    expect(el.style.transform).not.toBe(
      'translateX(0px) translateY(0px) scaleX(1) scaleY(1)'
    );

    // A second layout shift arrives before the first animation settles.
    flipRect = { left: 350, top: 0, width: 100, height: 50 };
    rerender(<animate.div data-testid="box" flip />);

    // The invert must reflect the true flip delta (200 -> 350 = -150),
    // not a value corrupted by the still-animating transform from the first shift.
    expect(el.style.transform).toBe(
      'translateX(-150px) translateY(0px) scaleX(1) scaleY(1)'
    );

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(el.style.transform).toBe(
        'translateX(0px) translateY(0px) scaleX(1) scaleY(1)'
      );
    });
  });
});

describe('flipId shared transitions', () => {
  let mockRect: { left: number; top: number; width: number; height: number };

  beforeEach(() => {
    jest.useFakeTimers();
    mockRect = { left: 0, top: 0, width: 100, height: 50 };
    jest
      .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockImplementation(
        () =>
          ({
            ...mockRect,
            right: mockRect.left + mockRect.width,
            bottom: mockRect.top + mockRect.height,
            x: mockRect.left,
            y: mockRect.top,
            toJSON() {},
          }) as DOMRect
      );
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('does not animate when it is the first element to ever claim a given flipId', () => {
    const id = `test-first-claim-${Math.random()}`;
    render(<animate.div data-testid="box" flipId={id} />);
    const el = screen.getByTestId('box');
    expect(el.style.transform).toBe('');
  });

  it('morphs a newly mounted element from the rect last recorded under the same flipId', async () => {
    const id = `test-morph-${Math.random()}`;

    mockRect = { left: 0, top: 0, width: 100, height: 50 };
    const { unmount } = render(
      <animate.div data-testid="source" flipId={id} />
    );
    unmount();

    // A different element claims the same flipId at a new position/size.
    mockRect = { left: 150, top: 80, width: 200, height: 50 };
    render(<animate.div data-testid="target" flipId={id} />);
    const el = screen.getByTestId('target');

    // Inverted back to the source element's last recorded position/size.
    expect(el.style.transform).toBe(
      'translateX(-150px) translateY(-80px) scaleX(0.5) scaleY(1)'
    );
    expect(el.style.transformOrigin).toBe('top left');

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(el.style.transform).toBe(
        'translateX(0px) translateY(0px) scaleX(1) scaleY(1)'
      );
    });
  });

  it('ignores layout shifts for flipId smaller than the animation threshold', () => {
    const id = `test-threshold-${Math.random()}`;

    mockRect = { left: 0, top: 0, width: 100, height: 50 };
    const { unmount } = render(<animate.div data-testid="source" flipId={id} />);
    unmount();

    mockRect = { left: 0.1, top: 0, width: 100, height: 50 };
    render(<animate.div data-testid="target" flipId={id} />);
    const el = screen.getByTestId('target');

    expect(el.style.transform).toBe('');
  });

  it('does nothing when flipId is absent', () => {
    const { rerender } = render(<animate.div data-testid="box" />);
    const el = screen.getByTestId('box');

    mockRect = { left: 150, top: 80, width: 200, height: 50 };
    rerender(<animate.div data-testid="box" />);

    expect(el.style.transform).toBe('');
  });

  it('composes with a custom transform set via style, instead of dropping it', async () => {
    const id = `test-compose-${Math.random()}`;

    mockRect = { left: 0, top: 0, width: 100, height: 50 };
    const { unmount } = render(<animate.div data-testid="source" flipId={id} />);
    unmount();

    mockRect = { left: 150, top: 80, width: 200, height: 50 };
    render(
      <animate.div data-testid="target" flipId={id} style={{ translateY: 10 }} />
    );
    const el = screen.getByTestId('target');

    expect(el.style.transform).toBe(
      'translateY(10px) translateX(-150px) translateY(-80px) scaleX(0.5) scaleY(1)'
    );
  });

  it('behaves like `flip` when the same persisting element re-registers under its own flipId', async () => {
    const id = `test-persist-${Math.random()}`;

    const { rerender } = render(<animate.div data-testid="box" flipId={id} />);
    const el = screen.getByTestId('box');
    expect(el.style.transform).toBe('');

    mockRect = { left: 150, top: 80, width: 200, height: 50 };
    rerender(<animate.div data-testid="box" flipId={id} />);

    expect(el.style.transform).toBe(
      'translateX(-150px) translateY(-80px) scaleX(0.5) scaleY(1)'
    );
  });
});
