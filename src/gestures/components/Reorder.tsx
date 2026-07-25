import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MutableRefObject,
  type ReactNode,
  type RefObject,
} from 'react';
import { animate, useValue } from '../../animation';
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

interface HoverState {
  /** Which registered group the pointer is currently over, if any. */
  groupKey: object | null;
  /** Where, within that group, the item would land if dropped now. */
  dropIndex: number | null;
  /** The group the drag started in — lets a group tell "hovering myself" (no preview needed, same-group swapping already animates it live) apart from "hovering from elsewhere" (needs a preview gap). */
  sourceGroupKey: object | null;
}

const NO_HOVER: HoverState = { groupKey: null, dropIndex: null, sourceGroupKey: null };

interface ReorderDndContextValue {
  registerGroup: (key: object, entry: DndGroupEntry) => void;
  unregisterGroup: (key: object) => void;
  getGroup: (key: object) => DndGroupEntry | undefined;
  /** Which registered group's container bounds contain `point`, if any. */
  findGroupAt: (point: { x: number; y: number }) => object | undefined;
  setHover: (state: HoverState) => void;
  hoverRef: RefObject<HoverState>;
  /**
   * Set right before a cross-group drop's `onReorder` calls unmount the
   * dragged item from its source list — the *actual on-screen* rect
   * (transform included, i.e. wherever the pointer left it, not its
   * untransformed flow position) it should visually continue from. The
   * freshly-mounted instance in the target list consumes this once, on its
   * first layout effect, to seed a FLIP correction instead of just popping
   * into place.
   */
  pendingTransferRef: MutableRefObject<{ value: unknown; rect: MeasuredRect } | null>;
}

const ReorderDndContext = createContext<ReorderDndContextValue | null>(null);

// Separate from `ReorderDndContext` on purpose: this one's value changes
// continuously while something is being dragged across group boundaries and
// is read *reactively* — by `Group` for its `data-reorder-drop-active` hook,
// and by every other `Item` in whichever group is currently hovered, so
// they can preview the gap the drop would open — whereas
// `ReorderDndContext`'s value is a stable set of functions/refs read
// imperatively from drag handlers.
const ReorderHoverContext = createContext<HoverState>(NO_HOVER);

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
 * The actual array transfer only commits once, on release: moving an item
 * between groups mid-drag would unmount its component instance (a different
 * parent's list) partway through the gesture, which tears down the pointer
 * tracking that's mid-flight and would abort the drag outright. Until then,
 * every group the pointer passes over previews the gap the drop would open
 * (its members spring out of the way, the same as a same-group swap does),
 * so it reads as live reordering even though the underlying arrays don't
 * change until the pointer is released.
 */
export function ReorderContextProvider({ children }: ReorderContextProps) {
  const groupsRef = useRef(new Map<object, DndGroupEntry>());
  const hoverRef = useRef<HoverState>(NO_HOVER);
  const pendingTransferRef = useRef<{ value: unknown; rect: MeasuredRect } | null>(null);
  const [hover, setHoverState] = useState<HoverState>(NO_HOVER);

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
      setHover: (next) => {
        const prev = hoverRef.current;
        if (
          prev.groupKey === next.groupKey &&
          prev.dropIndex === next.dropIndex &&
          prev.sourceGroupKey === next.sourceGroupKey
        ) {
          return;
        }
        hoverRef.current = next;
        setHoverState(next);
      },
      hoverRef,
      pendingTransferRef,
    }),
    []
  );

  return (
    <ReorderDndContext.Provider value={dndContextValue}>
      <ReorderHoverContext.Provider value={hover}>{children}</ReorderHoverContext.Provider>
    </ReorderDndContext.Provider>
  );
}

function insertAt<T>(array: T[], index: number, item: T): T[] {
  const next = array.slice();
  next.splice(clamp(index, 0, next.length), 0, item);
  return next;
}

