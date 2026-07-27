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
  resolveFlipTransition,
  type FlipOptions,
  type MeasuredRect,
} from '../../animation/layout/flip';
import { clamp, move } from '../../shared/utils';
import { Gesture } from '../api/Gesture';
import { useGesture } from '../hooks/useGesture';

interface ReorderContextValue<T = unknown> {
  values: T[];
  onReorder: (values: T[]) => void;
  axis: 'x' | 'y';
  transition: FlipOptions | undefined;
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

interface DndGroupEntry {
  values: unknown[];
  onReorder: (values: unknown[]) => void;
  axis: 'x' | 'y';
  getElement: (value: unknown) => HTMLElement | undefined;
  containerRef: RefObject<HTMLElement>;
}

interface HoverState {
  groupKey: object | null;
  dropIndex: number | null;
  sourceGroupKey: object | null;
  sourceValue: unknown;
}

const NO_HOVER: HoverState = {
  groupKey: null,
  dropIndex: null,
  sourceGroupKey: null,
  sourceValue: null,
};

interface ReorderDndContextValue {
  registerGroup: (key: object, entry: DndGroupEntry) => void;
  unregisterGroup: (key: object) => void;
  getGroup: (key: object) => DndGroupEntry | undefined;
  findGroupAt: (point: { x: number; y: number }) => object | undefined;
  setHover: (state: HoverState) => void;
  hoverRef: RefObject<HoverState>;
  pendingTransferRef: MutableRefObject<{
    value: unknown;
    rect: MeasuredRect;
  } | null>;
}

const ReorderDndContext = createContext<ReorderDndContextValue | null>(null);

const ReorderHoverContext = createContext<HoverState>(NO_HOVER);

export interface ReorderContextProps {
  children?: ReactNode;
}

export function ReorderContextProvider({ children }: ReorderContextProps) {
  const groupsRef = useRef(new Map<object, DndGroupEntry>());
  const hoverRef = useRef<HoverState>(NO_HOVER);
  const pendingTransferRef = useRef<{
    value: unknown;
    rect: MeasuredRect;
  } | null>(null);
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

        // Fallback: match by cross-axis band + nearest distance, since a short/empty column's rect won't cover drops past its last item.
        let closestKey: object | undefined;
        let closestDistance = Infinity;
        for (const [key, entry] of groupsRef.current) {
          const el = entry.containerRef.current;
          if (!el) continue;
          const rect = el.getBoundingClientRect();

          const inCrossAxis =
            entry.axis === 'y'
              ? point.x >= rect.left && point.x <= rect.right
              : point.y >= rect.top && point.y <= rect.bottom;
          if (!inCrossAxis) continue;

          const distance =
            entry.axis === 'y'
              ? Math.max(rect.top - point.y, point.y - rect.bottom, 0)
              : Math.max(rect.left - point.x, point.x - rect.right, 0);

          if (distance < closestDistance) {
            closestDistance = distance;
            closestKey = key;
          }
        }
        return closestKey;
      },
      setHover: (next) => {
        const prev = hoverRef.current;
        if (
          prev.groupKey === next.groupKey &&
          prev.dropIndex === next.dropIndex &&
          prev.sourceGroupKey === next.sourceGroupKey &&
          prev.sourceValue === next.sourceValue
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
      <ReorderHoverContext.Provider value={hover}>
        {children}
      </ReorderHoverContext.Provider>
    </ReorderDndContext.Provider>
  );
}

function insertAt<T>(array: T[], index: number, item: T): T[] {
  const next = array.slice();
  next.splice(clamp(index, 0, next.length), 0, item);
  return next;
}

function computeDropIndex(
  entry: DndGroupEntry,
  point: { x: number; y: number }
): number {
  const dropCoord = entry.axis === 'y' ? point.y : point.x;
  return entry.values.reduce<number>((count, v) => {
    const el = entry.getElement(v);
    if (!el) return count;
    const rect = el.getBoundingClientRect();
    const center =
      entry.axis === 'y'
        ? rect.top + rect.height / 2
        : rect.left + rect.width / 2;
    return center < dropCoord ? count + 1 : count;
  }, 0);
}

export interface ReorderGroupProps<T> {
  values: T[];
  onReorder: (values: T[]) => void;
  axis?: 'x' | 'y';
  transition?: FlipOptions;
  children?: ReactNode;
  style?: CSSProperties;
  className?: string;
}

export function ReorderGroup<T>({
  values,
  onReorder,
  axis = 'y',
  transition,
  children,
  style,
  className,
}: ReorderGroupProps<T>) {
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
        data-reorder-drop-active={
          dndCtx && hover.groupKey === groupKey ? 'true' : undefined
        }
      >
        {children}
      </div>
    </ReorderContext.Provider>
  );
}

