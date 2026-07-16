let overrideValue: boolean | null = null;

function getMediaQueryList(): MediaQueryList | null {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return null;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)');
}

// True when the OS-level `prefers-reduced-motion: reduce` query matches, or
// when `setReducedMotion` forced a value. Drivers check this once per
// `start()` so overriding it mid-animation only affects animations that
// start afterward.
export function isReducedMotionEnabled(): boolean {
  if (overrideValue !== null) return overrideValue;
  return getMediaQueryList()?.matches ?? false;
}

// Force reduced motion on/off for every animation driven through this
// library, overriding the `prefers-reduced-motion` media query. Pass `null`
// to go back to following the media query.
export function setReducedMotion(value: boolean | null): void {
  overrideValue = value;
}
