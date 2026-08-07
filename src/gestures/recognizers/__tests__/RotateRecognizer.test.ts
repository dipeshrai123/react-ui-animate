import { RotateRecognizer } from '../RotateRecognizer';
import { GesturePhase } from '../../engine/phases';
import type { RecognizerContext } from '../../engine/GestureRecognizer';
import { createKinematicState } from '../../engine/PointerTracker';

function fakeEvent(t = 0): PointerEvent {
  return { timeStamp: t, preventDefault: () => {} } as unknown as PointerEvent;
}

function fakeCtx(
  pointers: Map<number, { x: number; y: number }>,
  target: HTMLElement | Window = document.createElement('div')
): RecognizerContext {
  return {
    target,
    kinematics: createKinematicState({ x: 0, y: 0, t: 0 }),
    pointers,
    requestActivation: () => true,
    yieldTo: () => {},
  };
}

function twoPointers(
  ax: number,
  ay: number,
  bx: number,
  by: number
): Map<number, { x: number; y: number }> {
  return new Map([
    [1, { x: ax, y: ay }],
    [2, { x: bx, y: by }],
  ]);
}

// Places the second pointer at `radius` from the first, at `angleDeg`
// degrees (standard math convention, atan2(y, x)).
function pointerAtAngle(angleDeg: number, radius = 100) {
  const rad = (angleDeg * Math.PI) / 180;
  return twoPointers(0, 0, radius * Math.cos(rad), radius * Math.sin(rad));
}

describe('RotateRecognizer', () => {
  it('starts UNDETERMINED', () => {
    const r = new RotateRecognizer({}, {});
    expect(r.phase).toBe(GesturePhase.UNDETERMINED);
  });

  it('moves to POSSIBLE once a second pointer is tracked', () => {
    const r = new RotateRecognizer({}, {});
    r.onPointerDown(fakeEvent(), fakeCtx(pointerAtAngle(0)));
    expect(r.phase).toBe(GesturePhase.POSSIBLE);
  });

  it('stays POSSIBLE under the rotation threshold', () => {
    const onStart = jest.fn();
    const r = new RotateRecognizer({ threshold: 5 }, { onStart });
    r.onPointerDown(fakeEvent(0), fakeCtx(pointerAtAngle(0)));
    r.onPointerMove(fakeEvent(10), fakeCtx(pointerAtAngle(2)));

    expect(r.phase).toBe(GesturePhase.POSSIBLE);
    expect(onStart).not.toHaveBeenCalled();
  });

  it('becomes ACTIVE once the rotation threshold is crossed, reporting exact degrees', () => {
    const onStart = jest.fn();
    const onChange = jest.fn();
    const r = new RotateRecognizer({ threshold: 5 }, { onStart, onChange });

    r.onPointerDown(fakeEvent(0), fakeCtx(pointerAtAngle(0)));
    r.onPointerMove(fakeEvent(10), fakeCtx(pointerAtAngle(30)));

    expect(r.phase).toBe(GesturePhase.ACTIVE);
    expect(onStart).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0].rotation).toBeCloseTo(30, 5);
  });

  it('accumulates rotation continuously across the atan2 wrap boundary (179deg -> -179deg)', () => {
    const onChange = jest.fn();
    const r = new RotateRecognizer({ threshold: 1 }, { onChange });

    r.onPointerDown(fakeEvent(0), fakeCtx(pointerAtAngle(170)));
    // Crosses the +180/-180 boundary: 170 -> 179 -> -179 -> -170, a
    // continuous +20deg sweep, not a -340deg jump.
    r.onPointerMove(fakeEvent(10), fakeCtx(pointerAtAngle(179)));
    r.onPointerMove(fakeEvent(20), fakeCtx(pointerAtAngle(-179)));
    r.onPointerMove(fakeEvent(30), fakeCtx(pointerAtAngle(-170)));

    const lastRotation = onChange.mock.calls[onChange.mock.calls.length - 1][0].rotation;
    expect(lastRotation).toBeCloseTo(20, 5);
  });

  it('reports the pointer-pair midpoint as center', () => {
    const onChange = jest.fn();
    const r = new RotateRecognizer({ threshold: 5 }, { onChange });

    r.onPointerDown(fakeEvent(0), fakeCtx(twoPointers(0, 0, 100, 0)));
    r.onPointerMove(fakeEvent(10), fakeCtx(twoPointers(0, 0, 0, 100)));

    expect(onChange.mock.calls[0][0].center.x).toBeCloseTo(0, 5);
    expect(onChange.mock.calls[0][0].center.y).toBeCloseTo(50, 5);
  });

  it('FAILED + onFinalize (no onEnd) if a pointer lifts before the threshold', () => {
    const onEnd = jest.fn();
    const onFinalize = jest.fn();
    const r = new RotateRecognizer({ threshold: 20 }, { onEnd, onFinalize });

    r.onPointerDown(fakeEvent(0), fakeCtx(pointerAtAngle(0)));
    r.onPointerMove(fakeEvent(10), fakeCtx(pointerAtAngle(5)));
    r.onPointerUp(fakeEvent(20), fakeCtx(pointerAtAngle(5)));

    expect(onEnd).not.toHaveBeenCalled();
    expect(onFinalize).toHaveBeenCalledTimes(1);
    expect(onFinalize.mock.calls[0][0].phase).toBe(GesturePhase.FAILED);
    expect(r.phase).toBe(GesturePhase.UNDETERMINED);
  });

  it('END + onFinalize when a pointer lifts while ACTIVE', () => {
    const onEnd = jest.fn();
    const onFinalize = jest.fn();
    const r = new RotateRecognizer({ threshold: 5 }, { onEnd, onFinalize });

    r.onPointerDown(fakeEvent(0), fakeCtx(pointerAtAngle(0)));
    r.onPointerMove(fakeEvent(10), fakeCtx(pointerAtAngle(30)));
    r.onPointerUp(fakeEvent(20), fakeCtx(pointerAtAngle(30)));

    expect(onEnd).toHaveBeenCalledTimes(1);
    expect(onEnd.mock.calls[0][0].phase).toBe(GesturePhase.END);
    expect(onFinalize).toHaveBeenCalledTimes(1);
    expect(r.phase).toBe(GesturePhase.UNDETERMINED);
  });

  it('CANCELLED + onFinalize on pointercancel while ACTIVE', () => {
    const onFinalize = jest.fn();
    const r = new RotateRecognizer({ threshold: 5 }, { onFinalize });

    r.onPointerDown(fakeEvent(0), fakeCtx(pointerAtAngle(0)));
    r.onPointerMove(fakeEvent(10), fakeCtx(pointerAtAngle(30)));
    r.onPointerCancel(fakeEvent(20), fakeCtx(pointerAtAngle(30)));

    expect(onFinalize).toHaveBeenCalledTimes(1);
    expect(onFinalize.mock.calls[0][0].phase).toBe(GesturePhase.CANCELLED);
  });

  it('does nothing when disabled', () => {
    const r = new RotateRecognizer({ enabled: false }, {});
    r.onPointerDown(fakeEvent(), fakeCtx(pointerAtAngle(0)));
    expect(r.phase).toBe(GesturePhase.UNDETERMINED);
  });
});
