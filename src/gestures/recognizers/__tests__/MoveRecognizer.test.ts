import { MoveRecognizer } from '../MoveRecognizer';
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
    pointers: new Map(),
    requestActivation: () => true,
    yieldTo: () => {},
  };
}

describe('MoveRecognizer', () => {
  it('fires onStart then onChange on the first hover move', () => {
    const onStart = jest.fn();
    const onChange = jest.fn();
    const r = new MoveRecognizer({}, { onStart, onChange });
    const ctx = fakeCtx();

    r.onHoverMove(fakeEvent(10, 10), ctx);

    expect(r.phase).toBe(GesturePhase.ACTIVE);
    expect(onStart).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0].movement).toEqual({ x: 0, y: 0 });
  });

  it('does not re-fire onStart on subsequent moves', () => {
    const onStart = jest.fn();
    const onChange = jest.fn();
    const r = new MoveRecognizer({}, { onStart, onChange });
    const ctx = fakeCtx();

    r.onHoverMove(fakeEvent(10, 10), ctx);
    r.onHoverMove(fakeEvent(20, 15), ctx);

    expect(onStart).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledTimes(2);
    expect(onChange.mock.calls[1][0].movement).toEqual({ x: 10, y: 5 });
  });

  it('fires onEnd + onFinalize on hover end, then resets to UNDETERMINED', () => {
    const onEnd = jest.fn();
    const onFinalize = jest.fn();
    const r = new MoveRecognizer({}, { onEnd, onFinalize });
    const ctx = fakeCtx();

    r.onHoverMove(fakeEvent(10, 10), ctx);
    r.onHoverEnd(fakeEvent(10, 10), ctx);

    expect(onEnd).toHaveBeenCalledTimes(1);
    expect(onFinalize).toHaveBeenCalledTimes(1);
    expect(r.phase).toBe(GesturePhase.UNDETERMINED);
  });

  it('does not reset movement start position across a leave/re-enter cycle', () => {
    const onChange = jest.fn();
    const r = new MoveRecognizer({}, { onChange });
    const ctx = fakeCtx();

    r.onHoverMove(fakeEvent(0, 0), ctx);
    r.onHoverEnd(fakeEvent(0, 0), ctx);

    // Re-enter far away — movement should still be measured from the very
    // first move this recognizer ever saw (0,0), not reset on re-entry.
    r.onHoverMove(fakeEvent(50, 0), ctx);

    expect(onChange.mock.calls[onChange.mock.calls.length - 1][0].movement).toEqual({
      x: 50,
      y: 0,
    });
  });

  it('computes offset relative to the target element bounding rect', () => {
    const el = document.createElement('div');
    jest.spyOn(el, 'getBoundingClientRect').mockReturnValue({
      left: 100,
      top: 50,
    } as DOMRect);

    const onChange = jest.fn();
    const r = new MoveRecognizer({}, { onChange });
    r.onHoverMove(fakeEvent(150, 80), fakeCtx(el));

    expect(onChange.mock.calls[0][0].offset).toEqual({ x: 50, y: 30 });
  });

  it('does nothing when disabled', () => {
    const onStart = jest.fn();
    const r = new MoveRecognizer({ enabled: false }, { onStart });
    r.onHoverMove(fakeEvent(10, 10), fakeCtx());

    expect(onStart).not.toHaveBeenCalled();
    expect(r.phase).toBe(GesturePhase.UNDETERMINED);
  });
});