/** Where, among `entry`'s current members, `point` falls — used both for the
 * live preview (every pointermove) and the actual insertion (on release). */
function computeDropIndex(entry: DndGroupEntry, point: { x: number; y: number }): number {
  const dropCoord = entry.axis === 'y' ? point.y : point.x;
  return entry.values.reduce<number>((count, v) => {
    const el = entry.getElement(v);
    if (!el) return count;
    const rect = el.getBoundingClientRect();
    const center = entry.axis === 'y' ? rect.top + rect.height / 2 : rect.left + rect.width / 2;
    return center < dropCoord ? count + 1 : count;
  }, 0);
}

export interface ReorderGroupProps<T> {
  /** The list backing this group, in display order — owned by the caller. */
  values: T[];
  /** Called with the reordered array as items are dragged past each other. */
  onReorder: (values: T[]) => void;
  /** Axis items are stacked (and can be dragged) along. Default `'y'`. */
  axis?: 'x' | 'y';
  /**
   * Transition used for the "displaced/previewed neighbor springs out of
   * the way" animation and the "released item settles into place"
   * animation. Same descriptor helpers as `animate`/`layoutOptions`
   * elsewhere:
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
  const hover = useContext(ReorderHoverContext);

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
        data-reorder-drop-active={dndCtx && hover.groupKey === groupKey ? 'true' : undefined}
      >
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
  const hover = useContext(ReorderHoverContext);

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
  // Set by the FLIP-diff layout effect whenever it applies a real
  // correction, and consumed by the preview effect right after (layout
  // effects run before passive ones in the same commit) — a real reorder
  // landing on this item and the preview clearing at the same time (exactly
  // what happens the instant a cross-group drop commits) would otherwise
  // both call `setOffset(settleTo(0))` independently, and the second call
  // restarts the spring with zero velocity, producing a visible stutter
  // right at the handoff instead of one continuous motion.
  const justFlippedRef = useRef(false);
  const wasPreviewingRef = useRef(false);

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
  // used to decide *when* a drag has gone far enough to trigger a swap, and
  // as the preview-gap size for a cross-group hover.
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

  const settleTo = (target: number) => ({ ...resolveLayoutTransition(transition), to: target });

  // Runs after every commit (mirrors how the `layout` prop's own FLIP effect
  // is triggered): measure this item's real, untransformed position and
  // diff it against the last measurement. A non-zero delta means a reorder
  // (this item's own, a sibling's, or a cross-group drop landing here) just
  // moved it in the DOM. Dragged items absorb the *primary*-axis delta
  // instantly (folded into `offset` with no animation, so the pointer-follow
  // never stutters); everyone else springs both axes back to identity — the
  // classic FLIP "invert, then animate to 0". A freshly-mounted item that
  // just arrived via a cross-group drop seeds its "previous" rect from the
  // real on-screen position it was dropped at (see `pendingTransferRef`)
  // instead of skipping this first measurement, so it continues smoothly
  // from wherever the pointer let go rather than popping in.
  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;

    const nextRect = measureUntransformedRect(node);

    let prevRect = prevRectRef.current;
    let shouldCompare = hasMeasuredRef.current;

    if (!hasMeasuredRef.current && dndCtx) {
      const pending = dndCtx.pendingTransferRef.current;
      if (pending && pending.value === value) {
        prevRect = pending.rect;
        shouldCompare = true;
        dndCtx.pendingTransferRef.current = null;
      }
    }

    hasMeasuredRef.current = true;
    prevRectRef.current = nextRect;

    if (!shouldCompare || !prevRect) return;
    if (nextRect.width === 0 || nextRect.height === 0) return;

    const deltaPrimary = axis === 'y' ? prevRect.top - nextRect.top : prevRect.left - nextRect.left;
    const deltaCross = axis === 'y' ? prevRect.left - nextRect.left : prevRect.top - nextRect.top;
    if (Math.abs(deltaPrimary) < 0.5 && Math.abs(deltaCross) < 0.5) return;

    if (isDraggingRef.current) {
      correctionRef.current += deltaPrimary;
      setOffset(lastMovementRef.current + correctionRef.current);
      setCrossOffset(deltaCross);
    } else {
      justFlippedRef.current = true;
      setOffset(deltaPrimary);
      setCrossOffset(deltaCross);
      setOffset(settleTo(0));
      setCrossOffset(settleTo(0));
    }
  });

  // Cosmetic-only "make room" preview: while a drag *originating in a
  // different group* is hovering this one, every member at or past the
  // computed drop index nudges aside by one slot, springing back once the
  // hover moves on or the drag ends. Doesn't touch `values` — only an
  // actual drop does that (see the gesture's `onEnd`) — so it can't disturb
  // the in-flight drag the way a live cross-group array mutation would.
  useEffect(() => {
    if (!dndCtx || isDraggingRef.current) return;

    // The FLIP-diff layout effect already handled this same commit's real
    // position change (a real reorder just landed on this item — exactly
    // what happens the instant a cross-group drop commits, since the hover
    // preview clears in that very same commit). Defer to it entirely rather
    // than also restarting a competing spring here.
    if (justFlippedRef.current) {
      justFlippedRef.current = false;
      wasPreviewingRef.current = false;
      return;
    }

    const isPreviewTarget =
      hover.groupKey === groupKey &&
      hover.sourceGroupKey !== null &&
      hover.sourceGroupKey !== groupKey &&
      hover.dropIndex !== null;

    const myIndex = values.indexOf(value);
    const shouldMakeRoom = isPreviewTarget && myIndex >= (hover.dropIndex as number);

    if (shouldMakeRoom) {
      wasPreviewingRef.current = true;
      setOffset(settleTo(measurePitch()));
    } else if (wasPreviewingRef.current) {
      wasPreviewingRef.current = false;
      setOffset(settleTo(0));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dndCtx, hover.groupKey, hover.dropIndex, hover.sourceGroupKey, groupKey, value, values]);

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
        dndCtx?.setHover({ groupKey, dropIndex: null, sourceGroupKey: groupKey });
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
          const foundKey = dndCtx.findGroupAt(point) ?? null;
          const foundEntry = foundKey ? dndCtx.getGroup(foundKey) : undefined;
          const dropIndex = foundEntry ? computeDropIndex(foundEntry, point) : null;
          dndCtx.setHover({ groupKey: foundKey, dropIndex, sourceGroupKey: groupKey });
        }
      })
      .onEnd((e) => {
        isDraggingRef.current = false;
        setIsDragging(false);

        const hoverAtRelease = dndCtx?.hoverRef.current ?? NO_HOVER;
        const targetKey = hoverAtRelease.groupKey;

        if (dndCtx && targetKey && targetKey !== groupKey) {
          const targetEntry = dndCtx.getGroup(targetKey);
          const sourceEntry = dndCtx.getGroup(groupKey);

          if (targetEntry && sourceEntry) {
            const start = dragStartRectRef.current;
            const point = {
              x: start.left + start.width / 2 + e.movement.x,
              y: start.top + start.height / 2 + e.movement.y,
            };
            const dropIndex = computeDropIndex(targetEntry, point);

            if (ref.current) {
              const rect = ref.current.getBoundingClientRect();
              dndCtx.pendingTransferRef.current = {
                value,
                rect: {
                  left: rect.left + window.scrollX,
                  top: rect.top + window.scrollY,
                  width: rect.width,
                  height: rect.height,
                },
              };
            }

            sourceEntry.onReorder(sourceEntry.values.filter((v) => v !== value));
            targetEntry.onReorder(insertAt(targetEntry.values, dropIndex, value));
          }
        } else {
          setOffset(settleTo(0));
        }

        setCrossOffset(settleTo(0));
        dndCtx?.setHover(NO_HOVER);
      })
  );

  return (
    <animate.div
      ref={ref}
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
