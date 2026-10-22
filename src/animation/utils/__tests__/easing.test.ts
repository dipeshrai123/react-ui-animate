import { Easing } from '../easing';

describe('Easing.bezier', () => {
  it('matches points of the curve', () => {
    // x(t) and y(t) of the CSS "ease" curve for t = 0.3
    const t = 0.3;
    const x = 3 * 0.25 * t * (1 - t) ** 2 + 3 * 0.25 * t * t * (1 - t) + t ** 3;
    const y = 3 * 0.1 * t * (1 - t) ** 2 + 3 * t * t * (1 - t) + t ** 3;
    expect(Easing.bezier(0.25, 0.1, 0.25, 1)(x)).toBeCloseTo(y, 12);
  });

  it('is monotonic on steep curves', () => {
    // (1, 0, 0, 1) used to go backwards around 0.5
    const easing = Easing.bezier(1, 0, 0, 1);
    let previous = 0;
    for (let i = 0; i <= 10000; i++) {
      const y = easing(0.49 + (0.02 * i) / 10000);
      expect(y).toBeGreaterThanOrEqual(previous);
      previous = y;
    }
  });

  it('saturates outside of [0, 1] and keeps the extremes', () => {
    const ease = Easing.bezier(0.25, 0.1, 0.25, 1);
    expect(ease(0)).toBe(0);
    expect(ease(1)).toBe(1);
    expect(ease(-0.5)).toBe(0);
    expect(ease(1.5)).toBe(1);
  });
});
