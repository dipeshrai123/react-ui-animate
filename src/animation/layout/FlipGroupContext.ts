import { createContext } from 'react';
import type { FlipIdRegistry } from './registry';

// `null` means "no FlipGroup ancestor" — `useFlipIdAnimations` falls
// back to the shared global registry in that case.
export const FlipGroupContext = createContext<FlipIdRegistry | null>(null);
