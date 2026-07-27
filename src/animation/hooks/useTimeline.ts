import { useCallback, useEffect, useMemo, useRef } from 'react';

interface TimelineEntry {
  setter: (to: any) => void;
  to: any;
  at: number;
}

export interface Timeline {
  add<T>(
    setter: (to: T) => void,
    to: T,
    options?: { at?: number }
  ): Timeline;
  play(): void;
  cancel(): void;
  clear(): void;
}

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
