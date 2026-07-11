import React, { act } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { animate } from '../animate';
import { AnimateValue } from '../../values/AnimateValue';

describe('layout animation', () => {
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
    render(<animate.div data-testid="box" layout />);
    const el = screen.getByTestId('box');
    expect(el.style.transform).toBe('');
  });

  it('animates position/size changes with a FLIP transform, settling at identity', async () => {
    const { rerender } = render(<animate.div data-testid="box" layout />);
    const el = screen.getByTestId('box');

    // Simulate a layout shift caused by a parent re-render (e.g. reorder/filter)
    mockRect = { left: 150, top: 80, width: 200, height: 50 };
    rerender(<animate.div data-testid="box" layout />);

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
    const { rerender } = render(<animate.div data-testid="box" layout />);
    const el = screen.getByTestId('box');

    mockRect = { left: 0.1, top: 0, width: 100, height: 50 };
    rerender(<animate.div data-testid="box" layout />);

    expect(el.style.transform).toBe('');
  });

  it('does nothing when the layout prop is absent', () => {
    const { rerender } = render(<animate.div data-testid="box" />);
    const el = screen.getByTestId('box');

    mockRect = { left: 150, top: 80, width: 200, height: 50 };
    rerender(<animate.div data-testid="box" />);

    expect(el.style.transform).toBe('');
  });

  it('composes with a custom transform set via style, instead of dropping it', async () => {
    const { rerender } = render(
      <animate.div data-testid="box" layout style={{ translateY: 10 }} />
    );
    const el = screen.getByTestId('box');
    expect(el.style.transform).toBe('translateY(10px)');

    mockRect = { left: 150, top: 80, width: 200, height: 50 };
    rerender(<animate.div data-testid="box" layout style={{ translateY: 10 }} />);

    // The static translateY(10px) must survive alongside layout's own FLIP invert.
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
      <animate.div data-testid="box" layout style={{ translateX: customTranslateX }} />
    );
    const el = screen.getByTestId('box');
    expect(el.style.transform).toBe('translateX(5px)');

    mockRect = { left: 150, top: 80, width: 200, height: 50 };
    rerender(
      <animate.div data-testid="box" layout style={{ translateX: customTranslateX }} />
    );

    // Both the pre-existing "translateX" and layout's own internal contribution
    // must be present — neither should silently overwrite the other.
    expect(el.style.transform).toBe(
      'translateX(5px) translateX(-150px) translateY(-80px) scaleX(0.5) scaleY(1)'
    );
  });
});

describe('layout animation — rapid re-triggering', () => {
  // getBoundingClientRect() reflects the currently-applied CSS transform in a
  // real browser. This mock replicates that so the test actually exercises the
  // measurement path that broke when shuffling faster than the spring settles.
  let layoutRect: { left: number; top: number; width: number; height: number };

  function parseTransform(transform: string) {
    const tx = parseFloat(transform.match(/translateX\(([-\d.]+)px\)/)?.[1] ?? '0');
    const ty = parseFloat(transform.match(/translateY\(([-\d.]+)px\)/)?.[1] ?? '0');
    const sx = parseFloat(transform.match(/scaleX\(([-\d.]+)\)/)?.[1] ?? '1');
    const sy = parseFloat(transform.match(/scaleY\(([-\d.]+)\)/)?.[1] ?? '1');
    return { tx, ty, sx, sy };
  }

  beforeEach(() => {
    jest.useFakeTimers();
    layoutRect = { left: 0, top: 0, width: 100, height: 50 };
    jest
      .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockImplementation(function (this: HTMLElement) {
        const { tx, ty, sx, sy } = parseTransform(this.style.transform || '');
        const rendered = {
          left: layoutRect.left + tx,
          top: layoutRect.top + ty,
          width: layoutRect.width * sx,
          height: layoutRect.height * sy,
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

  it('measures the true layout box instead of the in-flight transform when re-triggered mid-animation', async () => {
    const { rerender } = render(<animate.div data-testid="box" layout />);
    const el = screen.getByTestId('box');

    layoutRect = { left: 200, top: 0, width: 100, height: 50 };
    rerender(<animate.div data-testid="box" layout />);
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
    layoutRect = { left: 350, top: 0, width: 100, height: 50 };
    rerender(<animate.div data-testid="box" layout />);

    // The invert must reflect the true layout delta (200 -> 350 = -150),
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

describe('layoutId shared transitions', () => {
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

  it('does not animate when it is the first element to ever claim a given layoutId', () => {
    const id = `test-first-claim-${Math.random()}`;
    render(<animate.div data-testid="box" layoutId={id} />);
    const el = screen.getByTestId('box');
    expect(el.style.transform).toBe('');
  });

  it('morphs a newly mounted element from the rect last recorded under the same layoutId', async () => {
    const id = `test-morph-${Math.random()}`;

    mockRect = { left: 0, top: 0, width: 100, height: 50 };
    const { unmount } = render(
      <animate.div data-testid="source" layoutId={id} />
    );
    unmount();

    // A different element claims the same layoutId at a new position/size.
    mockRect = { left: 150, top: 80, width: 200, height: 50 };
    render(<animate.div data-testid="target" layoutId={id} />);
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

  it('ignores layoutId shifts smaller than the animation threshold', () => {
    const id = `test-threshold-${Math.random()}`;

    mockRect = { left: 0, top: 0, width: 100, height: 50 };
    const { unmount } = render(<animate.div data-testid="source" layoutId={id} />);
    unmount();

    mockRect = { left: 0.1, top: 0, width: 100, height: 50 };
    render(<animate.div data-testid="target" layoutId={id} />);
    const el = screen.getByTestId('target');

    expect(el.style.transform).toBe('');
  });

  it('does nothing when layoutId is absent', () => {
    const { rerender } = render(<animate.div data-testid="box" />);
    const el = screen.getByTestId('box');

    mockRect = { left: 150, top: 80, width: 200, height: 50 };
    rerender(<animate.div data-testid="box" />);

    expect(el.style.transform).toBe('');
  });

  it('composes with a custom transform set via style, instead of dropping it', async () => {
    const id = `test-compose-${Math.random()}`;

    mockRect = { left: 0, top: 0, width: 100, height: 50 };
    const { unmount } = render(<animate.div data-testid="source" layoutId={id} />);
    unmount();

    mockRect = { left: 150, top: 80, width: 200, height: 50 };
    render(
      <animate.div data-testid="target" layoutId={id} style={{ translateY: 10 }} />
    );
    const el = screen.getByTestId('target');

    expect(el.style.transform).toBe(
      'translateY(10px) translateX(-150px) translateY(-80px) scaleX(0.5) scaleY(1)'
    );
  });

  it('behaves like `layout` when the same persisting element re-registers under its own layoutId', async () => {
    const id = `test-persist-${Math.random()}`;

    const { rerender } = render(<animate.div data-testid="box" layoutId={id} />);
    const el = screen.getByTestId('box');
    expect(el.style.transform).toBe('');

    mockRect = { left: 150, top: 80, width: 200, height: 50 };
    rerender(<animate.div data-testid="box" layoutId={id} />);

    expect(el.style.transform).toBe(
      'translateX(-150px) translateY(-80px) scaleX(0.5) scaleY(1)'
    );
  });
});
