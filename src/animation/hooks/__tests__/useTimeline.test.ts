import { renderHook, act } from '@testing-library/react';
import { useTimeline } from '../useTimeline';

describe('useTimeline', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('fires zero-offset entries immediately on play', () => {
    const setter = jest.fn();
    const { result } = renderHook(() => useTimeline());

    act(() => {
      result.current.add(setter, 'a');
      result.current.play();
    });

    expect(setter).toHaveBeenCalledWith('a');
  });

  it('schedules positive-offset entries at their delay', () => {
    const early = jest.fn();
    const late = jest.fn();
    const { result } = renderHook(() => useTimeline());

    act(() => {
      result.current.add(early, 1, { at: 100 });
      result.current.add(late, 2, { at: 300 });
      result.current.play();
    });

    expect(early).not.toHaveBeenCalled();
    expect(late).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(early).toHaveBeenCalledWith(1);
    expect(late).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(200);
    });
    expect(late).toHaveBeenCalledWith(2);
  });

  it('is chainable via add()', () => {
    const a = jest.fn();
    const b = jest.fn();
    const { result } = renderHook(() => useTimeline());

    act(() => {
      result.current.add(a, 1).add(b, 2).play();
    });

    expect(a).toHaveBeenCalledWith(1);
    expect(b).toHaveBeenCalledWith(2);
  });

  it('cancels pending entries without re-running fired ones', () => {
    const setter = jest.fn();
    const { result } = renderHook(() => useTimeline());

    act(() => {
      result.current.add(setter, 1, { at: 200 });
      result.current.play();
      result.current.cancel();
      jest.advanceTimersByTime(500);
    });

    expect(setter).not.toHaveBeenCalled();
  });

  it('re-playing cancels entries still pending from the previous play()', () => {
    const setter = jest.fn();
    const { result } = renderHook(() => useTimeline());

    act(() => {
      result.current.add(setter, 'first', { at: 200 });
    });

    act(() => {
      result.current.play();
      jest.advanceTimersByTime(50);
      result.current.play(); // restart before the first play's entry fired
    });

    act(() => {
      jest.advanceTimersByTime(200); // 200ms since the second play()
    });
    expect(setter).toHaveBeenCalledTimes(1);

    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(setter).toHaveBeenCalledTimes(1);
  });

  it('clear() forgets scheduled entries entirely', () => {
    const setter = jest.fn();
    const { result } = renderHook(() => useTimeline());

    act(() => {
      result.current.add(setter, 1, { at: 100 });
      result.current.clear();
      result.current.play();
      jest.advanceTimersByTime(500);
    });

    expect(setter).not.toHaveBeenCalled();
  });

  it('clears pending timers on unmount', () => {
    const setter = jest.fn();
    const { result, unmount } = renderHook(() => useTimeline());

    act(() => {
      result.current.add(setter, 1, { at: 200 });
      result.current.play();
    });

    unmount();

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(setter).not.toHaveBeenCalled();
  });
});
