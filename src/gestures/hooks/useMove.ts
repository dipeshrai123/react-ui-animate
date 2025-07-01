import { RefObject } from 'react';

import { type MoveEvent, MoveGesture } from '../controllers/MoveGesture';
import { useRecognizer } from './useRecognizer';

export function useMove(
  refs: Window,
  onMove: (e: MoveEvent & { index: 0 }) => void
): void;

export function useMove<T extends HTMLElement>(
  refs: RefObject<T> | Array<RefObject<T>>,
  onMove: (e: MoveEvent & { index: number }) => void
): void;

export function useMove(refs: any, onMove: any): void {
  return useRecognizer(MoveGesture, refs, onMove);
}
