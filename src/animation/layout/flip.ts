import type { MutableRefObject } from 'react';

import { formatTransformString } from '../utils/apply';
import { AnimateValue } from '../values/AnimateValue';
import type { Descriptor, Primitive, SpringOptions } from '../types';
import { buildAnimation } from '../drivers/builder';
import type { AnimateAttributes } from '../components/types';
import { isDescriptor } from '../helpers';

// `layout` and `layoutId` each use their own namespace (see apply.ts) so
// they can coexist on the same element without one overwriting the other.
export type FlipKeys = {
  tx: string;
  ty: string;
  sx: string;
  sy: string;
};

export type FlipDelta = {
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
};

export const LAYOUT_FLIP_KEYS: FlipKeys = {
  tx: '__layoutTranslateX',
  ty: '__layoutTranslateY',
  sx: '__layoutScaleX',
  sy: '__layoutScaleY',
};

export const LAYOUT_ID_FLIP_KEYS: FlipKeys = {
  tx: '__layoutIdTranslateX',
  ty: '__layoutIdTranslateY',
  sx: '__layoutIdScaleX',
  sy: '__layoutIdScaleY',
};

export type FlipController = { cancel(): void };

export type FlipAnimationRefs = {
  animateValuesRef: MutableRefObject<Record<string, AnimateValue<Primitive>>>;
  propsRef: MutableRefObject<AnimateAttributes<HTMLElement>>;
  controllersRef: MutableRefObject<FlipController[]>;
  unsubsRef: MutableRefObject<Array<() => void>>;
  initializedRef: MutableRefObject<boolean>;
};

/**
 * Transition config for `layout` / `layoutId`. Prefer the same descriptor
 * helpers used everywhere else in the library — options-only form, since
 * FLIP always settles at identity and there is no target value to declare:
 *
 *   layoutOptions={withSpring({ stiffness: 400, damping: 32 })}
 *   layoutOptions={withTiming({ duration: 300 })}
 *
 * Raw `SpringOptions` remain supported for backwards compatibility and are
 * treated as an implicit spring.
 */
export type LayoutOptions = Descriptor | SpringOptions;

const DEFAULT_LAYOUT_SPRING: SpringOptions = {
  stiffness: 500,
  damping: 40,
  mass: 1,
};

// Only spring/timing make sense for a FLIP settle-to-identity; anything else
// falls back to the default layout spring.
export function resolveLayoutTransition(
  layoutOptions: LayoutOptions | undefined
): Descriptor {
  if (!layoutOptions) {
    return { type: 'spring', to: 0, options: { ...DEFAULT_LAYOUT_SPRING } };
  }

  if (isDescriptor(layoutOptions)) {
    if (layoutOptions.type === 'spring' || layoutOptions.type === 'timing') {
      return {
        type: layoutOptions.type,
        to: 0,
        options: { ...layoutOptions.options },
      };
    }

    return { type: 'spring', to: 0, options: { ...DEFAULT_LAYOUT_SPRING } };
  }

  return {
    type: 'spring',
    to: 0,
    options: { ...DEFAULT_LAYOUT_SPRING, ...layoutOptions },
  };
}

// Shared FLIP (First, Last, Invert, Play) animation used by both the
// `layout` prop (diffing an element's own rect across renders) and the
// `layoutId` prop (diffing against a rect recorded by a different element).
// Jumps to the inverted delta instantly, then animates back to identity
// via the same `withSpring` / `withTiming` drivers used elsewhere.
export function runFlipAnimation(
  node: HTMLElement,
  delta: FlipDelta,
  keys: FlipKeys,
  refs: FlipAnimationRefs,
  layoutOptions: LayoutOptions | undefined
) {
  const {
    animateValuesRef,
    propsRef,
    controllersRef,
    unsubsRef,
    initializedRef,
  } = refs;
  const animateValues = animateValuesRef.current;

  if (!initializedRef.current) {
    animateValues[keys.tx] = new AnimateValue(0);
    animateValues[keys.ty] = new AnimateValue(0);
    animateValues[keys.sx] = new AnimateValue(1);
    animateValues[keys.sy] = new AnimateValue(1);
    initializedRef.current = true;
  }

  controllersRef.current.forEach((ctrl) => ctrl.cancel());
  controllersRef.current = [];
  unsubsRef.current.forEach((unsub) => unsub());
  unsubsRef.current = [];

  const tx = animateValues[keys.tx];
  const ty = animateValues[keys.ty];
  const sx = animateValues[keys.sx];
  const sy = animateValues[keys.sy];

  tx.set(delta.x);
  ty.set(delta.y);
  sx.set(delta.scaleX);
  sy.set(delta.scaleY);

  node.style.transformOrigin = 'top left';

  // Compose with whatever else is contributing to this element's transform
  // (static `style` values, and any `animate`/`hover`/`press`/`view`-driven
  // AnimateValues already sitting in animateValuesRef) rather than replacing it.
  const render = () => {
    const { style } = propsRef.current;
    node.style.transform = formatTransformString({
      ...style,
      ...animateValuesRef.current,
    });
  };
  render();

  unsubsRef.current = [
    tx.subscribe(render),
    ty.subscribe(render),
    sx.subscribe(render),
    sy.subscribe(render),
  ];

  const transition = resolveLayoutTransition(layoutOptions);

  // Translate channels settle at 0; scale channels settle at 1. Descriptor
  // `to` (when present) is ignored so options-only forms like
  // `withTiming({ duration: 300 })` work as layout transitions.
  const controllers = [
    buildAnimation(tx, { ...transition, to: 0 }),
    buildAnimation(ty, { ...transition, to: 0 }),
    buildAnimation(sx, { ...transition, to: 1 }),
    buildAnimation(sy, { ...transition, to: 1 }),
  ];
  controllersRef.current = controllers;
  controllers.forEach((ctrl) => ctrl.start());
}

