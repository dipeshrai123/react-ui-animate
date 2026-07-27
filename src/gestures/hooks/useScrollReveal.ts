import { RefObject } from 'react';
import { AnimateValue } from '../../animation';
import { useScrollProgress, type UseScrollProgressOptions } from './useScrollProgress';

export interface UseScrollRevealOptions
  extends Omit<UseScrollProgressOptions, 'target'> {
  /** Scrollable ancestor to listen on. Defaults to `window`. */
  container?: Window | RefObject<HTMLElement>;
}

export function useScrollReveal(
  ref: RefObject<HTMLElement>,
  {
    container = window,
    axis = 'y',
    offset = ['start end', 'end start'],
    animate = true,
    toDescriptor,
  }: UseScrollRevealOptions = {}
): { progress: AnimateValue<number> } {
  const { scrollYProgress, scrollXProgress } = useScrollProgress(container, {
    target: ref,
    axis,
    offset,
    animate,
    toDescriptor,
  });

  return { progress: axis === 'y' ? scrollYProgress : scrollXProgress };
}
