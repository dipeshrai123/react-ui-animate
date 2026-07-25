import {
  createContext,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from 'react';
import { animate, LayoutGroup, useValue } from '../../animation';
import {
  measureUntransformedRect,
  resolveLayoutTransition,
  type LayoutOptions,
  type MeasuredRect,
} from '../../animation/layout/flip';
import { clamp, move } from '../../shared/utils';
import { Gesture } from '../api/Gesture';
import { useGesture } from '../hooks/useGesture';

interface ReorderContextValue<T = unknown> {
  values: T[];
  onReorder: (values: T[]) => void;
  axis: 'x' | 'y';
  transition: LayoutOptions | undefined;
  groupKey: object;
  registerElement: (value: T, el: HTMLElement) => void;
  unregisterElement: (value: T) => void;
  getElement: (value: T) => HTMLElement | undefined;
}

const ReorderContext = createContext<ReorderContextValue | null>(null);

interface ReorderItemContextValue {
  registerHandle: (el: HTMLElement | null) => void;
}

const ReorderItemContext = createContext<ReorderItemContextValue | null>(null);

// --- Cross-group ("multiple lists") drag-and-drop -------------------------
//
// A group registers itself here (keyed by an opaque per-instance object, not
// a string id — sidesteps needing `useId()`, which isn't available on the
// React 16/17 versions this package still supports) with everything a drag
// in a *different* group needs to hand an item over: its live `values` /
// `onReorder`, its axis, a way to look up a member's element, and its own
// container bounds (to hit-test "is the pointer over this group at all").

interface DndGroupEntry {
  values: unknown[];
  onReorder: (values: unknown[]) => void;
  axis: 'x' | 'y';
  getElement: (value: unknown) => HTMLElement | undefined;
  containerRef: RefObject<HTMLElement>;
}

interface ReorderDndContextValue {
  registerGroup: (key: object, entry: DndGroupEntry) => void;
  unregisterGroup: (key: object) => void;
  getGroup: (key: object) => DndGroupEntry | undefined;
  /** Which registered group's container bounds contain `point`, if any. */
  findGroupAt: (point: { x: number; y: number }) => object | undefined;
  setHoveredGroupKey: (key: object | null) => void;
  hoveredGroupKeyRef: RefObject<object | null>;
}

const ReorderDndContext = createContext<ReorderDndContextValue | null>(null);

// Separate from `ReorderDndContext` on purpose: this one's value changes
// (on every group boundary crossed) and is read reactively by `Group` for
// its `data-reorder-drop-active` hook, whereas `ReorderDndContext`'s value
// is a stable set of functions read imperatively from drag handlers. Only
// `Group`s subscribe to this one, so a hover change re-renders the (few)
// groups, not every item in every list.
const ReorderHoveredGroupContext = createContext<object | null>(null);

export interface ReorderContextProps {
  children?: ReactNode;
}

/**
 * Wrap two or more `Reorder.Group`s in this to let items be dragged *out of
 * one list and into another* — a Kanban board's columns, for example —
 * instead of being confined to the list they started in. Groups nested
 * without a `Reorder.Context` ancestor are unaffected and behave exactly as
 * a standalone `Reorder.Group` always has.
 *
 * A cross-group drop is only committed once (on release, after hit-testing
 * which group's bounds the pointer ended up over) — the item's own
 * component instance is torn down in the source list and a fresh one mounts
 * in the target list, so there's no attempt to keep a single component
 * instance alive across that boundary. `Reorder.Item` gives both instances
 * the same `layoutId` (`String(value)`), so the new one FLIPs in from the
 * old one's last position instead of just popping into place — wrapped in
 * its own `LayoutGroup` so it doesn't collide with unrelated `layoutId`s
 * elsewhere on the page.
 */
export function ReorderContextProvider({ children }: ReorderContextProps) {
  const groupsRef = useRef(new Map<object, DndGroupEntry>());
  const hoveredGroupKeyRef = useRef<object | null>(null);
  const [hoveredGroupKey, setHoveredGroupKeyState] = useState<object | null>(null);

  const dndContextValue = useMemo<ReorderDndContextValue>(
    () => ({
      registerGroup: (key, entry) => {
        groupsRef.current.set(key, entry);
      },
      unregisterGroup: (key) => {
        groupsRef.current.delete(key);
      },
      getGroup: (key) => groupsRef.current.get(key),
      findGroupAt: (point) => {
        for (const [key, entry] of groupsRef.current) {
          const el = entry.containerRef.current;
          if (!el) continue;
          const rect = el.getBoundingClientRect();
          if (
            point.x >= rect.left &&
            point.x <= rect.right &&
            point.y >= rect.top &&
            point.y <= rect.bottom
          ) {
            return key;
          }
        }
        return undefined;
      },
      setHoveredGroupKey: (key) => {
        if (hoveredGroupKeyRef.current === key) return;
        hoveredGroupKeyRef.current = key;
        setHoveredGroupKeyState(key);
      },
      hoveredGroupKeyRef,
    }),
    []
  );

  return (
    <ReorderDndContext.Provider value={dndContextValue}>
      <ReorderHoveredGroupContext.Provider value={hoveredGroupKey}>
        <LayoutGroup>{children}</LayoutGroup>
      </ReorderHoveredGroupContext.Provider>
    </ReorderDndContext.Provider>
  );
}

function insertAt<T>(array: T[], index: number, item: T): T[] {
  const next = array.slice();
  next.splice(clamp(index, 0, next.length), 0, item);
  return next;
}

export interface ReorderGroupProps<T> {
  /** The list backing this group, in display order — owned by the caller. */
  values: T[];
  /** Called with the reordered array as items are dragged past each other. */
  onReorder: (values: T[]) => void;
  /** Axis items are stacked (and can be dragged) along. Default `'y'`. */
  axis?: 'x' | 'y';
  /**
   * Transition used for both the "displaced neighbor springs into its new
   * slot" animation and the "released item settles into place" animation.
   * Same descriptor helpers as `animate`/`layoutOptions` elsewhere:
   *
   *   transition={withSpring({ stiffness: 500, damping: 30 })}
   *   transition={withTiming({ duration: 200 })}
   *
   * Raw `SpringOptions` are also accepted. Defaults to a snappy spring
   * (`{ stiffness: 500, damping: 40 }`) if omitted.
   */
  transition?: LayoutOptions;
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
 *
 * Nest inside `Reorder.Context` to allow items to be dragged into a
 * *different* `Reorder.Group`; standalone, it behaves as a single
 * self-contained list.
 */
export function ReorderGroup<T>({
  values,
  onReorder,
  axis = 'y',
  transition,
  children,
  style,
  className,
}: ReorderGroupProps<T>) {
  // A plain mutable Map, not state — membership changes on every mount and
  // must be readable synchronously from a drag handler, not batched through
  // a re-render like `values` is.
  const elementsRef = useRef(new Map<T, HTMLElement>());
  const containerRef = useRef<HTMLDivElement>(null);
  const groupKey = useRef({}).current;

  const dndCtx = useContext(ReorderDndContext);
  const hoveredGroupKey = useContext(ReorderHoveredGroupContext);

  const getElement = (value: T) => elementsRef.current.get(value);

  useLayoutEffect(() => {
    if (!dndCtx) return;
    dndCtx.registerGroup(groupKey, {
      values: values as unknown[],
      onReorder: onReorder as (values: unknown[]) => void,
      axis,
      getElement: getElement as (value: unknown) => HTMLElement | undefined,
      containerRef,
    });
    return () => dndCtx.unregisterGroup(groupKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dndCtx, values, onReorder, axis]);

  const contextValue = useMemo<ReorderContextValue<T>>(
    () => ({
      values,
      onReorder,
      axis,
      transition,
      groupKey,
      registerElement: (value, el) => {
        elementsRef.current.set(value, el);
      },
      unregisterElement: (value) => {
        elementsRef.current.delete(value);
      },
      getElement,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [values, onReorder, axis, transition]
  );

  return (
    <ReorderContext.Provider value={contextValue as ReorderContextValue}>
      <div
        ref={containerRef}
        style={style}
        className={className}
        data-reorder-drop-active={
          dndCtx && hoveredGroupKey === groupKey ? 'true' : undefined
        }
      >
        {children}
      </div>
    </ReorderContext.Provider>
  );
}

export interface ReorderItemProps<T> {
  /** Identifies this item within the group's `values` array (compared by `===`). */
  value: T;
  /**
   * Stable identity used for the cross-group FLIP continuity (see
   * `Reorder.Context`) — required when `value` isn't already a good FLIP
   * key itself (an object rather than a string/number id), since the
   * default falls back to `String(value)`, which collapses every
   * object-valued item to the same `"[object Object]"` key. Unused outside
   * `Reorder.Context`.
   */
  id?: string | number;
  children?: ReactNode;
  style?: CSSProperties;
  className?: string;
}

export function ReorderItem<T>({
  value,
  id,
  children,
  style,
  className,
}: ReorderItemProps<T>) {
  const ctx = useContext(ReorderContext) as ReorderContextValue<T> | null;
  if (!ctx) {
    throw new Error('Reorder.Item must be rendered inside a Reorder.Group');
  }
  const {
    values,
    onReorder,
    axis,
    transition,
    groupKey,
    registerElement,
    unregisterElement,
    getElement,
  } = ctx;
  const dndCtx = useContext(ReorderDndContext);

  const ref = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLElement | null>(null);
  const [offset, setOffset] = useValue(0);
  const [crossOffset, setCrossOffset] = useValue(0);

  // Whichever the drag should actually start from: the registered
  // `Reorder.Handle`, if any, otherwise the item itself. Resolved lazily via
  // a getter (rather than swapped by a re-render) so a handle mounting
  // *after* the item's own first render — the normal case, since it's a
  // child — is picked up without needing an extra render pass.
  const gestureTargetRef = useMemo<RefObject<HTMLDivElement>>(
    () => ({
      get current() {
        return (handleRef.current as HTMLDivElement | null) ?? ref.current;
      },
    }),
    []
  );

  const itemContextValue = useMemo<ReorderItemContextValue>(
    () => ({
      registerHandle: (el) => {
        handleRef.current = el;
      },
    }),
    []
  );

  // Mirrors `isDraggingRef` (below) into render — a ref alone can't drive
  // the z-index bump that keeps the dragged item above its neighbors while
  // it's sliding over them.
  const [isDragging, setIsDragging] = useState(false);

  const isDraggingRef = useRef(false);
  const lastMovementRef = useRef(0);
  const correctionRef = useRef(0);
  const originIndexRef = useRef(0);
  const lastIndexRef = useRef(0);
  const sizeRef = useRef(0);
  const dragStartRectRef = useRef<{ top: number; left: number; width: number; height: number }>({
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  });

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
      setOffset(resolveLayoutTransition(transition));
    }
  });

  let gesture = Gesture.Pan().minDistance(4);
  // Cross-group hit-testing needs real movement on *both* axes — an
  // axis-locked gesture hard-zeroes the other axis's movement at the
  // recognizer level, which would make it impossible to ever detect the
  // pointer entering a group laid out to the side. Standalone groups (no
  // `Reorder.Context` ancestor) keep the lock, unchanged from before.
  if (!dndCtx) gesture = gesture.axis(axis);

  useGesture(
    gestureTargetRef,
    gesture
      .onStart(() => {
        isDraggingRef.current = true;
        setIsDragging(true);
        lastMovementRef.current = 0;
        correctionRef.current = 0;
        originIndexRef.current = values.indexOf(value);
        lastIndexRef.current = originIndexRef.current;
        sizeRef.current = measurePitch();
        if (ref.current) {
          const rect = ref.current.getBoundingClientRect();
          dragStartRectRef.current = {
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
          };
        }
        dndCtx?.setHoveredGroupKey(groupKey);
      })
      .onUpdate((e) => {
        const movement = axis === 'y' ? e.movement.y : e.movement.x;
        const cross = axis === 'y' ? e.movement.x : e.movement.y;
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
        setCrossOffset(cross);

        if (dndCtx) {
          const start = dragStartRectRef.current;
          const point = {
            x: start.left + start.width / 2 + e.movement.x,
            y: start.top + start.height / 2 + e.movement.y,
          };
          dndCtx.setHoveredGroupKey(dndCtx.findGroupAt(point) ?? null);
        }
      })
      .onEnd((e) => {
        isDraggingRef.current = false;
        setIsDragging(false);

        const targetKey = dndCtx?.hoveredGroupKeyRef.current ?? null;

        if (dndCtx && targetKey && targetKey !== groupKey) {
          const targetEntry = dndCtx.getGroup(targetKey);
          const sourceEntry = dndCtx.getGroup(groupKey);

          if (targetEntry && sourceEntry) {
            const start = dragStartRectRef.current;
            const point = {
              x: start.left + start.width / 2 + e.movement.x,
              y: start.top + start.height / 2 + e.movement.y,
            };
            const dropCoord = targetEntry.axis === 'y' ? point.y : point.x;

            const targetIndex = targetEntry.values.reduce<number>((count, v) => {
              const el = targetEntry.getElement(v);
              if (!el) return count;
              const rect = el.getBoundingClientRect();
              const center =
                targetEntry.axis === 'y' ? rect.top + rect.height / 2 : rect.left + rect.width / 2;
              return center < dropCoord ? count + 1 : count;
            }, 0);

            sourceEntry.onReorder(sourceEntry.values.filter((v) => v !== value));
            targetEntry.onReorder(insertAt(targetEntry.values, targetIndex, value));
          }
        } else {
          setOffset(resolveLayoutTransition(transition));
        }

        setCrossOffset(resolveLayoutTransition(transition));
        dndCtx?.setHoveredGroupKey(null);
      })
  );

  return (
    <animate.div
      ref={ref}
      layoutId={dndCtx ? `reorder-${id ?? String(value)}` : undefined}
      className={className}
      style={{
        position: 'relative',
        cursor: 'grab',
        touchAction: axis === 'y' ? 'pan-x' : 'pan-y',
        // Native text selection tracks the pointer across whatever elements
        // it passes over — including neighbors the dragged item slides on
        // top of — so this needs to hold for the whole item, not just the
        // handle that started the gesture.
        userSelect: 'none',
        WebkitUserSelect: 'none',
        ...style,
        // The item currently being dragged renders over its neighbors
        // (rather than wherever DOM order/`translate` would otherwise stack
        // it) so it doesn't visually disappear underneath the ones it's
        // sliding past.
        zIndex: isDragging ? 1 : style?.zIndex,
        ...(axis === 'y'
          ? { translateY: offset, translateX: crossOffset }
          : { translateX: offset, translateY: crossOffset }),
      }}
    >
      <ReorderItemContext.Provider value={itemContextValue}>
        {children}
      </ReorderItemContext.Provider>
    </animate.div>
  );
}

export interface ReorderHandleProps {
  children?: ReactNode;
  style?: CSSProperties;
  className?: string;
}

/**
 * Restricts dragging to this element instead of the whole `Reorder.Item` —
 * wrap a grip icon in it so the rest of the row (buttons, links, text
 * selection) stays interactive instead of every pointerdown being a
 * potential drag. Must be rendered somewhere inside a `Reorder.Item`.
 */
export function ReorderHandle({ children, style, className }: ReorderHandleProps) {
  const ctx = useContext(ReorderItemContext);
  if (!ctx) {
    throw new Error('Reorder.Handle must be rendered inside a Reorder.Item');
  }

  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    ctx.registerHandle(ref.current);
    return () => ctx.registerHandle(null);
  }, [ctx]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        cursor: 'grab',
        touchAction: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export const Reorder = {
  Group: ReorderGroup,
  Item: ReorderItem,
  Handle: ReorderHandle,
  Context: ReorderContextProvider,
};
