import { createRef, act } from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { animate } from '../animate';
import { AnimateValue } from '../AnimateValue';

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
});

