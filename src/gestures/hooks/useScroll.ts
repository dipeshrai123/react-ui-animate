import { RefObject } from 'react';
import { MotionValue } from '@raidipesh78/re-motion';

import { type ScrollEvent, ScrollGesture } from '../controllers/ScrollGesture';
import { useRecognizer } from './useRecognizer';
import {
  useScrollProgress,
  type UseScrollProgressOptions,
} from './useScrollProgress';

export function useScroll<T extends HTMLElement>(
  refs: Window | RefObject<T> | RefObject<T>[],
  onScroll: (e: ScrollEvent & { index: number }) => void
): void;

export function useScroll<T extends HTMLElement>(
  refs: Window | RefObject<T> | RefObject<T>[],
  options?: UseScrollProgressOptions
): {
  scrollYProgress: MotionValue<number>;
  scrollXProgress: MotionValue<number>;
};

export function useScroll(
  refs: any,
  arg: any
): void | {
  scrollYProgress: MotionValue<number>;
  scrollXProgress: MotionValue<number>;
} {
  if (typeof arg === 'function') {
    return useRecognizer(ScrollGesture, refs, arg);
  }

  return useScrollProgress(refs, arg);
}
