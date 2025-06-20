import { RefObject, useEffect } from 'react';

import {
  type DragConfig,
  type DragEvent,
  DragGesture,
} from '../controllers/DragGesture';

export function useDrag<T extends HTMLElement>(
  ref: RefObject<T>,
  onDrag: (e: DragEvent) => void,
  config?: DragConfig
): void {
  useEffect(() => {
    if (!ref.current) return;
    const gesture = new DragGesture(config);
    gesture.onChange(onDrag).onEnd(onDrag);
    const cleanup = gesture.attach(ref.current);
    return cleanup;
  }, [ref, onDrag, config]);
}
