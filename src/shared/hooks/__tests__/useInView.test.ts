import { renderHook, waitFor, act } from '@testing-library/react';
import { useRef } from 'react';
import { useInView } from '../useInView';

// Mock IntersectionObserver
class MockIntersectionObserver {
  observe = jest.fn();
  disconnect = jest.fn();
  unobserve = jest.fn();
  root = null;
  rootMargin = '';
  thresholds = [];

  constructor(
    public callback: IntersectionObserverCallback,
    public options?: IntersectionObserverInit
  ) {}
}

// Helper to create mock IntersectionObserverEntry
function createMockEntry(
  isIntersecting: boolean,
  target: Element
): IntersectionObserverEntry {
  return {
    isIntersecting,
    target,
    boundingClientRect: {} as DOMRectReadOnly,
    intersectionRatio: isIntersecting ? 1 : 0,
    intersectionRect: {} as DOMRectReadOnly,
    rootBounds: null,
    time: Date.now(),
  } as IntersectionObserverEntry;
}

describe('useInView', () => {
  let mockObserver: MockIntersectionObserver;
  let originalIntersectionObserver: typeof IntersectionObserver;

  beforeEach(() => {
    originalIntersectionObserver = global.IntersectionObserver;
    (global.IntersectionObserver as any) = jest.fn().mockImplementation(
      (callback: IntersectionObserverCallback) => {
        mockObserver = new MockIntersectionObserver(callback);
        return mockObserver;
      }
    );
  });

  afterEach(() => {
    global.IntersectionObserver = originalIntersectionObserver;
    jest.clearAllMocks();
  });

  it('returns false initially', () => {
    const ref = { current: document.createElement('div') };
    const { result } = renderHook(() => useInView(ref));

    expect(result.current).toBe(false);
  });

  it('creates IntersectionObserver with default options', () => {
    const ref = { current: document.createElement('div') };
    renderHook(() => useInView(ref));

    expect(global.IntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      { root: null, rootMargin: undefined, threshold: undefined }
    );
  });

  it('creates IntersectionObserver with custom options', () => {
    const ref = { current: document.createElement('div') };
    const options = {
      root: document.body,
      rootMargin: '10px',
      threshold: 0.5,
    };

    renderHook(() => useInView(ref, options));

    expect(global.IntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      options
    );
  });

  it('observes the ref element', () => {
    const ref = { current: document.createElement('div') };
    let createdObserver: MockIntersectionObserver | undefined;

    (global.IntersectionObserver as any).mockImplementation(
      (callback: IntersectionObserverCallback) => {
        createdObserver = new MockIntersectionObserver(callback);
        return createdObserver;
      }
    );

    renderHook(() => useInView(ref));

    expect(createdObserver).toBeDefined();
    expect(createdObserver!.observe).toHaveBeenCalledWith(ref.current);
  });

  it('updates isInView when element enters viewport', async () => {
    const ref = { current: document.createElement('div') };
    let observerCallback: IntersectionObserverCallback | undefined;

    (global.IntersectionObserver as any).mockImplementation(
      (callback: IntersectionObserverCallback) => {
        observerCallback = callback;
        const obs = new MockIntersectionObserver(callback);
        return obs;
      }
    );

    const { result } = renderHook(() => useInView(ref));

    expect(result.current).toBe(false);

    // Simulate element entering viewport
    if (observerCallback) {
      act(() => {
        observerCallback!(
          [createMockEntry(true, ref.current)],
          mockObserver as any
        );
      });
    }

    await waitFor(() => {
      expect(result.current).toBe(true);
    });
  });

  it('updates isInView when element leaves viewport', async () => {
    const ref = { current: document.createElement('div') };
    let observerCallback: IntersectionObserverCallback | undefined;

    (global.IntersectionObserver as any).mockImplementation(
      (callback: IntersectionObserverCallback) => {
        observerCallback = callback;
        const obs = new MockIntersectionObserver(callback);
        return obs;
      }
    );

    const { result } = renderHook(() => useInView(ref));

    // Enter viewport
    if (observerCallback) {
      act(() => {
        observerCallback!(
          [createMockEntry(true, ref.current)],
          mockObserver as any
        );
      });
    }

    await waitFor(() => {
      expect(result.current).toBe(true);
    });

    // Leave viewport
    if (observerCallback) {
      act(() => {
        observerCallback!(
          [createMockEntry(false, ref.current)],
          mockObserver as any
        );
      });
    }

    await waitFor(() => {
      expect(result.current).toBe(false);
    });
  });

  it('handles once option - stops observing after first intersection', async () => {
    const ref = { current: document.createElement('div') };
    let observerCallback: IntersectionObserverCallback | undefined;
    let testObserver: MockIntersectionObserver;

    (global.IntersectionObserver as any).mockImplementation(
      (callback: IntersectionObserverCallback) => {
        observerCallback = callback;
        testObserver = new MockIntersectionObserver(callback);
        return testObserver;
      }
    );

    renderHook(() => useInView(ref, { once: true }));

    // Enter viewport
    if (observerCallback && testObserver!) {
      act(() => {
        observerCallback!(
          [
            createMockEntry(true, ref.current),
          ],
          testObserver as any
        );
      });
    }

    await waitFor(() => {
      expect(testObserver!.unobserve).toHaveBeenCalledWith(ref.current);
      expect(testObserver!.disconnect).toHaveBeenCalled();
    });
  });

  it('handles once option - does not update when leaving after first intersection', async () => {
    const ref = { current: document.createElement('div') };
    let observerCallback: IntersectionObserverCallback | undefined;
    let testObserver: MockIntersectionObserver;

    (global.IntersectionObserver as any).mockImplementation(
      (callback: IntersectionObserverCallback) => {
        observerCallback = callback;
        testObserver = new MockIntersectionObserver(callback);
        return testObserver;
      }
    );

    const { result } = renderHook(() => useInView(ref, { once: true }));

    // Enter viewport
    if (observerCallback && testObserver!) {
      act(() => {
        observerCallback!(
          [createMockEntry(true, ref.current)],
          testObserver as any
        );
      });
    }

    await waitFor(() => {
      expect(result.current).toBe(true);
    });

    // Leave viewport - should not update because once=true
    if (observerCallback && testObserver!) {
      act(() => {
        observerCallback!(
          [createMockEntry(false, ref.current)],
          testObserver as any
        );
      });
    }

    // Should still be true because once=true prevents updates after first intersection
    expect(result.current).toBe(true);
  });

  it('cleans up observer on unmount', () => {
    const ref = { current: document.createElement('div') };
    const { unmount } = renderHook(() => useInView(ref));

    unmount();

    expect(mockObserver.disconnect).toHaveBeenCalled();
  });

  it('handles null ref gracefully', () => {
    const ref = { current: null };
    const { result } = renderHook(() => useInView(ref));

    expect(result.current).toBe(false);
    expect(mockObserver.observe).not.toHaveBeenCalled();
  });

  it('recreates observer when options change', () => {
    const ref = { current: document.createElement('div') };
    const { rerender } = renderHook(
      ({ options }) => useInView(ref, options),
      {
        initialProps: { options: { threshold: 0.5 } },
      }
    );

    const firstCallCount = (global.IntersectionObserver as any).mock.calls.length;

    rerender({ options: { threshold: 0.8 } });

    expect((global.IntersectionObserver as any).mock.calls.length).toBeGreaterThan(
      firstCallCount
    );
  });
});

