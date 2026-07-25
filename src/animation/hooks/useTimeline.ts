import { useCallback, useEffect, useMemo, useRef } from 'react';

interface TimelineEntry {
  setter: (to: any) => void;
  to: any;
  at: number;
}

export interface Timeline {
  /**
   * Schedules `setter(to)` to run `options.at` milliseconds after `play()`
   * is called (default `0` — fires immediately, alongside every other
   * zero-offset entry). Returns the timeline so calls can be chained.
   */
  add<T>(
    setter: (to: T) => void,
    to: T,
    options?: { at?: number }
  ): Timeline;
  /** Fires every scheduled entry at its offset. Re-playing cancels any of this timeline's own entries still pending from a previous `play()`. */
  play(): void;
  /** Cancels entries that haven't fired yet; animations already started keep running on their own controls. */
  cancel(): void;
  /** Cancels pending entries and forgets everything scheduled via `add`. */
  clear(): void;
}

/**
 * Orchestrates animations across independently-owned `useValue` setters —
 * different elements, different components — by scheduled millisecond
 * offset, the way `withSequence`/`withStagger` do for values from a single
 * `useValue` call. Springs/decays don't have a fixed duration, so offsets
 * are picked by the caller (timeline-style, explicit offsets) rather than
 * inferred.
 */
export function useTimeline(): Timeline {
  const entriesRef = useRef<TimelineEntry[]>([]);
  const timeoutIdsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = useCallback(() => {
    timeoutIdsRef.current.forEach((id) => clearTimeout(id));
    timeoutIdsRef.current = [];
  }, []);

  const timeline = useMemo<Timeline>(() => {
    const api: Timeline = {
      add(setter, to, options = {}) {
        entriesRef.current.push({ setter, to, at: options.at ?? 0 });
        return api;
      },
      play() {
        clearTimers();
        for (const entry of entriesRef.current) {
          if (entry.at <= 0) {
            entry.setter(entry.to);
          } else {
            timeoutIdsRef.current.push(
              setTimeout(() => entry.setter(entry.to), entry.at)
            );
          }
        }
      },
      cancel() {
        clearTimers();
      },
      clear() {
        clearTimers();
        entriesRef.current = [];
      },
    };
    return api;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  return timeline;
}
