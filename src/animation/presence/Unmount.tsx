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

export interface UnmountProps {
  /** Children to animate. Each direct child should have a unique `key` prop. */
  children?: ReactNode;

  /** When true, the initial render skips the enter animation. @default true */
  initial?: boolean;

  /** Called once all exiting nodes have finished animating out. */
  onExitComplete?: () => void;

  /**
   * - "sync": (default) exiting and entering children animate simultaneously.
   * - "wait": exiting children complete before entering children start.
   * - "popLayout": exiting children are removed from layout flow immediately.
   */
  mode?: 'sync' | 'wait' | 'popLayout';
}

export interface UnmountContextValue {
  isInitialMount: boolean;
  isExiting: boolean;
  onExitComplete: () => void;
  registerExit: () => void;
  _forceUpdate?: number;
}

export const UnmountContext = createContext<UnmountContextValue | null>(null);

export function useUnmount(): [boolean, () => void] {
  const context = useContext(UnmountContext);

  useLayoutEffect(() => {
    context?.registerExit();
  }, [context]);

  if (!context) return [true, () => {}];
  return [!context.isExiting, context.onExitComplete];
}

export function useIsUnmounting(): boolean {
  const context = useContext(UnmountContext);
  return context ? context.isExiting : false;
}

interface ChildState {
  key: string | number;
  element: ReactElement;
  isExiting: boolean;
}

// `exitingState` forces a re-render once `isExiting` flips, so this subtree
// re-reads the (now exiting) UnmountContext instead of staying stale.
function UnmountChild({
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
 * Unmount enables exit animations when children are removed from the tree.
 *
 * @example
 * ```tsx
 * <Unmount>
 *   {isVisible && (
 *     <animate.div
 *       key="modal"
 *       style={{ opacity: 0 }}
 *       animate={{ opacity: withTiming(1) }}
 *       unmount={{ opacity: withTiming(0) }}
 *     />
 *   )}
 * </Unmount>
 * ```
 */
export function Unmount({
  children,
  initial = true,
  onExitComplete,
  mode = 'sync',
}: UnmountProps): ReactElement {
  const isInitialMount = useRef(true);
  const [childStates, setChildStates] = useState<Map<string | number, ChildState>>(
    () => new Map()
  );
  const exitingCount = useRef(0);
  const exitRegistryRef = useRef<Set<string | number>>(new Set());

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
            exitRegistryRef.current.delete(key);
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

    exitRegistryRef.current.delete(key);
    exitingCount.current--;
    if (exitingCount.current === 0 && onExitComplete) {
      onExitComplete();
    }
  }, [onExitComplete]);

  const registerExit = useCallback((key: string | number) => {
    exitRegistryRef.current.add(key);
  }, []);

  useLayoutEffect(() => {
    for (const [key, state] of childStates) {
      if (state.isExiting && !exitRegistryRef.current.has(key)) {
        handleExitComplete(key);
      }
    }
  });

  const renderedChildren = useMemo(() => {
    const result: ReactElement[] = [];

    // In 'wait' mode, entering children stay unrendered until nothing is exiting.
    const hasExiting = Array.from(childStates.values()).some((s) => s.isExiting);
    const shouldWait = mode === 'wait' && hasExiting;

    for (const [key, state] of childStates) {
      if (shouldWait && !state.isExiting) {
        continue;
      }

      const contextValue: UnmountContextValue = {
        isInitialMount: isInitialMount.current && initial,
        isExiting: state.isExiting,
        onExitComplete: () => handleExitComplete(key),
        registerExit: () => registerExit(key),
      };

      result.push(
        <UnmountContext.Provider key={key} value={contextValue}>
          <UnmountChild isExiting={state.isExiting} mode={mode}>
            {state.element}
          </UnmountChild>
        </UnmountContext.Provider>
      );
    }

    return result;
  }, [childStates, initial, mode, handleExitComplete, registerExit]);

  return <>{renderedChildren}</>;
}

export default Unmount;
