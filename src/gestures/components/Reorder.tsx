import {
  createContext,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { animate, useValue, withSpring } from '../../animation';
import { measureUntransformedRect, type MeasuredRect } from '../../animation/layout/flip';
import { clamp, move } from '../../shared/utils';
import { Gesture } from '../api/Gesture';
import { useGesture } from '../hooks/useGesture';

interface ReorderContextValue<T = unknown> {
  values: T[];
  onReorder: (values: T[]) => void;
  axis: 'x' | 'y';
  registerElement: (value: T, el: HTMLElement) => void;
  unregisterElement: (value: T) => void;
  getElement: (value: T) => HTMLElement | undefined;
}

const ReorderContext = createContext<ReorderContextValue | null>(null);

export interface ReorderGroupProps<T> {
  /** The list backing this group, in display order — owned by the caller. */
  values: T[];
  /** Called with the reordered array as items are dragged past each other. */
  onReorder: (values: T[]) => void;
  /** Axis items are stacked (and can be dragged) along. Default `'y'`. */
  axis?: 'x' | 'y';
  children?: ReactNode;
  style?: CSSProperties;
  className?: string;
}

/**
 * Drag-to-reorder list, in the vein of `Presence` for add/remove: wrap a
 * mapped list of `Reorder.Item`s in `Reorder.Group` and each item becomes
 * draggable along `axis`, swapping places with its neighbors as it crosses
 * them.
 *
 * Every item measures its own real position delta after each reorder
 * commits (the same First-Last-Invert measurement `layout` uses) rather
 * than predicting the shift ahead of time — the earlier version of this
 * guessed the shift synchronously inside the drag handler, before React had
 * actually applied the reorder, which is what caused visible jumps. The
 * currently-dragged item applies its own correction instantly, so it stays
 * glued to the pointer with no extra spring lag; displaced neighbors spring
 * out of the way.
 *
 * Assumes items are roughly uniform in size along `axis` for the swap
 * *threshold* (when a drag has gone far enough to trigger a swap) — visual
 * correctness doesn't depend on that assumption, only the feel of exactly
 * when a swap fires.
 */
export function ReorderGroup<T>({
  values,
  onReorder,
  axis = 'y',
  children,
  style,
  className,
}: ReorderGroupProps<T>) {
  // A plain mutable Map, not state — membership changes on every mount and
  // must be readable synchronously from a drag handler, not batched through
  // a re-render like `values` is.
  const elementsRef = useRef(new Map<T, HTMLElement>());

  const contextValue = useMemo<ReorderContextValue<T>>(
    () => ({
      values,
      onReorder,
      axis,
      registerElement: (value, el) => {
        elementsRef.current.set(value, el);
      },
      unregisterElement: (value) => {
        elementsRef.current.delete(value);
      },
      getElement: (value) => elementsRef.current.get(value),
    }),
    [values, onReorder, axis]
  );

  return (
    <ReorderContext.Provider value={contextValue as ReorderContextValue}>
      <div style={style} className={className}>
        {children}
      </div>
    </ReorderContext.Provider>
  );
}

export interface ReorderItemProps<T> {
  /** Identifies this item within the group's `values` array (compared by `===`). */
  value: T;
  children?: ReactNode;
  style?: CSSProperties;
  className?: string;
}

export function ReorderItem<T>({
  value,
  children,
  style,
  className,
}: ReorderItemProps<T>) {
  const ctx = useContext(ReorderContext) as ReorderContextValue<T> | null;
  if (!ctx) {
    throw new Error('Reorder.Item must be rendered inside a Reorder.Group');
  }
  const { values, onReorder, axis, registerElement, unregisterElement, getElement } = ctx;

  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useValue(0);

  const isDraggingRef = useRef(false);
  const lastMovementRef = useRef(0);
  const correctionRef = useRef(0);
  const originIndexRef = useRef(0);
  const lastIndexRef = useRef(0);
  const sizeRef = useRef(0);

  const prevRectRef = useRef<MeasuredRect | null>(null);
  const hasMeasuredRef = useRef(false);

  useLayoutEffect(() => {
    if (ref.current) registerElement(value, ref.current);
    return () => unregisterElement(value);
  }, [value, registerElement, unregisterElement]);

  const edge = (el: HTMLElement) => {
    const rect = el.getBoundingClientRect();
    return axis === 'y' ? rect.top : rect.left;
  };

  // Distance to the next registered neighbor (falling back to the previous
  // one, or this item's own size if it's the only item) — the real slot
  // pitch, `gap`/margin included, instead of just this item's own box. Only
  // used to decide *when* a drag has gone far enough to trigger a swap.
  const measurePitch = () => {
    if (!ref.current) return 0;
    const rect = ref.current.getBoundingClientRect();
    const ownSize = axis === 'y' ? rect.height : rect.width;
    const index = values.indexOf(value);

    const neighborValue =
      index < values.length - 1 ? values[index + 1] : values[index - 1];
    const neighborEl = neighborValue !== undefined ? getElement(neighborValue) : undefined;
    if (!neighborEl) return ownSize;

    const pitch = Math.abs(edge(neighborEl) - edge(ref.current));
    return pitch || ownSize;
  };

  // Runs after every commit (mirrors how the `layout` prop's own FLIP effect
  // is triggered): measure this item's real, untransformed position and
  // diff it against the last measurement. A non-zero delta means a reorder
  // (this item's own, or a sibling's) just moved it in the DOM. Dragged
  // items absorb that instantly (folded into `offset` with no animation, so
  // the pointer-follow never stutters); everyone else springs back to
  // identity — the classic FLIP "invert, then animate to 0".
  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;

    const nextRect = measureUntransformedRect(node);
    const prevRect = prevRectRef.current;
    const shouldCompare = hasMeasuredRef.current;
    hasMeasuredRef.current = true;
    prevRectRef.current = nextRect;

    if (!shouldCompare || !prevRect) return;
    if (nextRect.width === 0 || nextRect.height === 0) return;

    const delta = axis === 'y' ? prevRect.top - nextRect.top : prevRect.left - nextRect.left;
    if (Math.abs(delta) < 0.5) return;

    if (isDraggingRef.current) {
      correctionRef.current += delta;
      setOffset(lastMovementRef.current + correctionRef.current);
    } else {
      setOffset(delta);
      setOffset(withSpring(0));
    }
  });

  useGesture(
    ref,
    Gesture.Pan()
      .axis(axis)
      .minDistance(4)
      .onStart(() => {
        isDraggingRef.current = true;
        lastMovementRef.current = 0;
        correctionRef.current = 0;
        originIndexRef.current = values.indexOf(value);
        lastIndexRef.current = originIndexRef.current;
        sizeRef.current = measurePitch();
      })
      .onUpdate((e) => {
        const movement = axis === 'y' ? e.movement.y : e.movement.x;
        lastMovementRef.current = movement;
        const size = sizeRef.current || 1;

        const proposedIndex = clamp(
          Math.round(originIndexRef.current + movement / size),
          0,
          values.length - 1
        );

        if (proposedIndex !== lastIndexRef.current) {
          const currentIndex = values.indexOf(value);
          if (currentIndex !== -1) {
            onReorder(move(values, currentIndex, proposedIndex));
          }
          lastIndexRef.current = proposedIndex;
        }

        setOffset(movement + correctionRef.current);
      })
      .onEnd(() => {
        isDraggingRef.current = false;
        setOffset(withSpring(0));
      })
  );

  return (
    <animate.div
      ref={ref}
      className={className}
      style={{
        cursor: 'grab',
        touchAction: axis === 'y' ? 'pan-x' : 'pan-y',
        ...style,
        ...(axis === 'y' ? { translateY: offset } : { translateX: offset }),
      }}
    >
      {children}
    </animate.div>
  );
}

export const Reorder = {
  Group: ReorderGroup,
  Item: ReorderItem,
};
