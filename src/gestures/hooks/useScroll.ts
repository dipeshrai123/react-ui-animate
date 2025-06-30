import { RefObject } from 'react';

import { type ScrollEvent, ScrollGesture } from '../controllers/ScrollGesture';
import { useRecognizer } from './useRecognizer';

export function useScroll(
  refs: Window,
  onScroll: (e: ScrollEvent & { index: 0 }) => void
): void;

export function useScroll<T extends HTMLElement>(
  refs: RefObject<T> | Array<RefObject<T>>,
  onScroll: (e: ScrollEvent & { index: number }) => void
): void;

export function useScroll(refs: any, onScroll: any): void {
  return useRecognizer(ScrollGesture, refs, onScroll);
}
