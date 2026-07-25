// Global registry mapping a `flipId` to the last known rect of whichever
// element most recently claimed it. A "claim" happens on every layout effect
// flush of any element carrying that `flipId`, so the registry naturally
// captures the last position/size before an element unmounts (the
// registration from its final render stays put) as well as before each
// re-render of a persisting element (degrading gracefully to the same
// per-node behavior as the `flip` prop). Note this is a single global map,
// so `flipId`s should be unique per active transition group.
//
// Stashed on `globalThis` (rather than a plain module-level variable) so
// every copy of this module shares the SAME registry even if the host
// bundler ends up evaluating this file more than once (e.g. duplicate
// chunks from a symlinked/monorepo package, or a module re-executed by hot
// reloading) — otherwise the "old" element's registration and the "new"
// element's lookup could land in two different Maps, silently turning every
// transition into a no-op (the new element just renders at its target rect
// with no prior entry to diff against, so it appears to jump instead of
// animate).

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
