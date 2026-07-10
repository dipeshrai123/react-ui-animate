import React, { act } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { animate } from '../animate';

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
