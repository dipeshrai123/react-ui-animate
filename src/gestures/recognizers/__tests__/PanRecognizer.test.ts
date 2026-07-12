import { PanRecognizer } from '../PanRecognizer';
import { GesturePhase } from '../../engine/phases';
import type { RecognizerContext } from '../../engine/GestureRecognizer';
import { createKinematicState } from '../../engine/PointerTracker';

function fakeEvent(x: number, y: number, t = 0): PointerEvent {
  return { clientX: x, clientY: y, timeStamp: t } as PointerEvent;
}

function fakeCtx(target: HTMLElement | Window = document.createElement('div')): RecognizerContext {
  return {
    target,
    kinematics: createKinematicState({ x: 0, y: 0, t: 0 }),
    requestActivation: () => true,
    yieldTo: () => {},
  };
}

describe('PanRecognizer', () => {
  it('starts UNDETERMINED', () => {
    const r = new PanRecognizer({}, {});
    expect(r.phase).toBe(GesturePhase.UNDETERMINED);
  });

  it('moves to POSSIBLE on pointerdown', () => {
    const r = new PanRecognizer({}, {});
    r.onPointerDown(fakeEvent(0, 0), fakeCtx());
    expect(r.phase).toBe(GesturePhase.POSSIBLE);
  });

  it('stays POSSIBLE under minDistance and does not call onStart', () => {
    const onStart = jest.fn();
    const r = new PanRecognizer({ minDistance: 10 }, { onStart });
    const ctx = fakeCtx();
    r.onPointerDown(fakeEvent(0, 0), ctx);
    r.onPointerMove(fakeEvent(3, 0), ctx);

    expect(r.phase).toBe(GesturePhase.POSSIBLE);
    expect(onStart).not.toHaveBeenCalled();
  });

  it('becomes ACTIVE once minDistance is crossed, firing onStart then onChange', () => {
    const onStart = jest.fn();
    const onChange = jest.fn();
    const r = new PanRecognizer({ minDistance: 10 }, { onStart, onChange });
    const ctx = fakeCtx();
    r.onPointerDown(fakeEvent(0, 0), ctx);
    r.onPointerMove(fakeEvent(20, 0), ctx);

    expect(r.phase).toBe(GesturePhase.ACTIVE);
    expect(onStart).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0].movement).toEqual({ x: 20, y: 0 });
  });

  it('fires onChange on subsequent ACTIVE moves without re-firing onStart', () => {
    const onStart = jest.fn();
    const onChange = jest.fn();
    const r = new PanRecognizer({ minDistance: 10 }, { onStart, onChange });
    const ctx = fakeCtx();
    r.onPointerDown(fakeEvent(0, 0), ctx);
    r.onPointerMove(fakeEvent(20, 0), ctx);
    r.onPointerMove(fakeEvent(30, 0), ctx);

    expect(onStart).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it('FAILED + onFinalize (no onEnd) if released before minDistance', () => {
    const onEnd = jest.fn();
    const onFinalize = jest.fn();
    const r = new PanRecognizer({ minDistance: 10 }, { onEnd, onFinalize });
    const ctx = fakeCtx();
    r.onPointerDown(fakeEvent(0, 0), ctx);
    r.onPointerMove(fakeEvent(3, 0), ctx);
    r.onPointerUp(fakeEvent(3, 0), ctx);

    expect(onEnd).not.toHaveBeenCalled();
    expect(onFinalize).toHaveBeenCalledTimes(1);
    expect(onFinalize.mock.calls[0][0].phase).toBe(GesturePhase.FAILED);
    expect(r.phase).toBe(GesturePhase.UNDETERMINED);
  });

  it('END + onFinalize on release while ACTIVE', () => {
    const onEnd = jest.fn();
    const onFinalize = jest.fn();
    const r = new PanRecognizer({ minDistance: 10 }, { onEnd, onFinalize });
    const ctx = fakeCtx();
    r.onPointerDown(fakeEvent(0, 0), ctx);
    r.onPointerMove(fakeEvent(20, 0), ctx);
    r.onPointerUp(fakeEvent(20, 0), ctx);

    expect(onEnd).toHaveBeenCalledTimes(1);
    expect(onEnd.mock.calls[0][0].phase).toBe(GesturePhase.END);
    expect(onFinalize).toHaveBeenCalledTimes(1);
    expect(r.phase).toBe(GesturePhase.UNDETERMINED);
  });

  it('CANCELLED + onFinalize on pointercancel while ACTIVE', () => {
    const onFinalize = jest.fn();
    const r = new PanRecognizer({ minDistance: 10 }, { onFinalize });
    const ctx = fakeCtx();
    r.onPointerDown(fakeEvent(0, 0), ctx);
    r.onPointerMove(fakeEvent(20, 0), ctx);
    r.onPointerCancel(fakeEvent(20, 0), ctx);

    expect(onFinalize).toHaveBeenCalledTimes(1);
    expect(onFinalize.mock.calls[0][0].phase).toBe(GesturePhase.CANCELLED);
  });

  it('respects an axis lock', () => {
    const onChange = jest.fn();
    const r = new PanRecognizer({ minDistance: 5, axis: 'x' }, { onChange });
    const ctx = fakeCtx();
    r.onPointerDown(fakeEvent(0, 0), ctx);
    r.onPointerMove(fakeEvent(20, 50), ctx);

    expect(onChange.mock.calls[0][0].movement).toEqual({ x: 20, y: 0 });
  });

  it('does nothing when disabled', () => {
    const r = new PanRecognizer({ enabled: false, minDistance: 0 }, {});
    r.onPointerDown(fakeEvent(0, 0), fakeCtx());

    expect(r.phase).toBe(GesturePhase.UNDETERMINED);
  });

  it('marks down=true only once BEGAN/ACTIVE, not while POSSIBLE', () => {
    const events: any[] = [];
    const r = new PanRecognizer({ minDistance: 10 }, { onChange: (e) => events.push(e) });
    const ctx = fakeCtx();
    r.onPointerDown(fakeEvent(0, 0), ctx);
    r.onPointerMove(fakeEvent(20, 0), ctx);

    expect(events[0].down).toBe(true);
  });
});
