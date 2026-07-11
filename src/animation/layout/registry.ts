// Global registry mapping a `layoutId` to the last known rect of whichever
// element most recently claimed it. A "claim" happens on every layout effect
// flush of any element carrying that `layoutId`, so the registry naturally
// captures the last position/size before an element unmounts (the
// registration from its final render stays put) as well as before each
// re-render of a persisting element (degrading gracefully to the same
// per-node behavior as the `layout` prop). Note this is a single global map,
// so `layoutId`s should be unique per active transition group.
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

export type LayoutIdEntry = { rect: DOMRect; node: HTMLElement };
export type LayoutIdRegistry = Map<string, LayoutIdEntry>;

export const LAYOUT_ID_REGISTRY_KEY = '__REACT_UI_ANIMATE_LAYOUT_ID_REGISTRY__';

export const layoutIdRegistry: LayoutIdRegistry = ((): LayoutIdRegistry => {
  const g = globalThis as typeof globalThis & {
    [LAYOUT_ID_REGISTRY_KEY]?: LayoutIdRegistry;
  };
  if (!g[LAYOUT_ID_REGISTRY_KEY]) {
    g[LAYOUT_ID_REGISTRY_KEY] = new Map();
  }
  return g[LAYOUT_ID_REGISTRY_KEY];
})();
