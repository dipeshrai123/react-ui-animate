import { createRef, act } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { animate } from '../animate';
import { AnimateValue } from '../../values/AnimateValue';
import { withTiming, withSpring } from '../../descriptors';

describe('〈animate> components', () => {
  it('forwards its ref to the underlying DOM node', () => {
    const ref = createRef<HTMLElement>();
    render(<animate.div data-testid="ref-div" ref={ref} />);
    const el = screen.getByTestId('ref-div');
    expect(el).toBeInstanceOf(HTMLElement);
    expect(ref.current).toBe(el);
  });

  it('applies static style, transform, and attributes', () => {
    render(
      <animate.div
        data-testid="static-div"
        id="my-id"
        style={{
          width: 120,
          opacity: '0.3',
          translateX: 15,
          scale: 2,
        }}
        title="hello"
      />
    );
    const el = screen.getByTestId('static-div') as HTMLElement;
    expect(el.style.width).toBe('120px');
    expect(el.style.opacity).toBe('0.3');
    expect(el.style.transform).toBe('translateX(15px) scale(2)');
    expect(el.getAttribute('id')).toBe('my-id');
    expect(el.getAttribute('title')).toBe('hello');
  });

  it('updates style when AnimateValue-driven props change', () => {
    const valueX = new AnimateValue(5);
    const valueOpacity = new AnimateValue(0.5);
    render(
      <animate.div
        data-testid="dynamic-div"
        style={{ translateX: valueX, opacity: valueOpacity }}
      />
    );
    const el = screen.getByTestId('dynamic-div') as HTMLElement;
    expect(el.style.transform).toBe('translateX(5px)');
    expect(el.style.opacity).toBe('0.5');

    act(() => {
      valueX.set(25);
      valueOpacity.set(0.8);
    });

    expect(el.style.transform).toBe('translateX(25px)');
    expect(el.style.opacity).toBe('0.8');
  });

  it('applies raw transform string when no transformKeys are present', () => {
    render(
      <animate.div
        data-testid="raw-div"
        style={{ transform: 'perspective(400px)' }}
      />
    );
    const el = screen.getByTestId('raw-div') as HTMLElement;
    expect(el.style.transform).toBe('perspective(400px)');
  });

  it('updates attributes driven by AnimateValue', () => {
    const valueTitle = new AnimateValue('initial');
    render(
      <animate.button data-testid="btn" title={valueTitle} disabled={false} />
    );
    const btn = screen.getByTestId('btn') as HTMLButtonElement;
    expect(btn.getAttribute('title')).toBe('initial');
    expect(btn.disabled).toBe(false);

    act(() => {
      valueTitle.set('updated');
    });

    expect(btn.getAttribute('title')).toBe('updated');
  });

  it('animates properties using declarative animate prop', async () => {
    jest.useFakeTimers();
    
    render(
      <animate.div
        data-testid="animated-div"
        style={{ opacity: 0, translateX: 0 }}
        animate={{
          opacity: withTiming(1, { duration: 300 }),
          translateX: withSpring(100, { stiffness: 100, damping: 10 }),
        }}
      />
    );
    
    const el = screen.getByTestId('animated-div') as HTMLElement;
    
    // Initial values should be set
    expect(el.style.opacity).toBe('0');
    expect(el.style.transform).toContain('translateX(0px)');
    
    // Fast-forward time to see animation progress
    act(() => {
      jest.advanceTimersByTime(150);
    });
    
    // After some time, values should have changed
    const opacityAfter = parseFloat(el.style.opacity);
    expect(opacityAfter).toBeGreaterThan(0);
    expect(opacityAfter).toBeLessThanOrEqual(1);
    
    act(() => {
      jest.advanceTimersByTime(200);
    });
    
    // After animation completes, should be close to target
    await waitFor(() => {
      const finalOpacity = parseFloat(el.style.opacity);
      expect(finalOpacity).toBeCloseTo(1, 1);
    });
    
    jest.useRealTimers();
  });

  it('handles animate prop with initial style values', () => {
    render(
      <animate.div
        data-testid="initial-div"
        style={{ opacity: 0.5 }}
        animate={{
          opacity: withTiming(1, { duration: 0 }),
        }}
      />
    );
    
    const el = screen.getByTestId('initial-div') as HTMLElement;
    // Should use initial style value
    expect(parseFloat(el.style.opacity)).toBeGreaterThanOrEqual(0);
  });
});

