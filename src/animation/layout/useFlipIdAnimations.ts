import {
  useContext,
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
  FLIP_ID_KEYS,
  diffRects,
  measureUntransformedRect,
  readStrandedDisplacement,
  runFlipAnimation,
  type FlipController,
} from './flip';
import { flipIdRegistry as globalFlipIdRegistry } from './registry';
import { FlipGroupContext } from './FlipGroupContext';

export function useFlipIdAnimations(
  nodeRef: RefObject<HTMLElement | null>,
  propsRef: MutableRefObject<AnimateAttributes<HTMLElement>>,
  isExitingRef: MutableRefObject<boolean>,
  animateValuesRef: MutableRefObject<Record<string, AnimateValue<Primitive>>>
) {
  const registry = useContext(FlipGroupContext) ?? globalFlipIdRegistry;
  const initializedRef = useRef(false);
  const controllersRef = useRef<FlipController[]>([]);
  const unsubsRef = useRef<Array<() => void>>([]);
  // Captured while live since nodeRef/propsRef may be stale by unmount.
  const claimRef = useRef<{ flipId: string; node: HTMLElement } | null>(
    null
  );

  useLayoutEffect(() => {
    const node = nodeRef.current;
    const { flipId, flipOptions } = propsRef.current;

    if (!node || !flipId || isExitingRef.current) return;

    const nextRect = measureUntransformedRect(node);
    const prevEntry = registry.get(flipId);
    registry.set(flipId, { rect: nextRect, node });
    claimRef.current = { flipId, node };

    const stranded = readStrandedDisplacement(
      animateValuesRef.current,
      FLIP_ID_KEYS,
      controllersRef.current.length > 0
    );

    if (!prevEntry && !stranded) return;
    if (nextRect.width === 0 || nextRect.height === 0) return;

    const delta = prevEntry ? diffRects(prevEntry.rect, nextRect) : null;
    const flipDelta = delta ?? stranded;
    if (!flipDelta) return;

    runFlipAnimation(
      node,
      flipDelta,
      FLIP_ID_KEYS,
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
    return () => {
      controllersRef.current.forEach((ctrl) => ctrl.cancel());
      controllersRef.current = [];
      unsubsRef.current.forEach((unsub) => unsub());
      unsubsRef.current = [];

      const claim = claimRef.current;
      if (!claim) return;

      // Deferred so a same-commit sibling re-claiming this flipId (the normal transition
      // case) isn't treated as abandonment.
      queueMicrotask(() => {
        const entry = registry.get(claim.flipId);
        if (entry && entry.node === claim.node) {
          registry.delete(claim.flipId);
        }
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- registry is stable for this component's lifetime
  }, []);
}
