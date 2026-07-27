let overrideValue: boolean | null = null;

function getMediaQueryList(): MediaQueryList | null {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return null;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)');
}

// Drivers check this once per start(), so overriding mid-animation only affects animations that start afterward.
export function isReducedMotionEnabled(): boolean {
  if (overrideValue !== null) return overrideValue;
  return getMediaQueryList()?.matches ?? false;
}

export function setReducedMotion(value: boolean | null): void {
  overrideValue = value;
}
