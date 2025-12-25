import React, { useState } from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Presence, usePresence, useIsPresent } from '../Presence';
import { animate, withTiming } from '../../index';

describe('Presence', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders children when provided', () => {
    render(
      <Presence>
        <div data-testid="child">Child</div>
      </Presence>
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('renders nothing when no children', () => {
    const { container } = render(<Presence />);
    expect(container.firstChild).toBeNull();
  });

  it('handles conditional rendering with exit animations', async () => {
    function TestComponent() {
      const [show, setShow] = useState(true);

      return (
        <>
          <button onClick={() => setShow(false)}>Hide</button>
          <Presence>
            {show && (
              <animate.div
                key="test"
                data-testid="animated"
                style={{ opacity: 0 }}
                animate={{ opacity: withTiming(1, { duration: 100 }) }}
                exit={{ opacity: withTiming(0, { duration: 100 }) }}
              >
                Content
              </animate.div>
            )}
          </Presence>
        </>
      );
    }

    render(<TestComponent />);
    expect(screen.getByTestId('animated')).toBeInTheDocument();

    act(() => {
      screen.getByText('Hide').click();
    });

    // Element should still be in DOM during exit animation
    expect(screen.getByTestId('animated')).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(150);
    });

    // After exit animation completes, element should be removed
    await waitFor(() => {
      expect(screen.queryByTestId('animated')).not.toBeInTheDocument();
    });
  });

  it('handles multiple children with unique keys', () => {
    function TestComponent() {
      const [items, setItems] = useState(['a', 'b']);

      return (
        <>
          <button onClick={() => setItems(['a'])}>Remove B</button>
          <Presence>
            {items.map((item) => (
              <animate.div key={item} data-testid={`item-${item}`}>
                {item}
              </animate.div>
            ))}
          </Presence>
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
    expect(screen.getByTestId('item-b')).toBeInTheDocument(); // Still in DOM during exit
  });

  it('calls onExitComplete when all exits are done', async () => {
    const onExitComplete = jest.fn();

    function TestComponent() {
      const [show, setShow] = useState(true);

      return (
        <>
          <button onClick={() => setShow(false)}>Hide</button>
          <Presence onExitComplete={onExitComplete}>
            {show && (
              <animate.div
                key="test"
                style={{ opacity: 0 }}
                exit={{ opacity: withTiming(0, { duration: 100 }) }}
              >
                Content
              </animate.div>
            )}
          </Presence>
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

    await waitFor(() => {
      expect(onExitComplete).toHaveBeenCalledTimes(1);
    });
  });

  it('handles initial prop to skip enter animation', () => {
    function TestComponent() {
      return (
        <Presence initial={false}>
          <animate.div
            key="test"
            data-testid="child"
            style={{ opacity: 0 }}
            animate={{ opacity: withTiming(1, { duration: 100 }) }}
          >
            Content
          </animate.div>
        </Presence>
      );
    }

    render(<TestComponent />);
    const child = screen.getByTestId('child');
    // With initial=false, enter animation should be skipped
    expect(child).toBeInTheDocument();
  });

  it('handles mode="wait" - waits for exits before entering', async () => {
    function TestComponent() {
      const [items, setItems] = useState(['a', 'b']);

      return (
        <>
          <button onClick={() => setItems(['c'])}>Replace</button>
          <Presence mode="wait">
            {items.map((item) => (
              <animate.div
                key={item}
                data-testid={`item-${item}`}
                style={{ opacity: 0 }}
                animate={{ opacity: withTiming(1, { duration: 50 }) }}
                exit={{ opacity: withTiming(0, { duration: 50 }) }}
              >
                {item}
              </animate.div>
            ))}
          </Presence>
        </>
      );
    }

    render(<TestComponent />);
    expect(screen.getByTestId('item-a')).toBeInTheDocument();
    expect(screen.getByTestId('item-b')).toBeInTheDocument();

    act(() => {
      screen.getByText('Replace').click();
    });

    // In wait mode, new item should not appear until old ones exit
    expect(screen.queryByTestId('item-c')).not.toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(100);
    });

    // After exits complete, new item should appear
    await waitFor(() => {
      expect(screen.getByTestId('item-c')).toBeInTheDocument();
    });
  });

  it('handles mode="popLayout" - removes from layout flow immediately', () => {
    function TestComponent() {
      const [show, setShow] = useState(true);

      return (
        <>
          <button onClick={() => setShow(false)}>Hide</button>
          <Presence mode="popLayout">
            {show && (
              <animate.div
                key="test"
                data-testid="child"
                style={{ opacity: 0 }}
                exit={{ opacity: withTiming(0, { duration: 100 }) }}
              >
                Content
              </animate.div>
            )}
          </Presence>
        </>
      );
    }

    render(<TestComponent />);
    const child = screen.getByTestId('child');

    act(() => {
      screen.getByText('Hide').click();
    });

    // Wait for React to update and PresenceChild to wrap the element
    // Use act with timer advancement instead of waitFor to work with fake timers
    act(() => {
      jest.advanceTimersByTime(0);
    });

    // In popLayout mode, the PresenceChild should wrap exiting elements in a div with position: absolute
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

describe('usePresence', () => {
  it('returns [true, noop] when not inside Presence', () => {
    function TestComponent() {
      const [isPresent, onExitComplete] = usePresence();
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

  it('returns correct state when inside Presence', async () => {
    function TestComponent() {
      const [show, setShow] = useState(true);

      function Child() {
        const [isPresent, onExitComplete] = usePresence();
        return (
          <div>
            <div data-testid="present">{isPresent ? 'present' : 'exiting'}</div>
            <animate.div
              style={{ opacity: 0 }}
              exit={{ opacity: withTiming(0, { duration: 100, onComplete: onExitComplete }) }}
            >
              Content
            </animate.div>
          </div>
        );
      }

      return (
        <>
          <button onClick={() => setShow(false)}>Hide</button>
          <Presence>
            {show && <Child key="child" />}
          </Presence>
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

    act(() => {
      jest.advanceTimersByTime(150);
    });

    await waitFor(() => {
      expect(screen.queryByTestId('present')).not.toBeInTheDocument();
    });
  });
});

describe('useIsPresent', () => {
  it('returns true when not inside Presence', () => {
    function TestComponent() {
      const isPresent = useIsPresent();
      return <div data-testid="present">{isPresent ? 'true' : 'false'}</div>;
    }

    render(<TestComponent />);
    expect(screen.getByTestId('present')).toHaveTextContent('true');
  });

  it('returns false when exiting inside Presence', () => {
    function TestComponent() {
      const [show, setShow] = useState(true);

      function Child() {
        const isPresent = useIsPresent();
        return <div data-testid="present">{isPresent ? 'present' : 'exiting'}</div>;
      }

      return (
        <>
          <button onClick={() => setShow(false)}>Hide</button>
          <Presence>
            {show && <Child key="child" />}
          </Presence>
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
  });
});

