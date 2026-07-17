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
  LAYOUT_ID_FLIP_KEYS,
  diffRects,
  measureUntransformedRect,
  readStrandedDisplacement,
  runFlipAnimation,
  type FlipController,
} from './flip';
import { layoutIdRegistry as globalLayoutIdRegistry } from './registry';
import { LayoutGroupContext } from './LayoutGroupContext';

/**
 * Shared-element transitions via `layoutId`. On each layout flush the
 * element claims its id in the global registry; a newly mounted claimant
 * FLIPs from the previous owner's last rect. Also recovers StrictMode
 * stranded displacements (mount → cleanup cancels spring → remount).
 */
export function useLayoutIdAnimations(
  nodeRef: RefObject<HTMLElement | null>,
  propsRef: MutableRefObject<AnimateAttributes<HTMLElement>>,
  isExitingRef: MutableRefObject<boolean>,
  animateValuesRef: MutableRefObject<Record<string, AnimateValue<Primitive>>>
) {
  const registry = useContext(LayoutGroupContext) ?? globalLayoutIdRegistry;
  const initializedRef = useRef(false);
  const controllersRef = useRef<FlipController[]>([]);
  const unsubsRef = useRef<Array<() => void>>([]);
  // Captures which (layoutId, node) pair this instance last claimed, read
  // back on unmount — by then nodeRef.current/propsRef.current may already
  // be cleared/stale, so the claim must be captured while still live.
  const claimRef = useRef<{ layoutId: string; node: HTMLElement } | null>(
    null
  );

  useLayoutEffect(() => {
    const node = nodeRef.current;
    const { layoutId, layoutOptions } = propsRef.current;

    if (!node || !layoutId || isExitingRef.current) return;

    const nextRect = measureUntransformedRect(node);
    const prevEntry = registry.get(layoutId);
    registry.set(layoutId, { rect: nextRect, node });
    claimRef.current = { layoutId, node };

    // If a FLIP was already in flight but its controllers were canceled
    // without anything resuming them (see readStrandedDisplacement — this
    // happens under React StrictMode's mount/cleanup/remount simulation),
    // resume it toward identity even though this element's own rect hasn't
    // changed since it last registered.
    const stranded = readStrandedDisplacement(
      animateValuesRef.current,
      LAYOUT_ID_FLIP_KEYS,
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
      LAYOUT_ID_FLIP_KEYS,
      {
        animateValuesRef,
        propsRef,
        controllersRef,
        unsubsRef,
        initializedRef,
      },
      layoutOptions
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

      // A sibling element mounting with the same layoutId in this same
      // commit (the normal cross-component transition case) re-registers
      // synchronously before this runs, so it's safe to check back a tick
      // later: if nothing has re-claimed the id by then, this was the last
      // owner and the entry is genuinely abandoned — drop it so a much
      // later, unrelated remount (a different page/story, or Fast Refresh)
      // doesn't inherit a stale rect and produce a bogus transition.
      queueMicrotask(() => {
        const entry = registry.get(claim.layoutId);
        if (entry && entry.node === claim.node) {
          registry.delete(claim.layoutId);
        }
      });
    };
    // `registry` is stable for this component's lifetime (either the
    // module-level global Map, or a LayoutGroup's own Map created once via
    // useRef) — safe to capture in this mount-only cleanup closure.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
