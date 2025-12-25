import { renderHook } from '@testing-library/react';
import { useRef } from 'react';
import { useOutsideClick } from '../useOutsideClick';

describe('useOutsideClick', () => {
  let container: HTMLDivElement;
  let element: HTMLDivElement;
  let outsideElement: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);

    element = document.createElement('div');
    element.id = 'test-element';
    container.appendChild(element);

    outsideElement = document.createElement('div');
    outsideElement.id = 'outside-element';
    container.appendChild(outsideElement);
  });

  afterEach(() => {
    document.body.removeChild(container);
    jest.clearAllMocks();
  });

  it('calls callback when clicking outside element', () => {
    const callback = jest.fn();
    const ref = { current: element };

    renderHook(() => useOutsideClick(ref, callback));

    // Simulate click outside
    const event = new MouseEvent('mousedown', {
      bubbles: true,
      cancelable: true,
    });
    outsideElement.dispatchEvent(event);

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(event);
  });

  it('does not call callback when clicking inside element', () => {
    const callback = jest.fn();
    const ref = { current: element };

    renderHook(() => useOutsideClick(ref, callback));

    // Simulate click inside
    const event = new MouseEvent('mousedown', {
      bubbles: true,
      cancelable: true,
    });
    element.dispatchEvent(event);

    expect(callback).not.toHaveBeenCalled();
  });

  it('does not call callback when clicking on element itself', () => {
    const callback = jest.fn();
    const ref = { current: element };

    renderHook(() => useOutsideClick(ref, callback));

    // Simulate click on element
    const event = new MouseEvent('mousedown', {
      bubbles: true,
      cancelable: true,
    });
    Object.defineProperty(event, 'target', {
      value: element,
      writable: false,
    });
    document.dispatchEvent(event);

    expect(callback).not.toHaveBeenCalled();
  });

  it('handles touch events', () => {
    const callback = jest.fn();
    const ref = { current: element };

    renderHook(() => useOutsideClick(ref, callback));

    // Simulate touch outside
    const event = new TouchEvent('touchstart', {
      bubbles: true,
      cancelable: true,
    });
    outsideElement.dispatchEvent(event);

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(event);
  });

  it('handles null ref gracefully', () => {
    const callback = jest.fn();
    const ref = { current: null };

    renderHook(() => useOutsideClick(ref, callback));

    const event = new MouseEvent('mousedown', {
      bubbles: true,
      cancelable: true,
    });
    document.dispatchEvent(event);

    // Should not throw and callback should not be called
    expect(callback).not.toHaveBeenCalled();
  });

  it('handles disconnected element', () => {
    const callback = jest.fn();
    const ref = { current: element };

    renderHook(() => useOutsideClick(ref, callback));

    // Remove element from DOM
    container.removeChild(element);

    const event = new MouseEvent('mousedown', {
      bubbles: true,
      cancelable: true,
    });
    document.dispatchEvent(event);

    // Should not throw
    expect(callback).not.toHaveBeenCalled();
  });

  it('updates callback when dependencies change', () => {
    const callback1 = jest.fn();
    const callback2 = jest.fn();
    const ref = { current: element };

    const { rerender } = renderHook(
      ({ callback }) => useOutsideClick(ref, callback, [callback]),
      {
        initialProps: { callback: callback1 },
      }
    );

    // Click outside with first callback
    const event1 = new MouseEvent('mousedown', {
      bubbles: true,
      cancelable: true,
    });
    outsideElement.dispatchEvent(event1);

    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).not.toHaveBeenCalled();

    // Update callback
    rerender({ callback: callback2 });

    // Click outside with second callback
    const event2 = new MouseEvent('mousedown', {
      bubbles: true,
      cancelable: true,
    });
    outsideElement.dispatchEvent(event2);

    expect(callback1).toHaveBeenCalledTimes(1); // Still 1
    expect(callback2).toHaveBeenCalledTimes(1); // Now called
  });

  it('cleans up event listeners on unmount', () => {
    const callback = jest.fn();
    const ref = { current: element };

    const removeEventListenerSpy = jest.spyOn(
      document,
      'removeEventListener'
    );

    const { unmount } = renderHook(() => useOutsideClick(ref, callback));

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'mousedown',
      expect.any(Function)
    );
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'touchstart',
      expect.any(Function)
    );

    removeEventListenerSpy.mockRestore();
  });

  it('handles nested elements correctly', () => {
    const callback = jest.fn();
    const innerElement = document.createElement('div');
    innerElement.id = 'inner-element';
    element.appendChild(innerElement);
    const ref = { current: element };

    renderHook(() => useOutsideClick(ref, callback));

    // Click on inner element (should not trigger callback)
    const event = new MouseEvent('mousedown', {
      bubbles: true,
      cancelable: true,
    });
    innerElement.dispatchEvent(event);

    expect(callback).not.toHaveBeenCalled();

    // Click outside (should trigger callback)
    const event2 = new MouseEvent('mousedown', {
      bubbles: true,
      cancelable: true,
    });
    outsideElement.dispatchEvent(event2);

    expect(callback).toHaveBeenCalledTimes(1);
  });
});

