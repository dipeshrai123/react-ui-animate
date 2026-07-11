import {
  Children,
  isValidElement,
  useRef,
  useState,
  useEffect,
  useLayoutEffect,
  createContext,
  useContext,
  useMemo,
  useCallback,
  type ReactElement,
  type ReactNode,
} from 'react';

export interface PresenceProps {
  /**
   * Children to animate. Each direct child should have a unique `key` prop.
   */
  children?: ReactNode;

  /**
   * When true, the initial render will skip the enter animation.
   * @default true
   */
  initial?: boolean;

  /**
   * Callback when all exiting nodes have completed animating out.
   */
  onExitComplete?: () => void;

  /**
   * When a new child enters, determines behavior of existing children.
   * - "sync": (default) Exiting and entering children animate simultaneously.
   * - "wait": Exiting children complete before entering children start.
   * - "popLayout": Exiting children are removed from layout flow immediately.
   */
  mode?: 'sync' | 'wait' | 'popLayout';
}

export interface PresenceContextValue {
  /**
   * Whether this is the initial mount (skip enter animation if Presence.initial=false)
   */
  isInitialMount: boolean;

  /**
   * Whether this element is exiting
   */
  isExiting: boolean;

  /**
   * Call this when exit animation completes to remove the element
   */
  onExitComplete: () => void;

  /**
   * Internal: Counter to force re-renders when exit state changes
   */
  _forceUpdate?: number;
}

export const PresenceContext = createContext<PresenceContextValue | null>(null);

/**
 * Hook to access presence state from within an animated component.
 */
export function usePresence(): [boolean, () => void] {
  const context = useContext(PresenceContext);
  if (!context) return [true, () => {}];
  return [!context.isExiting, context.onExitComplete];
}

/**
 * Hook to check if this is the initial mount (for skipping initial animations).
 */
export function useIsPresent(): boolean {
  const context = useContext(PresenceContext);
  return context ? !context.isExiting : true;
}

interface ChildState {
  key: string | number;
  element: ReactElement;
  isExiting: boolean;
}

// `exitingState` forces a re-render once `isExiting` flips, so this subtree
// re-reads the (now exiting) PresenceContext instead of staying stale.
function PresenceChild({
  children,
  isExiting,
  mode,
}: {
  children: ReactElement;
  isExiting: boolean;
  mode: string;
}): ReactElement | null {
  const [exitingState, setExitingState] = useState(false);

  useLayoutEffect(() => {
    if (isExiting && !exitingState) {
      setExitingState(true);
    }
  }, [isExiting, exitingState]);

  if (mode === 'popLayout' && isExiting) {
    return <div style={{ position: 'absolute' }}>{children}</div>;
  }
  return children;
}

/**
 * Presence enables exit animations when children are removed from the tree.
 *
 * @example
 * ```tsx
 * <Presence>
 *   {isVisible && (
 *     <animate.div
 *       key="modal"
 *       style={{ opacity: 0 }}
 *       animate={{ opacity: withTiming(1) }}
 *       exit={{ opacity: withTiming(0) }}
 *     />
 *   )}
 * </Presence>
 * ```
 */
export function Presence({
  children,
  initial = true,
  onExitComplete,
  mode = 'sync',
}: PresenceProps): ReactElement {
  const isInitialMount = useRef(true);
  const [childStates, setChildStates] = useState<Map<string | number, ChildState>>(
    () => new Map()
  );
  const exitingCount = useRef(0);

  const currentChildren = useMemo(() => {
    const result: Array<{ key: string | number; element: ReactElement }> = [];

    Children.forEach(children, (child) => {
      if (isValidElement(child)) {
        const key = child.key ?? 'default';
        result.push({ key, element: child });
      }
    });

    return result;
  }, [children]);

  const currentKeys = useMemo(
    () => new Set(currentChildren.map((c) => c.key)),
    [currentChildren]
  );

  useLayoutEffect(() => {
    setChildStates((prev) => {
      const next = new Map<string | number, ChildState>();
      const currentChildrenMap = new Map(
        currentChildren.map(({ key, element }) => [key, element])
      );

      // Two passes: first carry forward everything from `prev` (updating
      // elements that still exist, marking the rest as exiting), then append
      // any brand-new keys — so existing children keep their render order
      // and new ones land at the end.
      for (const [key, state] of prev) {
        if (currentChildrenMap.has(key)) {
          // Was exiting and came back before its exit finished re-entering.
          if (state.isExiting) {
            exitingCount.current--;
          }
          next.set(key, {
            key,
            element: currentChildrenMap.get(key)!,
            isExiting: false,
          });
        } else {
          if (!state.isExiting) {
            exitingCount.current++;
          }
          next.set(key, {
            ...state,
            isExiting: true,
          });
        }
      }

      for (const { key, element } of currentChildren) {
        if (!prev.has(key)) {
          next.set(key, {
            key,
            element,
            isExiting: false,
          });
        }
      }

      return next;
    });
  }, [currentChildren, currentKeys]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    }
  }, []);

  const handleExitComplete = useCallback((key: string | number) => {
    setChildStates((prev) => {
      const next = new Map(prev);
      next.delete(key);
      return next;
    });

    exitingCount.current--;
    if (exitingCount.current === 0 && onExitComplete) {
      onExitComplete();
    }
  }, [onExitComplete]);

  const renderedChildren = useMemo(() => {
    const result: ReactElement[] = [];

    // In 'wait' mode, entering children stay unrendered until nothing is exiting.
    const hasExiting = Array.from(childStates.values()).some((s) => s.isExiting);
    const shouldWait = mode === 'wait' && hasExiting;

    for (const [key, state] of childStates) {
      if (shouldWait && !state.isExiting) {
        continue;
      }

      const contextValue: PresenceContextValue = {
        isInitialMount: isInitialMount.current && initial,
        isExiting: state.isExiting,
        onExitComplete: () => handleExitComplete(key),
      };

      result.push(
        <PresenceContext.Provider key={key} value={contextValue}>
          <PresenceChild isExiting={state.isExiting} mode={mode}>
            {state.element}
          </PresenceChild>
        </PresenceContext.Provider>
      );
    }

    return result;
  }, [childStates, initial, mode, handleExitComplete]);

  return <>{renderedChildren}</>;
}

export default Presence;

