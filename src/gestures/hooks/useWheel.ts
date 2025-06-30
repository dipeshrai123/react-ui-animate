import { RefObject } from 'react';

import { type WheelEvent, WheelGesture } from '../controllers/WheelGesture';
import { useRecognizer } from './useRecognizer';

export function useWheel(
  refs: Window,
  onWheel: (e: WheelEvent & { index: 0 }) => void
): void;

export function useWheel<T extends HTMLElement>(
  refs: RefObject<T> | Array<RefObject<T>>,
  onWheel: (e: WheelEvent & { index: number }) => void
): void;

export function useWheel(refs: any, onWheel: any): void {
  return useRecognizer(WheelGesture, refs, onWheel);
}
