import {
  createKinematicState,
  updateKinematics,
  computeMovement,
} from '../PointerTracker';

describe('updateKinematics', () => {
  it('computes velocity from displacement over time', () => {
    const state = createKinematicState({ x: 0, y: 0, t: 0 });
    const next = updateKinematics(state, { x: 100, y: 0, t: 100 });

    // dx=100, dt=0.1s -> raw vx = 100 / 0.1 / 1000 = 1
    expect(next.velocity.x).toBeCloseTo(1, 5);
    expect(next.velocity.y).toBe(0);
    expect(next.prev).toEqual({ x: 100, y: 0, t: 100 });
  });

  it('clamps velocity to the configured limit', () => {
    const state = createKinematicState({ x: 0, y: 0, t: 0 });
    const next = updateKinematics(state, { x: 100000, y: 0, t: 1 }, 20);

    expect(next.velocity.x).toBe(20);
  });

  it('clamps to a negative limit for reverse movement', () => {
    const state = createKinematicState({ x: 0, y: 0, t: 0 });
    const next = updateKinematics(state, { x: -100000, y: 0, t: 1 }, 20);

    expect(next.velocity.x).toBe(-20);
  });

  it('avoids division by zero when dt is 0', () => {
    const state = createKinematicState({ x: 0, y: 0, t: 100 });
    const next = updateKinematics(state, { x: 10, y: 10, t: 100 }, 20);

    expect(Number.isFinite(next.velocity.x)).toBe(true);
    expect(Number.isFinite(next.velocity.y)).toBe(true);
  });
});

describe('computeMovement', () => {
  it('returns full displacement with no axis lock', () => {
    expect(computeMovement({ x: 10, y: 20 }, { x: 15, y: 5 })).toEqual({
      x: 5,
      y: -15,
    });
  });

  it('zeroes y when locked to x axis', () => {
    expect(computeMovement({ x: 0, y: 0 }, { x: 5, y: 5 }, 'x')).toEqual({
      x: 5,
      y: 0,
    });
  });

  it('zeroes x when locked to y axis', () => {
    expect(computeMovement({ x: 0, y: 0 }, { x: 5, y: 5 }, 'y')).toEqual({
      x: 0,
      y: 5,
    });
  });
});
