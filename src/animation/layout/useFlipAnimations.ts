import {
  useEffect,
  useLayoutEffect,
  useRef,
  type MutableRefObject,
  type RefObject,
} from 'react';

import { AnimateValue } from '../values/AnimateValue';
import type { Primitive } from '../types';
import type { AnimateAttributes } from '../components/types';
import {
  FLIP_KEYS,
  diffRects,
  measureUntransformedRect,
  runFlipAnimation,
  type FlipController,
  type MeasuredRect,
} from './flip';

/**
 * Animates an element's own layout changes across renders (`flip` prop).
 * Measures the untransformed rect each commit; when it differs from the
 * previous measurement, runs a FLIP spring back to identity.
 */
export function useFlipAnimations(
  nodeRef: RefObject<HTMLElement | null>,
  propsRef: MutableRefObject<AnimateAttributes<HTMLElement>>,
  isExitingRef: MutableRefObject<boolean>,
  animateValuesRef: MutableRefObject<Record<string, AnimateValue<Primitive>>>
) {
  const prevRectRef = useRef<MeasuredRect | null>(null);
  const hasMeasuredRef = useRef(false);
  const initializedRef = useRef(false);
  const controllersRef = useRef<FlipController[]>([]);
  const unsubsRef = useRef<Array<() => void>>([]);

  useLayoutEffect(() => {
    const node = nodeRef.current;
    const { flip, flipOptions } = propsRef.current;

    if (!node || !flip || isExitingRef.current) {
      hasMeasuredRef.current = false;
      prevRectRef.current = null;
      return;
    }

    const nextRect = measureUntransformedRect(node);

    const prevRect = prevRectRef.current;
    const shouldCompare = hasMeasuredRef.current;
    hasMeasuredRef.current = true;
    prevRectRef.current = nextRect;

    // Skip the first measurement (mount) and degenerate (hidden) rects
    if (!shouldCompare || !prevRect) return;
    if (nextRect.width === 0 || nextRect.height === 0) return;

    const delta = diffRects(prevRect, nextRect);
    if (!delta) return;

    runFlipAnimation(
      node,
      delta,
      FLIP_KEYS,
      {
        animateValuesRef,
        propsRef,
        controllersRef,
        unsubsRef,
        initializedRef,
      },
      flipOptions
    );
  });

  useEffect(() => {
    // Intentionally read `.current` at cleanup time (true unmount, since
    // deps is []): controllers/unsubs accumulate after mount, so capturing
    // them at effect-setup time would miss everything added later.
    /* eslint-disable react-hooks/exhaustive-deps */
    return () => {
      controllersRef.current.forEach((ctrl) => ctrl.cancel());
      unsubsRef.current.forEach((unsub) => unsub());
    };
    /* eslint-enable react-hooks/exhaustive-deps */
  }, []);
}
