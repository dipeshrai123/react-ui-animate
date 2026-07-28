import type { MutableRefObject } from 'react';

import { formatTransformString } from '../utils/apply';
import { AnimateValue } from '../values/AnimateValue';
import type { Descriptor, Primitive, SpringOptions } from '../types';
import { buildAnimation } from '../drivers/builder';
import type { AnimateAttributes } from '../components/types';
import { isDescriptor } from '../helpers';

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

export const FLIP_KEYS: FlipKeys = {
  tx: '__flipTranslateX',
  ty: '__flipTranslateY',
  sx: '__flipScaleX',
  sy: '__flipScaleY',
};

export const FLIP_ID_KEYS: FlipKeys = {
  tx: '__flipIdTranslateX',
  ty: '__flipIdTranslateY',
  sx: '__flipIdScaleX',
  sy: '__flipIdScaleY',
};

export type FlipController = { cancel(): void };

export type FlipAnimationRefs = {
  animateValuesRef: MutableRefObject<Record<string, AnimateValue<Primitive>>>;
  propsRef: MutableRefObject<AnimateAttributes<HTMLElement>>;
  controllersRef: MutableRefObject<FlipController[]>;
  unsubsRef: MutableRefObject<Array<() => void>>;
  initializedRef: MutableRefObject<boolean>;
};

export type FlipOptions = Descriptor | SpringOptions;

const DEFAULT_FLIP_SPRING: SpringOptions = {
  stiffness: 500,
  damping: 50,
  mass: 1,
};

export function resolveFlipTransition(
  flipOptions: FlipOptions | undefined
): Descriptor {
  if (!flipOptions) {
    return { type: 'spring', to: 0, options: { ...DEFAULT_FLIP_SPRING } };
  }

  if (isDescriptor(flipOptions)) {
    if (flipOptions.type === 'spring' || flipOptions.type === 'timing') {
      return {
        type: flipOptions.type,
        to: 0,
        options: { ...flipOptions.options },
      };
    }

    return { type: 'spring', to: 0, options: { ...DEFAULT_FLIP_SPRING } };
  }

  return {
    type: 'spring',
    to: 0,
    options: { ...DEFAULT_FLIP_SPRING, ...flipOptions },
  };
}

export function runFlipAnimation(
  node: HTMLElement,
  delta: FlipDelta,
  keys: FlipKeys,
  refs: FlipAnimationRefs,
  flipOptions: FlipOptions | undefined
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
    animateValues[keys.tx] = new AnimateValue<Primitive>(0);
    animateValues[keys.ty] = new AnimateValue<Primitive>(0);
    animateValues[keys.sx] = new AnimateValue<Primitive>(1);
    animateValues[keys.sy] = new AnimateValue<Primitive>(1);
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

  const transition = resolveFlipTransition(flipOptions);

  const controllers = [
    buildAnimation(tx, { ...transition, to: 0 }),
    buildAnimation(ty, { ...transition, to: 0 }),
    buildAnimation(sx, { ...transition, to: 1 }),
    buildAnimation(sy, { ...transition, to: 1 }),
  ];
  controllersRef.current = controllers;
  controllers.forEach((ctrl) => ctrl.start());
}

export type MeasuredRect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

// Neutralize transform before measuring (getBoundingClientRect reflects it) and add
// scroll offset for document-relative coords — omitting either reintroduces the FLIP
// mismeasure-on-scroll/rapid-retrigger bug.
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

// Detects an interrupted FLIP left off-identity with no controller driving it back;
// needed to recover from StrictMode's double-invoked mount effects, or the transform
// sticks at its inverted value.
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
