import { RefObject } from 'react';

import {
  type DragConfig,
  type DragEvent,
  DragGesture,
} from '../controllers/DragGesture';
import { useRecognizer } from './useRecognizer';

export function useDrag<T extends HTMLElement>(
  refs: RefObject<T> | Array<RefObject<T>>,
  onDrag: (e: DragEvent & { index: number }) => void,
  config?: DragConfig
): void {
  return useRecognizer(DragGesture, refs, onDrag, config);
}
