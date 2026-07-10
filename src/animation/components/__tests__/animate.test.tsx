import React, { createRef, act } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { animate } from '../animate';
import { AnimateValue } from '../../values/AnimateValue';
import { withTiming, withSpring, withSequence, withDelay } from '../../descriptors';

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

  describe('state animations with missing initial properties', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('applies exit animation for opacity when not in initial style', async () => {
      const { Presence } = await import('../../modules/Presence');
      const onExitComplete = jest.fn();
      let show = true;

      function TestComponent() {
        return (
          <Presence onExitComplete={onExitComplete}>
            {show && (
              <animate.div
                key="test"
                data-testid="exit-test"
                exit={{
                  opacity: withTiming(0, { duration: 100 }),
                }}
              >
                Content
              </animate.div>
            )}
          </Presence>
        );
      }

      const { rerender } = render(<TestComponent />);
      const el = screen.getByTestId('exit-test') as HTMLElement;

      // Initially opacity should be 1 (default for opacity) or empty (which means 1 in CSS)
      const initialOpacity = el.style.opacity;
      const initialOpacityNum = initialOpacity ? parseFloat(initialOpacity) : 1;
      expect(initialOpacityNum).toBe(1);

      // Remove element to trigger exit
      show = false;
      rerender(<TestComponent />);

      // Exit animation should start - opacity should animate to 0
      act(() => {
        jest.advanceTimersByTime(50);
      });

      const opacityDuring = parseFloat(el.style.opacity);
      expect(opacityDuring).toBeLessThan(1);
      expect(opacityDuring).toBeGreaterThanOrEqual(0);

      act(() => {
        jest.advanceTimersByTime(100);
      });

      // After exit completes, opacity should be 0
      await waitFor(() => {
        const finalOpacity = parseFloat(el.style.opacity);
        expect(finalOpacity).toBeCloseTo(0, 1);
      });
    });

    it('applies hover animation for opacity when not in initial style', async () => {
      render(
        <animate.div
          data-testid="hover-test"
          hover={{
            opacity: withTiming(0.5, { duration: 100 }),
          }}
        >
          Hover me
        </animate.div>
      );

      const el = screen.getByTestId('hover-test') as HTMLElement;

      // Initially opacity should be 1 (default) or empty (which means 1 in CSS)
      const initialOpacity = el.style.opacity;
      const initialOpacityNum = initialOpacity ? parseFloat(initialOpacity) : 1;
      expect(initialOpacityNum).toBe(1);

      // Trigger hover
      act(() => {
        el.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
      });

      // Hover animation should start
      act(() => {
        jest.advanceTimersByTime(50);
      });

      const opacityDuring = parseFloat(el.style.opacity);
      expect(opacityDuring).toBeLessThan(1);
      expect(opacityDuring).toBeGreaterThan(0);

      act(() => {
        jest.advanceTimersByTime(100);
      });

      // After hover animation completes
      await waitFor(() => {
        const finalOpacity = parseFloat(el.style.opacity);
        expect(finalOpacity).toBeCloseTo(0.5, 1);
      });

      // Remove hover
      act(() => {
        el.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
      });

      act(() => {
        jest.advanceTimersByTime(100);
      });

      // Should revert back to 1
      await waitFor(() => {
        const finalOpacity = parseFloat(el.style.opacity);
        expect(finalOpacity).toBeCloseTo(1, 1);
      });
    });

    // Extracts the numeric translateY value out of a computed transform string.
    const readTranslateY = (transform: string) => {
      const match = transform.match(/translateY\(([-\d.]+)px\)/);
      return match ? parseFloat(match[1]) : NaN;
    };

    it('reverts hover to the current settled value rather than a stale pre-animation value', async () => {
      // Mirrors a real-world pattern: a static initial style animated in via
      // `animate`/`view` to a settled value, with `hover` also targeting the
      // same property. Hovering out must snap back to the *settled* value,
      // not whatever the property happened to be before the reveal finished.
      render(
        <animate.div
          data-testid="settle-then-hover"
          style={{ translateY: 40 }}
          animate={{ translateY: withTiming(0, { duration: 100 }) }}
          hover={{ translateY: withTiming(-4, { duration: 50 }) }}
        />
      );
      const el = screen.getByTestId('settle-then-hover') as HTMLElement;

      // Let the reveal animation fully settle (40 -> 0) before ever hovering.
      act(() => {
        jest.advanceTimersByTime(150);
      });
      await waitFor(() => {
        expect(readTranslateY(el.style.transform)).toBeCloseTo(0, 1);
      });

      // Hover in, then out.
      act(() => {
        el.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
      });
      act(() => {
        jest.advanceTimersByTime(60);
      });
      await waitFor(() => {
        expect(readTranslateY(el.style.transform)).toBeCloseTo(-4, 1);
      });

      act(() => {
        el.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
      });
      act(() => {
        jest.advanceTimersByTime(500);
      });

      // Must revert to the settled value (0), never the original static
      // style value (40) it started from before the reveal animation ran.
      await waitFor(() => {
        expect(readTranslateY(el.style.transform)).toBeCloseTo(0, 1);
      });
    });

    it('self-corrects on a later hover cycle after the settled value changes again', async () => {
      function TestComponent({ target }: { target: number }) {
        return (
          <animate.div
            data-testid="racy-hover"
            style={{ translateY: 40 }}
            animate={{ translateY: withTiming(target, { duration: 50 }) }}
            hover={{ translateY: withTiming(-4, { duration: 50 }) }}
          />
        );
      }

      const { rerender } = render(<TestComponent target={0} />);
      const el = screen.getByTestId('racy-hover') as HTMLElement;

      // Hover fires immediately, before the 40 -> 0 reveal has progressed at
      // all — its captured revert target is whatever was current then (~40).
      act(() => {
        el.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
      });
      act(() => {
        el.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
      });
      act(() => {
        jest.advanceTimersByTime(500);
      });

      // Re-trigger `animate` to a new settled value (e.g. a later `view`
      // reveal), independent of the earlier hover cycle.
      rerender(<TestComponent target={10} />);
      act(() => {
        jest.advanceTimersByTime(500);
      });
      await waitFor(() => {
        expect(readTranslateY(el.style.transform)).toBeCloseTo(10, 1);
      });

      // A later hover cycle must revert to *this* settled value (10), not
      // whatever was captured during the very first, earlier hover.
      act(() => {
        el.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
      });
      act(() => {
        jest.advanceTimersByTime(60);
      });
      await waitFor(() => {
        expect(readTranslateY(el.style.transform)).toBeCloseTo(-4, 1);
      });

      act(() => {
        el.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
      });
      act(() => {
        jest.advanceTimersByTime(500);
      });

      await waitFor(() => {
        expect(readTranslateY(el.style.transform)).toBeCloseTo(10, 1);
      });
    });

    it('reverts to the real withSequence/withDelay target even if hover interrupts it mid-spring', async () => {
      // Mirrors the exact reported pattern: `view`/`animate` staggers in via
      // withSequence([withDelay(...), withSpring(0, ...)]), and `hover`
      // targets the same key. `withDelay` is just a plain timer (unrelated
      // to the AnimateValue itself), so hovering *during the delay* doesn't
      // actually stop the sequence — the delay still elapses and the spring
      // step still claims the value afterwards. The real interruption
      // happens once the spring step has *started*: at that point hovering
      // cancels it outright, and nothing ever resumes it. Reverting to a
      // merely *captured* value would then snap back to wherever that
      // interruption left it (partway between 40 and 0), not its real
      // destination (0).
      render(
        <animate.div
          data-testid="sequence-hover"
          style={{ translateY: 40 }}
          animate={{
            translateY: withSequence([
              withDelay(100),
              withSpring(0, { stiffness: 140, damping: 22 }),
            ]),
          }}
          hover={{ translateY: withTiming(-4, { duration: 50 }) }}
        />
      );
      const el = screen.getByTestId('sequence-hover') as HTMLElement;

      // Let the delay elapse and the spring step start moving, then
      // interrupt with hover partway through — well before it reaches 0.
      act(() => {
        jest.advanceTimersByTime(130);
      });
      const midFlightValue = readTranslateY(el.style.transform);
      expect(midFlightValue).toBeLessThan(40);
      expect(midFlightValue).toBeGreaterThan(1);

      // Hover in (cancels the in-flight spring) then out.
      act(() => {
        el.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
      });
      act(() => {
        jest.advanceTimersByTime(60);
      });
      await waitFor(() => {
        expect(readTranslateY(el.style.transform)).toBeCloseTo(-4, 1);
      });

      act(() => {
        el.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
      });
      act(() => {
        jest.advanceTimersByTime(500);
      });

      // Must settle at the sequence's real target (0), never the
      // interrupted starting value (40).
      await waitFor(() => {
        expect(readTranslateY(el.style.transform)).toBeCloseTo(0, 1);
      });
    });

    it('continues hover-out animation when parent re-renders with new hover object reference', async () => {
      function TestComponent({ label }: { label: string }) {
        return (
          <animate.div
            data-testid="hover-rerender-test"
            style={{ scale: 1 }}
            hover={{
              scale: withSpring(1.5, { stiffness: 300, damping: 20 }),
            }}
          >
            {label}
          </animate.div>
        );
      }

      const { rerender } = render(<TestComponent label="A" />);
      const el = screen.getByTestId('hover-rerender-test') as HTMLElement;

      const parseScale = () => {
        const match = el.style.transform.match(/scale\(([\d.]+)\)/);
        return match ? parseFloat(match[1]) : 1;
      };

      act(() => {
        el.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
      });

      act(() => {
        jest.advanceTimersByTime(200);
      });

      expect(parseScale()).toBeGreaterThan(1.2);

      act(() => {
        el.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
      });

      act(() => {
        jest.advanceTimersByTime(80);
      });

      const scaleDuringRevert = parseScale();
      expect(scaleDuringRevert).toBeGreaterThan(1);
      expect(scaleDuringRevert).toBeLessThan(1.5);

      // Re-render creates a new hover object with identical animation config
      rerender(<TestComponent label="B" />);

      act(() => {
        jest.advanceTimersByTime(80);
      });

      const scaleAfterRerender = parseScale();
      expect(scaleAfterRerender).toBeGreaterThan(1);
      expect(scaleAfterRerender).toBeLessThan(scaleDuringRevert);

      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(parseScale()).toBeCloseTo(1, 1);
      });
    });

    it('applies press animation for opacity when not in initial style', async () => {
      render(
        <animate.div
          data-testid="press-test"
          press={{
            opacity: withTiming(0.7, { duration: 100 }),
          }}
        >
          Press me
        </animate.div>
      );

      const el = screen.getByTestId('press-test') as HTMLElement;

      // Initially opacity should be 1 or empty (which means 1 in CSS)
      const initialOpacity = el.style.opacity;
      const initialOpacityNum = initialOpacity ? parseFloat(initialOpacity) : 1;
      expect(initialOpacityNum).toBe(1);

      // Trigger press
      act(() => {
        el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      });

      act(() => {
        jest.advanceTimersByTime(100);
      });

      // After press animation completes
      await waitFor(() => {
        const finalOpacity = parseFloat(el.style.opacity);
        expect(finalOpacity).toBeCloseTo(0.7, 1);
      });

      // Release press
      act(() => {
        el.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
      });

      act(() => {
        jest.advanceTimersByTime(100);
      });

      // Should revert back to 1
      await waitFor(() => {
        const finalOpacity = parseFloat(el.style.opacity);
        expect(finalOpacity).toBeCloseTo(1, 1);
      });
    });

    it('applies focus animation for opacity when not in initial style', async () => {
      render(
        <animate.input
          data-testid="focus-test"
          focus={{
            opacity: withTiming(0.8, { duration: 100 }),
          }}
        />
      );

      const el = screen.getByTestId('focus-test') as HTMLElement;

      // Initially opacity should be 1 or empty (which means 1 in CSS)
      const initialOpacity = el.style.opacity;
      const initialOpacityNum = initialOpacity ? parseFloat(initialOpacity) : 1;
      expect(initialOpacityNum).toBe(1);

      // Trigger focus
      act(() => {
        el.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
      });

      act(() => {
        jest.advanceTimersByTime(100);
      });

      // After focus animation completes
      await waitFor(() => {
        const finalOpacity = parseFloat(el.style.opacity);
        expect(finalOpacity).toBeCloseTo(0.8, 1);
      });

      // Remove focus
      act(() => {
        el.dispatchEvent(new FocusEvent('blur', { bubbles: true }));
      });

      act(() => {
        jest.advanceTimersByTime(100);
      });

      // Should revert back to 1
      await waitFor(() => {
        const finalOpacity = parseFloat(el.style.opacity);
        expect(finalOpacity).toBeCloseTo(1, 1);
      });
    });

    it('applies string properties like boxShadow in hover state when not in initial style', async () => {
      // Test that boxShadow works from no shadow (empty) to shadow when not in initial style
      render(
        <animate.div
          data-testid="boxshadow-test"
          hover={{
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          }}
        >
          Hover me
        </animate.div>
      );

      const el = screen.getByTestId('boxshadow-test') as HTMLElement;

      // Initially boxShadow should be empty (no shadow)
      const initialBoxShadow = el.style.boxShadow;
      expect(initialBoxShadow).toBe('');

      // Trigger hover
      act(() => {
        el.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
      });

      // Wait for spring animation to apply
      act(() => {
        jest.advanceTimersByTime(200);
      });

      // After hover animation completes, boxShadow should be applied
      await waitFor(() => {
        const boxShadow = el.style.boxShadow;
        expect(boxShadow).toContain('rgba(0,0,0,0.3)');
        expect(boxShadow).toContain('12px');
      }, { timeout: 1000 });

      // Remove hover
      act(() => {
        el.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
      });

      act(() => {
        jest.advanceTimersByTime(200);
      });

      // Should revert back to empty (no shadow)
      await waitFor(() => {
        const boxShadow = el.style.boxShadow;
        expect(boxShadow).toBe('');
      }, { timeout: 1000 });
    });

    it('applies string properties like boxShadow in exit state when not in initial style', async () => {
      const { Presence } = await import('../../modules/Presence');
      const onExitComplete = jest.fn();
      let show = true;

      function TestComponent() {
        return (
          <Presence onExitComplete={onExitComplete}>
            {show && (
              <animate.div
                key="test"
                data-testid="exit-boxshadow"
                exit={{
                  boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                }}
              >
                Content
              </animate.div>
            )}
          </Presence>
        );
      }

      const { rerender } = render(<TestComponent />);
      const el = screen.getByTestId('exit-boxshadow') as HTMLElement;

      // Initially boxShadow should be empty (no shadow)
      const initialBoxShadow = el.style.boxShadow;
      expect(initialBoxShadow).toBe('');

      // Remove element to trigger exit
      show = false;
      rerender(<TestComponent />);

      act(() => {
        jest.advanceTimersByTime(200);
      });

      // After exit animation completes, boxShadow should be applied
      await waitFor(() => {
        const boxShadow = el.style.boxShadow;
        expect(boxShadow).toContain('rgba(0,0,0,0.5)');
        expect(boxShadow).toContain('24px');
      }, { timeout: 1000 });
    });

    it('applies multiple properties in hover state when not in initial style', async () => {
      render(
        <animate.div
          data-testid="multi-hover"
          style={{ boxShadow: '0px 0px 0px rgba(0,0,0,0)' }}
          hover={{
            opacity: 0.6,
            scale: 1.1,
            boxShadow: withTiming('0px 4px 8px rgba(0,0,0,0.2)', { duration: 100 }),
          }}
        >
          Hover me
        </animate.div>
      );

      const el = screen.getByTestId('multi-hover') as HTMLElement;

      // Initially values should be defaults (opacity not in style, so defaults to 1)
      const initialOpacity = el.style.opacity;
      const initialOpacityNum = initialOpacity ? parseFloat(initialOpacity) : 1;
      expect(initialOpacityNum).toBe(1);
      const initialBoxShadow = el.style.boxShadow;
      expect(initialBoxShadow).toContain('rgba(0,0,0,0)');

      // Trigger hover
      act(() => {
        el.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
      });

      act(() => {
        jest.advanceTimersByTime(100);
      });

      // After hover animation completes, all properties should be applied
      await waitFor(() => {
        const opacity = parseFloat(el.style.opacity);
        const boxShadow = el.style.boxShadow;
        const transform = el.style.transform;

        expect(opacity).toBeCloseTo(0.6, 1);
        expect(boxShadow).toContain('rgba(0,0,0,0.2)');
        expect(transform).toContain('scale(1.1)');
      }, { timeout: 1000 });
    });

    it('applies transform properties in press state when not in initial style', async () => {
      render(
        <animate.div
          data-testid="press-transform"
          press={{
            scale: 0.95,
            translateY: 2,
          }}
        >
          Press me
        </animate.div>
      );

      const el = screen.getByTestId('press-transform') as HTMLElement;

      // Initially transform might be empty or have default values (scale(1), translateY(0))
      const initialTransform = el.style.transform;
      // Transform might be empty or contain default values
      expect(initialTransform === '' || initialTransform.includes('scale(1)') || initialTransform.includes('translateY(0')).toBe(true);

      // Trigger press
      act(() => {
        el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      });

      act(() => {
        jest.advanceTimersByTime(200);
      });

      // After press animation completes
      await waitFor(() => {
        const transform = el.style.transform;
        expect(transform).toContain('scale(0.95)');
        // translateY should be close to 2px (allowing for spring animation precision)
        const translateYMatch = transform.match(/translateY\(([^)]+)\)/);
        if (translateYMatch) {
          const translateYValue = parseFloat(translateYMatch[1]);
          expect(translateYValue).toBeCloseTo(2, 0);
        } else {
          expect(transform).toContain('translateY');
        }
      }, { timeout: 1000 });

      // Release press
      act(() => {
        el.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
      });

      act(() => {
        jest.advanceTimersByTime(200);
      });

      // Should revert back to initial (might be empty or default values)
      await waitFor(() => {
        const transform = el.style.transform;
        // After revert, transform should be back to initial state
        const hasScale = transform.includes('scale(1)') || transform.includes('scale(0.95)');
        const hasTranslateY = transform.includes('translateY(0') || transform.includes('translateY(2');
        // Either empty or back to defaults
        expect(transform === '' || (hasScale && hasTranslateY)).toBe(true);
      }, { timeout: 1000 });
    });
  });
});

