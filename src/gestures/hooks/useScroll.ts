import { RefObject } from 'react';
import { AnimateValue } from '../../animation';

import { type ScrollEvent, ScrollGesture } from '../controllers/ScrollGesture';
import { useRecognizer } from './useRecognizer';
import {
  useScrollProgress,
  type UseScrollProgressOptions,
} from '../../hooks/observers/useScrollProgress';

export function useScroll<T extends HTMLElement>(
  refs: Window | RefObject<T> | RefObject<T>[],
  onScroll: (e: ScrollEvent & { index: number }) => void
): void;

export function useScroll<T extends HTMLElement>(
  refs: Window | RefObject<T> | RefObject<T>[],
  options?: UseScrollProgressOptions
): {
  scrollYProgress: AnimateValue<number>;
  scrollXProgress: AnimateValue<number>;
};

export function useScroll(
  refs: any,
  arg: any
): void | {
  scrollYProgress: AnimateValue<number>;
  scrollXProgress: AnimateValue<number>;
} {
  if (typeof arg === 'function') {
    return useRecognizer(ScrollGesture, refs, arg);
  }

  return useScrollProgress(refs, arg);
}
