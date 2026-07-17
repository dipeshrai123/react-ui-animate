import { useRef, type ReactNode } from 'react';
import { LayoutGroupContext } from './LayoutGroupContext';
import type { LayoutIdRegistry } from './registry';

export interface LayoutGroupProps {
  children?: ReactNode;
}

// Scopes `layoutId` shared-element transitions to this subtree instead of
// the shared global registry (`src/animation/layout/registry.ts`) — two
// `LayoutGroup`s using the same `layoutId` string transition independently
// instead of cross-transitioning with each other. Elements outside any
// `LayoutGroup` are unaffected and keep using the global registry.
export function LayoutGroup({ children }: LayoutGroupProps) {
  const registryRef = useRef<LayoutIdRegistry | null>(null);
  if (!registryRef.current) {
    registryRef.current = new Map();
  }

  return (
    <LayoutGroupContext.Provider value={registryRef.current}>
      {children}
    </LayoutGroupContext.Provider>
  );
}
