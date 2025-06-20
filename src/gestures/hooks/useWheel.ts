import { RefObject, useEffect } from 'react';

import { type WheelEvent, WheelGesture } from '../controllers/WheelGesture';

export function useWheel<T extends HTMLElement>(
  ref: RefObject<T>,
  onWheel: (e: WheelEvent) => void
): void {
  useEffect(() => {
    if (!ref.current) return;
    const gesture = new WheelGesture();
    gesture.onChange(onWheel).onEnd(onWheel);
    const cleanup = gesture.attach(ref.current);
    return cleanup;
  }, [ref, onWheel]);
}
