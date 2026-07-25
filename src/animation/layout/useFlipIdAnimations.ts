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

/**
 * Shared-element transitions via `flipId`. On each layout flush the
 * element claims its id in the global registry; a newly mounted claimant
 * FLIPs from the previous owner's last rect. Also recovers StrictMode
 * stranded displacements (mount → cleanup cancels spring → remount).
 */
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
  // Captures which (flipId, node) pair this instance last claimed, read
  // back on unmount — by then nodeRef.current/propsRef.current may already
  // be cleared/stale, so the claim must be captured while still live.
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

    // If a FLIP was already in flight but its controllers were canceled
    // without anything resuming them (see readStrandedDisplacement — this
    // happens under React StrictMode's mount/cleanup/remount simulation),
    // resume it toward identity even though this element's own rect hasn't
    // changed since it last registered.
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

      // A sibling element mounting with the same flipId in this same
      // commit (the normal cross-component transition case) re-registers
      // synchronously before this runs, so it's safe to check back a tick
      // later: if nothing has re-claimed the id by then, this was the last
      // owner and the entry is genuinely abandoned — drop it so a much
      // later, unrelated remount (a different page/story, or Fast Refresh)
      // doesn't inherit a stale rect and produce a bogus transition.
      queueMicrotask(() => {
        const entry = registry.get(claim.flipId);
        if (entry && entry.node === claim.node) {
          registry.delete(claim.flipId);
        }
      });
    };
    // `registry` is stable for this component's lifetime (either the
    // module-level global Map, or a FlipGroup's own Map created once via
    // useRef) — safe to capture in this mount-only cleanup closure.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