export interface ReorderItemProps<T> {
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

  // zIndex tier: 0 normal, 1 settling, 2 actively dragged.
  const [zPriority, setZPriority] = useState<0 | 1 | 2>(0);
  const elevationCountRef = useRef(0);

  const raiseElevation = () => {
    elevationCountRef.current += 1;
    setZPriority((p) => (p < 1 ? 1 : p));
  };

  const releaseElevation = () => {
    elevationCountRef.current = Math.max(0, elevationCountRef.current - 1);
    if (elevationCountRef.current === 0) setZPriority(0);
  };

  const isDraggingRef = useRef(false);
  const lastMovementRef = useRef(0);
  const correctionRef = useRef(0);
  const originIndexRef = useRef(0);
  const lastIndexRef = useRef(0);
  const sizeRef = useRef(0);
  const dragStartRectRef = useRef<{
    top: number;
    left: number;
    width: number;
    height: number;
  }>({
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  });

  const prevRectRef = useRef<MeasuredRect | null>(null);
  const hasMeasuredRef = useRef(false);
  const justFlippedRef = useRef(false);
  const wasPreviewingRef = useRef(false);

  useLayoutEffect(() => {
    if (ref.current) registerElement(value, ref.current);
    return () => unregisterElement(value);
  }, [value, registerElement, unregisterElement]);

  const edge = (el: HTMLElement) => {
    const rect = measureUntransformedRect(el);
    return axis === 'y' ? rect.top : rect.left;
  };

  const measurePitch = () => {
    if (!ref.current) return 0;
    const rect = measureUntransformedRect(ref.current);
    const ownSize = axis === 'y' ? rect.height : rect.width;
    const index = values.indexOf(value);

    const neighborValue =
      index < values.length - 1 ? values[index + 1] : values[index - 1];
    const neighborEl =
      neighborValue !== undefined ? getElement(neighborValue) : undefined;
    if (!neighborEl) return ownSize;

    const pitch = Math.abs(edge(neighborEl) - edge(ref.current));
    return pitch || ownSize;
  };

  // zIndex stays raised until the settle spring's onComplete, not reset eagerly.
  const settleTo = (target: number) => {
    const base = resolveFlipTransition(transition);
    raiseElevation();
    return {
      ...base,
      to: target,
      options: { ...base.options, onComplete: releaseElevation },
    };
  };

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

    const deltaPrimary =
      axis === 'y'
        ? prevRect.top - nextRect.top
        : prevRect.left - nextRect.left;
    const deltaCross =
      axis === 'y'
        ? prevRect.left - nextRect.left
        : prevRect.top - nextRect.top;
    if (Math.abs(deltaPrimary) < 0.5 && Math.abs(deltaCross) < 0.5) return;

