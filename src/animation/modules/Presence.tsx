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
  type ReactElement,
  type ReactNode,
} from 'react';

// ============================================================================
// Types
// ============================================================================

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
}

// ============================================================================
// Context
// ============================================================================

export const PresenceContext = createContext<PresenceContextValue | null>(null);

/**
 * Hook to access presence state from within an animated component.
 */
export function usePresence(): [boolean, () => void] {
  const context = useContext(PresenceContext);

  if (!context) {
    // Not inside Presence, always present
    return [true, () => {}];
  }

  return [!context.isExiting, context.onExitComplete];
}

/**
 * Hook to check if this is the initial mount (for skipping initial animations).
 */
export function useIsPresent(): boolean {
  const context = useContext(PresenceContext);
  return context ? !context.isExiting : true;
}

// ============================================================================
// Internal Types
// ============================================================================

interface ChildState {
  key: string | number;
  element: ReactElement;
  isExiting: boolean;
}

// ============================================================================
// Component
// ============================================================================

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
  // Track whether this is the first render
  const isInitialMount = useRef(true);

  // Track all children (including exiting ones)
  const [childStates, setChildStates] = useState<Map<string | number, ChildState>>(
    () => new Map()
  );

  // Track exiting children count for onExitComplete callback
  const exitingCount = useRef(0);

  // Get current children as an array with keys
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

  // Current child keys for comparison
  const currentKeys = useMemo(
    () => new Set(currentChildren.map((c) => c.key)),
    [currentChildren]
  );

  // Update child states when children change
  useLayoutEffect(() => {
    setChildStates((prev) => {
      const next = new Map<string | number, ChildState>();
      
      // Build a map of current children for quick lookup
      const currentChildrenMap = new Map(
        currentChildren.map(({ key, element }) => [key, element])
      );

      // First, preserve order from previous state and update elements
      for (const [key, state] of prev) {
        if (currentChildrenMap.has(key)) {
          // Child still exists - update element, not exiting
          next.set(key, {
            key,
            element: currentChildrenMap.get(key)!,
            isExiting: false,
          });
        } else {
          // Child is exiting - keep old element
          if (!state.isExiting) {
            exitingCount.current++;
          }
          next.set(key, {
            ...state,
            isExiting: true,
          });
        }
      }

      // Then, add any NEW children that weren't in prev (at the end)
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

  // Mark initial mount as complete after first render
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    }
  }, []);

  // Create handler for when a child's exit animation completes
  const handleExitComplete = (key: string | number) => {
    setChildStates((prev) => {
      const next = new Map(prev);
      next.delete(key);
      return next;
    });

    exitingCount.current--;
    if (exitingCount.current === 0 && onExitComplete) {
      onExitComplete();
    }
  };

  // Render children with presence context
  const renderedChildren = useMemo(() => {
    const result: ReactElement[] = [];

    // In 'wait' mode, don't render entering children if there are exiting ones
    const hasExiting = Array.from(childStates.values()).some((s) => s.isExiting);
    const shouldWait = mode === 'wait' && hasExiting;

    for (const [key, state] of childStates) {
      // Skip entering children in wait mode
      if (shouldWait && !state.isExiting) {
        continue;
      }

      const contextValue: PresenceContextValue = {
        isInitialMount: isInitialMount.current && initial,
        isExiting: state.isExiting,
        onExitComplete: () => handleExitComplete(key),
      };

      // Clone element with presence context
      result.push(
        <PresenceContext.Provider key={key} value={contextValue}>
          {mode === 'popLayout' && state.isExiting ? (
            <div style={{ position: 'absolute' }}>{state.element}</div>
          ) : (
            state.element
          )}
        </PresenceContext.Provider>
      );
    }

    return result;
  }, [childStates, initial, mode, handleExitComplete]);

  return <>{renderedChildren}</>;
}

export default Presence;

