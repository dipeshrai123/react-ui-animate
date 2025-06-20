import { RefObject, useEffect } from 'react';

import { type MoveEvent, MoveGesture } from '../controllers/MoveGesture';

export function useMove<T extends HTMLElement>(
  ref: RefObject<T>,
  onMove: (e: MoveEvent) => void
): void {
  useEffect(() => {
    if (!ref.current) return;
    const gesture = new MoveGesture();
    gesture.onChange(onMove).onEnd(onMove);
    const cleanup = gesture.attach(ref.current);
    return cleanup;
  }, [ref, onMove]);
}
