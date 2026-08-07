import { PinchRecognizer } from '../PinchRecognizer';
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

describe('PinchRecognizer', () => {
  it('starts UNDETERMINED', () => {
    const r = new PinchRecognizer({}, {});
    expect(r.phase).toBe(GesturePhase.UNDETERMINED);
  });

  it('stays UNDETERMINED on pointerdown with only one pointer tracked', () => {
    const r = new PinchRecognizer({}, {});
    r.onPointerDown(fakeEvent(), fakeCtx(new Map([[1, { x: 0, y: 0 }]])));
    expect(r.phase).toBe(GesturePhase.UNDETERMINED);
  });

  it('moves to POSSIBLE once a second pointer is tracked', () => {
    const r = new PinchRecognizer({}, {});
    r.onPointerDown(fakeEvent(), fakeCtx(twoPointers(0, 0, 100, 0)));
    expect(r.phase).toBe(GesturePhase.POSSIBLE);
  });

  it('stays POSSIBLE under the scale threshold and does not call onStart', () => {
    const onStart = jest.fn();
    const r = new PinchRecognizer({ threshold: 0.1 }, { onStart });
    const ctx1 = fakeCtx(twoPointers(0, 0, 100, 0));
    r.onPointerDown(fakeEvent(0), ctx1);

    // 100 -> 105: scale 1.05, under the 0.1 threshold.
    const ctx2 = fakeCtx(twoPointers(0, 0, 105, 0));
    r.onPointerMove(fakeEvent(10), ctx2);

    expect(r.phase).toBe(GesturePhase.POSSIBLE);
    expect(onStart).not.toHaveBeenCalled();
  });

  it('becomes ACTIVE once the scale threshold is crossed, reporting exact scale', () => {
    const onStart = jest.fn();
    const onChange = jest.fn();
    const r = new PinchRecognizer({ threshold: 0.1 }, { onStart, onChange });

    r.onPointerDown(fakeEvent(0), fakeCtx(twoPointers(0, 0, 100, 0)));
    // 100px apart -> 200px apart: scale exactly 2.0.
    r.onPointerMove(fakeEvent(10), fakeCtx(twoPointers(0, 0, 200, 0)));

    expect(r.phase).toBe(GesturePhase.ACTIVE);
    expect(onStart).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0].scale).toBeCloseTo(2, 5);
  });

  it('reports the pointer-pair midpoint as center', () => {
    const onChange = jest.fn();
    const r = new PinchRecognizer({ threshold: 0.1 }, { onChange });

    r.onPointerDown(fakeEvent(0), fakeCtx(twoPointers(0, 0, 100, 0)));
    r.onPointerMove(fakeEvent(10), fakeCtx(twoPointers(0, 0, 200, 0)));

    expect(onChange.mock.calls[0][0].center).toEqual({ x: 100, y: 0 });
  });

  it('fires onChange on subsequent ACTIVE moves without re-firing onStart', () => {
    const onStart = jest.fn();
    const onChange = jest.fn();
    const r = new PinchRecognizer({ threshold: 0.1 }, { onStart, onChange });

    r.onPointerDown(fakeEvent(0), fakeCtx(twoPointers(0, 0, 100, 0)));
    r.onPointerMove(fakeEvent(10), fakeCtx(twoPointers(0, 0, 200, 0)));
    r.onPointerMove(fakeEvent(20), fakeCtx(twoPointers(0, 0, 250, 0)));

    expect(onStart).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it('FAILED + onFinalize (no onEnd) if a pointer lifts before the threshold', () => {
    const onEnd = jest.fn();
    const onFinalize = jest.fn();
    const r = new PinchRecognizer({ threshold: 0.5 }, { onEnd, onFinalize });

    const ctx = fakeCtx(twoPointers(0, 0, 100, 0));
    r.onPointerDown(fakeEvent(0), ctx);
    r.onPointerMove(fakeEvent(10), fakeCtx(twoPointers(0, 0, 105, 0)));
    r.onPointerUp(fakeEvent(20), fakeCtx(twoPointers(0, 0, 105, 0)));

    expect(onEnd).not.toHaveBeenCalled();
    expect(onFinalize).toHaveBeenCalledTimes(1);
    expect(onFinalize.mock.calls[0][0].phase).toBe(GesturePhase.FAILED);
    expect(r.phase).toBe(GesturePhase.UNDETERMINED);
  });

  it('END + onFinalize when a pointer lifts while ACTIVE', () => {
    const onEnd = jest.fn();
    const onFinalize = jest.fn();
    const r = new PinchRecognizer({ threshold: 0.1 }, { onEnd, onFinalize });

    r.onPointerDown(fakeEvent(0), fakeCtx(twoPointers(0, 0, 100, 0)));
    r.onPointerMove(fakeEvent(10), fakeCtx(twoPointers(0, 0, 200, 0)));
    r.onPointerUp(fakeEvent(20), fakeCtx(twoPointers(0, 0, 200, 0)));

    expect(onEnd).toHaveBeenCalledTimes(1);
    expect(onEnd.mock.calls[0][0].phase).toBe(GesturePhase.END);
    expect(onFinalize).toHaveBeenCalledTimes(1);
    expect(r.phase).toBe(GesturePhase.UNDETERMINED);
  });

  it('CANCELLED + onFinalize on pointercancel while ACTIVE', () => {
    const onFinalize = jest.fn();
    const r = new PinchRecognizer({ threshold: 0.1 }, { onFinalize });

    r.onPointerDown(fakeEvent(0), fakeCtx(twoPointers(0, 0, 100, 0)));
    r.onPointerMove(fakeEvent(10), fakeCtx(twoPointers(0, 0, 200, 0)));
    r.onPointerCancel(fakeEvent(20), fakeCtx(twoPointers(0, 0, 200, 0)));

    expect(onFinalize).toHaveBeenCalledTimes(1);
    expect(onFinalize.mock.calls[0][0].phase).toBe(GesturePhase.CANCELLED);
  });

  it('does not finish while a third pointer is still down', () => {
    const onEnd = jest.fn();
    const r = new PinchRecognizer({ threshold: 0.1 }, { onEnd });

    r.onPointerDown(fakeEvent(0), fakeCtx(twoPointers(0, 0, 100, 0)));
    r.onPointerMove(fakeEvent(10), fakeCtx(twoPointers(0, 0, 200, 0)));

    const threePointers = new Map([
      [1, { x: 0, y: 0 }],
      [2, { x: 200, y: 0 }],
      [3, { x: 50, y: 50 }],
    ]);
    r.onPointerUp(fakeEvent(20), fakeCtx(threePointers));

    expect(onEnd).not.toHaveBeenCalled();
    expect(r.phase).toBe(GesturePhase.ACTIVE);
  });

  it('does nothing when disabled', () => {
    const r = new PinchRecognizer({ enabled: false }, {});
    r.onPointerDown(fakeEvent(), fakeCtx(twoPointers(0, 0, 100, 0)));
    expect(r.phase).toBe(GesturePhase.UNDETERMINED);
  });
});
