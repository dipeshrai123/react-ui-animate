import { useRef, type ReactNode } from 'react';
import { FlipGroupContext } from './FlipGroupContext';
import type { FlipIdRegistry } from './registry';

export interface FlipGroupProps {
  children?: ReactNode;
}

// Scopes `flipId` shared-element transitions to this subtree instead of
// the shared global registry (`src/animation/layout/registry.ts`) — two
// `FlipGroup`s using the same `flipId` string transition independently
// instead of cross-transitioning with each other. Elements outside any
// `FlipGroup` are unaffected and keep using the global registry.
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
