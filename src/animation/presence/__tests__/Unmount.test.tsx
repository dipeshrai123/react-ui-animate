import React, { useState } from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Unmount, useUnmount, useIsUnmounting } from '../Unmount';
import { animate, withTiming } from '../../index';

describe('Unmount', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllTimers();
  });

  it('renders children when provided', () => {
    render(
      <Unmount>
        <div data-testid="child">Child</div>
      </Unmount>
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('renders nothing when no children', () => {
    const { container } = render(<Unmount />);
    expect(container.firstChild).toBeNull();
  });

  it('handles conditional rendering with unmount animations', async () => {
    function TestComponent() {
      const [show, setShow] = useState(true);

      return (
        <>
          <button onClick={() => setShow(false)}>Hide</button>
          <Unmount>
            {show && (
              <animate.div
                key="test"
                data-testid="animated"
                style={{ opacity: 0 }}
                animate={{ opacity: withTiming(1, { duration: 100 }) }}
                unmount={{ opacity: withTiming(0, { duration: 100 }) }}
              >
                Content
              </animate.div>
            )}
          </Unmount>
        </>
      );
    }

    render(<TestComponent />);
    expect(screen.getByTestId('animated')).toBeInTheDocument();

    act(() => {
      screen.getByText('Hide').click();
    });

    // Element should still be in DOM during unmount animation
    expect(screen.getByTestId('animated')).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(150);
    });

    // Flush any pending updates
    act(() => {
      jest.runOnlyPendingTimers();
    });

    // After unmount animation completes, element should be removed
    expect(screen.queryByTestId('animated')).not.toBeInTheDocument();
  });

  it('handles multiple children with unique keys', () => {
    function TestComponent() {
      const [items, setItems] = useState(['a', 'b']);

      return (
        <>
          <button onClick={() => setItems(['a'])}>Remove B</button>
          <Unmount>
            {items.map((item) => (
              <animate.div
                key={item}
                data-testid={`item-${item}`}
                unmount={{ opacity: withTiming(0, { duration: 100 }) }}
              >
                {item}
              </animate.div>
            ))}
          </Unmount>
        </>
      );
    }

    render(<TestComponent />);
    expect(screen.getByTestId('item-a')).toBeInTheDocument();
    expect(screen.getByTestId('item-b')).toBeInTheDocument();

    act(() => {
      screen.getByText('Remove B').click();
    });

    expect(screen.getByTestId('item-a')).toBeInTheDocument();
    expect(screen.getByTestId('item-b')).toBeInTheDocument(); // Still in DOM during unmount

    act(() => {
      jest.advanceTimersByTime(150);
    });
    act(() => {
      jest.runOnlyPendingTimers();
    });

    expect(screen.queryByTestId('item-b')).not.toBeInTheDocument();
  });

  it('removes a plain (non-animated) child immediately, with no unmount delay', () => {
    function TestComponent() {
      const [show, setShow] = useState(true);

      return (
        <>
          <button onClick={() => setShow(false)}>Hide</button>
          <Unmount>
            {show && (
              <div key="plain" data-testid="plain">
                Content
              </div>
            )}
          </Unmount>
        </>
      );
    }

    render(<TestComponent />);
    expect(screen.getByTestId('plain')).toBeInTheDocument();

    act(() => {
      screen.getByText('Hide').click();
    });

    expect(screen.queryByTestId('plain')).not.toBeInTheDocument();
  });

  it('removes an animate.div with no unmount prop immediately, with no unmount delay', () => {
    function TestComponent() {
      const [show, setShow] = useState(true);

      return (
        <>
          <button onClick={() => setShow(false)}>Hide</button>
          <Unmount>
            {show && (
              <animate.div key="nounmount" data-testid="nounmount">
                Content
              </animate.div>
            )}
          </Unmount>
        </>
      );
    }

    render(<TestComponent />);
    expect(screen.getByTestId('nounmount')).toBeInTheDocument();

    act(() => {
      screen.getByText('Hide').click();
    });

    expect(screen.queryByTestId('nounmount')).not.toBeInTheDocument();
  });

  it('calls onExitComplete when all unmounts are done', async () => {
    const onExitComplete = jest.fn();

    function TestComponent() {
      const [show, setShow] = useState(true);

      return (
        <>
          <button onClick={() => setShow(false)}>Hide</button>
          <Unmount onExitComplete={onExitComplete}>
            {show && (
              <animate.div
                key="test"
                style={{ opacity: 0 }}
                unmount={{ opacity: withTiming(0, { duration: 100 }) }}
              >
                Content
              </animate.div>
            )}
          </Unmount>
        </>
      );
    }

    render(<TestComponent />);

    act(() => {
      screen.getByText('Hide').click();
    });

    act(() => {
      jest.advanceTimersByTime(150);
    });

    // Flush any pending updates
    act(() => {
      jest.runOnlyPendingTimers();
    });

    expect(onExitComplete).toHaveBeenCalledTimes(1);
  });

  it('handles initial prop to skip enter animation', () => {
    function TestComponent() {
      return (
        <Unmount initial={false}>
          <animate.div
            key="test"
            data-testid="child"
            style={{ opacity: 0 }}
            animate={{ opacity: withTiming(1, { duration: 100 }) }}
          >
            Content
          </animate.div>
        </Unmount>
      );
    }

    act(() => {
      render(<TestComponent />);
    });

    // Advance timers to ensure any internal timers are processed
    act(() => {
      jest.advanceTimersByTime(0);
    });

    const child = screen.getByTestId('child');
    // With initial=false, enter animation should be skipped
    expect(child).toBeInTheDocument();
  });

  it('handles mode="wait" - waits for unmounts before entering', async () => {
    function TestComponent() {
      const [items, setItems] = useState(['a', 'b']);

      return (
        <>
          <button onClick={() => setItems(['c'])}>Replace</button>
          <Unmount mode="wait">
            {items.map((item) => (
              <animate.div
                key={item}
                data-testid={`item-${item}`}
                style={{ opacity: 0 }}
                animate={{ opacity: withTiming(1, { duration: 50 }) }}
                unmount={{ opacity: withTiming(0, { duration: 50 }) }}
              >
                {item}
              </animate.div>
            ))}
          </Unmount>
        </>
      );
    }

    render(<TestComponent />);
    expect(screen.getByTestId('item-a')).toBeInTheDocument();
    expect(screen.getByTestId('item-b')).toBeInTheDocument();

    act(() => {
      screen.getByText('Replace').click();
    });

    // In wait mode, new item should not appear until old ones unmount
    expect(screen.queryByTestId('item-c')).not.toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(100);
    });

    // Flush any pending updates
    act(() => {
      jest.runOnlyPendingTimers();
    });

    // After unmounts complete, new item should appear
    expect(screen.getByTestId('item-c')).toBeInTheDocument();
  });

  it('handles mode="popLayout" - removes from layout flow immediately', () => {
    function TestComponent() {
      const [show, setShow] = useState(true);

      return (
        <>
          <button onClick={() => setShow(false)}>Hide</button>
          <Unmount mode="popLayout">
            {show && (
              <animate.div
                key="test"
                data-testid="child"
                style={{ opacity: 0 }}
                unmount={{ opacity: withTiming(0, { duration: 100 }) }}
              >
                Content
              </animate.div>
            )}
          </Unmount>
        </>
      );
    }

    render(<TestComponent />);

    act(() => {
      screen.getByText('Hide').click();
    });

    // Wait for React to update and UnmountChild to wrap the element
    // Use act with timer advancement instead of waitFor to work with fake timers
    act(() => {
      jest.advanceTimersByTime(0);
    });

    // In popLayout mode, the UnmountChild should wrap exiting elements in a div with position: absolute
    // Get the child element before checking (outside of act to avoid timer issues)
    const childElement = screen.getByTestId('child');
    const parent = childElement.parentElement;
    expect(parent).toBeTruthy();
    // Check if parent or its parent has position: absolute
    const hasAbsolutePosition =
      parent?.style.position === 'absolute' ||
      parent?.parentElement?.style.position === 'absolute';
    expect(hasAbsolutePosition).toBe(true);
  });
});

