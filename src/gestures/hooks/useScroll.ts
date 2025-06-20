import { RefObject, useEffect } from 'react';

import { type ScrollEvent, ScrollGesture } from '../controllers/ScrollGesture';

export function useScroll<T extends HTMLElement>(
  ref: RefObject<T>,
  onScroll: (e: ScrollEvent) => void
): void {
  useEffect(() => {
    if (!ref.current) return;
    const gesture = new ScrollGesture();
    gesture.onChange(onScroll).onEnd(onScroll);
    const cleanup = gesture.attach(ref.current);
    return cleanup;
  }, [ref, onScroll]);
}
