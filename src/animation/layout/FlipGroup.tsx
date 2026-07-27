import { useRef, type ReactNode } from 'react';
import { FlipGroupContext } from './FlipGroupContext';
import type { FlipIdRegistry } from './registry';

export interface FlipGroupProps {
  children?: ReactNode;
}

// Scopes flipId transitions to this subtree — two FlipGroups with the same flipId don't cross-transition.
export function FlipGroup({ children }: FlipGroupProps) {
  const registryRef = useRef<FlipIdRegistry | null>(null);
  if (!registryRef.current) {
    registryRef.current = new Map();
  }

  return (
    <FlipGroupContext.Provider value={registryRef.current}>
      {children}
    </FlipGroupContext.Provider>
  );
}
