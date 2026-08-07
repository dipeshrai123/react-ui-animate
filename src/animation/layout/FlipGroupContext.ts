import { createContext } from 'react';
import type { FlipIdRegistry } from './registry';

// null means no FlipGroup ancestor — falls back to the shared global registry.
export const FlipGroupContext = createContext<FlipIdRegistry | null>(null);