// Just the fields FLIP actually diffs — plain object rather than a real
// DOMRect so `measureUntransformedRect` can report document-relative
// coordinates (see below) without fighting DOMRect's read-only, viewport-
// relative fields.
export type MeasuredRect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

// Measures `node`'s untransformed layout box. getBoundingClientRect()
// reflects whatever CSS transform is currently applied (ours or the
// consumer's own), which would corrupt the measurement — e.g. while a
// previous layout animation is still in flight (rapid re-triggers), or if a
// static/animated transform is set via `style`/`animate`. Briefly
// neutralizing the transform happens entirely within useLayoutEffect, before
// the browser paints, so it's never visible.
//
// getBoundingClientRect() is viewport-relative, so `left`/`top` shift by
// however much the page has scrolled between two measurements even when the
// element hasn't actually moved in the document. Comparing two such rects
// straight (the previous FLIP behavior) bakes that scroll delta into the
// animation — e.g. scroll down, re-trigger a `layout`/`layoutId` change, and
// the element FLIPs in from the wrong place (or animates when it shouldn't).
// Adding the current scroll offset converts to document-relative
// coordinates, which are scroll-invariant, so `diffRects` only ever sees the
// element's real layout change.
export function measureUntransformedRect(node: HTMLElement): MeasuredRect {
  const previousTransform = node.style.transform;
  node.style.transform = 'none';
  const rect = node.getBoundingClientRect();
  node.style.transform = previousTransform;
  return {
    left: rect.left + window.scrollX,
    top: rect.top + window.scrollY,
    width: rect.width,
    height: rect.height,
  };
}

// True if this element's FLIP pseudo-transform is currently displaced away
// from identity (0 translate / 1 scale) with no controller actively driving
// it back — i.e. a previously started FLIP was interrupted (its controllers
// canceled) without a replacement being started. Used to recover from React
// StrictMode double-invoking a `layoutId` element's mount effects: the
// simulated "unmount" cancels the just-started spring, and without this
// check the simulated "remount" would see no rect delta (it's comparing
// against the rect it just registered for itself) and never resume it,
// leaving the transform stuck at its initial inverted value.
export function readStrandedDisplacement(
  animateValues: Record<string, AnimateValue<Primitive>>,
  keys: FlipKeys,
  isAnimating: boolean
): FlipDelta | null {
  if (isAnimating) return null;

  const tx = animateValues[keys.tx];
  if (!tx) return null;

  const x = Number(tx.current) || 0;
  const y = Number(animateValues[keys.ty]?.current) || 0;
  const scaleX = Number(animateValues[keys.sx]?.current ?? 1);
  const scaleY = Number(animateValues[keys.sy]?.current ?? 1);

  const isDisplaced =
    Math.abs(x) > 0.5 ||
    Math.abs(y) > 0.5 ||
    Math.abs(scaleX - 1) > 0.01 ||
    Math.abs(scaleY - 1) > 0.01;

  return isDisplaced ? { x, y, scaleX, scaleY } : null;
}

export function diffRects(
  prevRect: MeasuredRect,
  nextRect: MeasuredRect
): FlipDelta | null {
  const deltaX = prevRect.left - nextRect.left;
  const deltaY = prevRect.top - nextRect.top;
  const scaleX = prevRect.width / nextRect.width;
  const scaleY = prevRect.height / nextRect.height;

  const hasMoved = Math.abs(deltaX) > 0.5 || Math.abs(deltaY) > 0.5;
  const hasResized =
    Math.abs(scaleX - 1) > 0.01 || Math.abs(scaleY - 1) > 0.01;

  if (!hasMoved && !hasResized) return null;

  return { x: deltaX, y: deltaY, scaleX, scaleY };
}
