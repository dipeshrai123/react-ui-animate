import { createContext } from 'react';
import type { LayoutIdRegistry } from './registry';

// `null` means "no LayoutGroup ancestor" — `useLayoutIdAnimations` falls
// back to the shared global registry in that case.
export const LayoutGroupContext = createContext<LayoutIdRegistry | null>(null);