    if (isDraggingRef.current) {
      correctionRef.current += deltaPrimary;
      setOffset(lastMovementRef.current + correctionRef.current);
      setCrossOffset(deltaCross);
    } else {
      // shiftBy preserves velocity — cancel+restart zeroed it and caused a settle-hitch on every swap.
      justFlippedRef.current = true;
      if (offset.getAnimationController()?.shiftBy) {
        offset.shiftBy(deltaPrimary);
      } else {
        setOffset((offset.current as number) + deltaPrimary);
      }
      if (crossOffset.getAnimationController()?.shiftBy) {
        crossOffset.shiftBy(deltaCross);
      } else {
        setCrossOffset((crossOffset.current as number) + deltaCross);
      }
      setOffset(settleTo(0));
      setCrossOffset(settleTo(0));
    }
  });

  useEffect(() => {
    if (!dndCtx || isDraggingRef.current) return;

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
    const shouldMakeRoom =
      isPreviewTarget && myIndex >= (hover.dropIndex as number);

    const isSourceOfActiveDrag =
      hover.sourceGroupKey === groupKey &&
      hover.groupKey !== groupKey &&
      hover.sourceValue !== null;
    const dragOriginIndex = isSourceOfActiveDrag
      ? values.indexOf(hover.sourceValue as T)
      : -1;
    const shouldCloseGap =
      isSourceOfActiveDrag && dragOriginIndex !== -1 && myIndex > dragOriginIndex;

    if (shouldMakeRoom) {
      wasPreviewingRef.current = true;
      setOffset(settleTo(measurePitch()));
    } else if (shouldCloseGap) {
      wasPreviewingRef.current = true;
      setOffset(settleTo(-measurePitch()));
    } else if (wasPreviewingRef.current) {
      wasPreviewingRef.current = false;
      setOffset(settleTo(0));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    dndCtx,
    hover.groupKey,
    hover.dropIndex,
    hover.sourceGroupKey,
    hover.sourceValue,
    groupKey,
    value,
    values,
  ]);

  let gesture = Gesture.Pan().minDistance(4);
  if (!dndCtx) gesture = gesture.axis(axis);

  useGesture(
    gestureTargetRef,
    gesture
      .onStart(() => {
        isDraggingRef.current = true;
        setZPriority(2);
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
        dndCtx?.setHover({
          groupKey,
          dropIndex: null,
          sourceGroupKey: groupKey,
          sourceValue: value,
        });
      })
      .onUpdate((e) => {
        const movement = axis === 'y' ? e.movement.y : e.movement.x;
        const cross = axis === 'y' ? e.movement.x : e.movement.y;
        lastMovementRef.current = movement;

        let notInSourceGroup = false;

        if (dndCtx) {
          const start = dragStartRectRef.current;
          const point = {
            x: start.left + start.width / 2 + e.movement.x,
            y: start.top + start.height / 2 + e.movement.y,
          };
          const foundKey = dndCtx.findGroupAt(point) ?? null;
          const foundEntry = foundKey ? dndCtx.getGroup(foundKey) : undefined;
          const dropIndex = foundEntry
            ? computeDropIndex(foundEntry, point)
            : null;
          dndCtx.setHover({
            groupKey: foundKey,
            dropIndex,
            sourceGroupKey: groupKey,
            sourceValue: value,
          });
          notInSourceGroup = foundKey !== groupKey;
        }

        if (!notInSourceGroup) {
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
        }

        setOffset(movement + correctionRef.current);
        setCrossOffset(cross);
      })
      .onEnd((e) => {
        isDraggingRef.current = false;
        setZPriority((p) => (p > 1 ? 1 : p));

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

            sourceEntry.onReorder(
              sourceEntry.values.filter((v) => v !== value)
            );
            targetEntry.onReorder(
              insertAt(targetEntry.values, dropIndex, value)
            );
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
        userSelect: 'none',
        WebkitUserSelect: 'none',
        ...style,
        zIndex: zPriority > 0 ? zPriority : style?.zIndex,
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

export function ReorderHandle({
  children,
  style,
  className,
}: ReorderHandleProps) {
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