describe('useUnmount', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllTimers();
  });

  it('returns [true, noop] when not inside Unmount', () => {
    function TestComponent() {
      const [isPresent, onExitComplete] = useUnmount();
      return (
        <div>
          <div data-testid="present">{isPresent ? 'true' : 'false'}</div>
          <button onClick={onExitComplete}>Complete</button>
        </div>
      );
    }

    render(<TestComponent />);
    expect(screen.getByTestId('present')).toHaveTextContent('true');
  });

  it('returns correct state when inside Unmount', async () => {
    function TestComponent() {
      const [show, setShow] = useState(true);

      function Child() {
        const [isPresent, onExitComplete] = useUnmount();
        return (
          <div>
            <div data-testid="present">{isPresent ? 'present' : 'exiting'}</div>
            <animate.div
              style={{ opacity: 0 }}
              unmount={{ opacity: withTiming(0, { duration: 100, onComplete: onExitComplete }) }}
            >
              Content
            </animate.div>
          </div>
        );
      }

      return (
        <>
          <button onClick={() => setShow(false)}>Hide</button>
          <Unmount>
            {show && <Child key="child" />}
          </Unmount>
        </>
      );
    }

    render(<TestComponent />);
    expect(screen.getByTestId('present')).toHaveTextContent('present');

    act(() => {
      screen.getByText('Hide').click();
    });

    // Should be exiting now
    expect(screen.getByTestId('present')).toHaveTextContent('exiting');

    // Advance timers to complete the unmount animation
    act(() => {
      jest.advanceTimersByTime(150);
    });

    // Flush any pending updates
    act(() => {
      jest.runOnlyPendingTimers();
    });

    // The element should be removed after unmount animation completes
    expect(screen.queryByTestId('present')).not.toBeInTheDocument();
  });
});

describe('useIsUnmounting', () => {
  it('returns false when not inside Unmount', () => {
    function TestComponent() {
      const isUnmounting = useIsUnmounting();
      return <div data-testid="unmounting">{isUnmounting ? 'true' : 'false'}</div>;
    }

    render(<TestComponent />);
    expect(screen.getByTestId('unmounting')).toHaveTextContent('false');
  });

  it('returns true when exiting inside Unmount', () => {
    function TestComponent() {
      const [show, setShow] = useState(true);

      function Child() {
        // Opt in to holding the DOM node during unmount (via useUnmount)
        // so the 'exiting' state is observable before removal.
        useUnmount();
        const isUnmounting = useIsUnmounting();
        return <div data-testid="unmounting">{isUnmounting ? 'exiting' : 'present'}</div>;
      }

      return (
        <>
          <button onClick={() => setShow(false)}>Hide</button>
          <Unmount>
            {show && <Child key="child" />}
          </Unmount>
        </>
      );
    }

    render(<TestComponent />);
    expect(screen.getByTestId('unmounting')).toHaveTextContent('present');

    act(() => {
      screen.getByText('Hide').click();
    });

    // Should be exiting now
    expect(screen.getByTestId('unmounting')).toHaveTextContent('exiting');
  });
});
