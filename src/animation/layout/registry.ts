// Stashed on globalThis, not a module-level variable, so duplicate chunks (symlinked/monorepo
// packages, hot reload) share one registry instead of silently no-op'ing every transition.

import type { MeasuredRect } from './flip';

export type FlipIdEntry = { rect: MeasuredRect; node: HTMLElement };
export type FlipIdRegistry = Map<string, FlipIdEntry>;

export const FLIP_ID_REGISTRY_KEY = '__REACT_UI_ANIMATE_FLIP_ID_REGISTRY__';

export const flipIdRegistry: FlipIdRegistry = ((): FlipIdRegistry => {
  const g = globalThis as typeof globalThis & {
    [FLIP_ID_REGISTRY_KEY]?: FlipIdRegistry;
  };
  if (!g[FLIP_ID_REGISTRY_KEY]) {
    g[FLIP_ID_REGISTRY_KEY] = new Map();
  }
  return g[FLIP_ID_REGISTRY_KEY];
})();
