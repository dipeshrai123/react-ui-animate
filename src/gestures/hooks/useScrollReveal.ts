import { RefObject } from 'react';
import { AnimateValue } from '../../animation';
import { useScrollProgress, type UseScrollProgressOptions } from './useScrollProgress';

export interface UseScrollRevealOptions
  extends Omit<UseScrollProgressOptions, 'target'> {
  /** Scrollable ancestor to listen on. Defaults to `window`. */
  container?: Window | RefObject<HTMLElement>;
}

/**
 * Per-element counterpart to `useScrollProgress`: tracks how far `ref`
 * itself has scrolled through the viewport (or `container`), defaulting to
 * the common "reveal as it crosses the viewport" range — 0 when its top
 * edge reaches the container's far edge, 1 once its trailing edge has fully
 * passed the container's near edge — instead of requiring a separately
 * declared target/offset pair for every tracked element.
 */
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
