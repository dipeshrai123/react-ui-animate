import { clamp } from '../../utils';

export const DEFAULT_VELOCITY_LIMIT = 20;

export interface KinematicSample {
  x: number;
  y: number;
  /** Typically `event.timeStamp` or `Date.now()`. */
  t: number;
}

export interface KinematicState {
  prev: KinematicSample;
  velocity: { x: number; y: number };
}

export function createKinematicState(sample: KinematicSample): KinematicState {
  return { prev: sample, velocity: { x: 0, y: 0 } };
}

// Shared velocity math previously duplicated (dx/dt/1000, clamped) across
// DragGesture, MoveGesture, WheelGesture and ScrollGesture.
export function updateKinematics(
  state: KinematicState,
  sample: KinematicSample,
  velocityLimit: number = DEFAULT_VELOCITY_LIMIT
): KinematicState {
  const dt = Math.max((sample.t - state.prev.t) / 1000, 1e-6);
  const dx = sample.x - state.prev.x;
  const dy = sample.y - state.prev.y;

  return {
    prev: { x: sample.x, y: sample.y, t: sample.t },
    velocity: {
      x: clamp(dx / dt / 1000, -velocityLimit, velocityLimit),
      y: clamp(dy / dt / 1000, -velocityLimit, velocityLimit),
    },
  };
}

// Total displacement since a gesture's starting point, optionally locked to
// a single axis. Shared by DragGesture/MoveGesture; Wheel/Scroll movement is
// a per-event delta instead and doesn't use this.
export function computeMovement(
  start: { x: number; y: number },
  current: { x: number; y: number },
  axis?: 'x' | 'y'
): { x: number; y: number } {
  return {
    x: axis === 'y' ? 0 : current.x - start.x,
    y: axis === 'x' ? 0 : current.y - start.y,
  };
}
