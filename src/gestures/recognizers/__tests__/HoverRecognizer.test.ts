import { HoverRecognizer } from '../HoverRecognizer';
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

describe('HoverRecognizer', () => {
  it('fires onStart then onChange on the first hover move, both hovering:true', () => {
    const onStart = jest.fn();
    const onChange = jest.fn();
    const r = new HoverRecognizer({}, { onStart, onChange });
    const ctx = fakeCtx();

    r.onHoverMove(fakeEvent(10, 10), ctx);

    expect(r.phase).toBe(GesturePhase.ACTIVE);
    expect(onStart).toHaveBeenCalledTimes(1);
    expect(onStart.mock.calls[0][0].hovering).toBe(true);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0].hovering).toBe(true);
  });

  it('does not re-fire onStart on subsequent moves', () => {
    const onStart = jest.fn();
    const onChange = jest.fn();
    const r = new HoverRecognizer({}, { onStart, onChange });
    const ctx = fakeCtx();

    r.onHoverMove(fakeEvent(10, 10), ctx);
    r.onHoverMove(fakeEvent(20, 15), ctx);

    expect(onStart).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it('fires onEnd + onFinalize with hovering:false on hover end, then resets to UNDETERMINED', () => {
    const onEnd = jest.fn();
    const onFinalize = jest.fn();
    const r = new HoverRecognizer({}, { onEnd, onFinalize });
    const ctx = fakeCtx();

    r.onHoverMove(fakeEvent(10, 10), ctx);
    r.onHoverEnd(fakeEvent(10, 10), ctx);

    expect(onEnd).toHaveBeenCalledTimes(1);
    expect(onEnd.mock.calls[0][0].hovering).toBe(false);
    expect(onFinalize).toHaveBeenCalledTimes(1);
    expect(r.phase).toBe(GesturePhase.UNDETERMINED);
  });

  it('fires onStart again on re-entry after a leave', () => {
    const onStart = jest.fn();
    const r = new HoverRecognizer({}, { onStart });
    const ctx = fakeCtx();

    r.onHoverMove(fakeEvent(0, 0), ctx);
    r.onHoverEnd(fakeEvent(0, 0), ctx);
    r.onHoverMove(fakeEvent(50, 0), ctx);

    expect(onStart).toHaveBeenCalledTimes(2);
  });

  it('computes offset relative to the target element bounding rect', () => {
    const el = document.createElement('div');
    jest.spyOn(el, 'getBoundingClientRect').mockReturnValue({
      left: 100,
      top: 50,
    } as DOMRect);

    const onChange = jest.fn();
    const r = new HoverRecognizer({}, { onChange });
    r.onHoverMove(fakeEvent(150, 80), fakeCtx(el));

    expect(onChange.mock.calls[0][0].offset).toEqual({ x: 50, y: 30 });
  });

  it('populates target on the emitted event', () => {
    const el = document.createElement('div');
    const onChange = jest.fn();
    const r = new HoverRecognizer({}, { onChange });
    r.onHoverMove(fakeEvent(10, 10), fakeCtx(el));

    expect(onChange.mock.calls[0][0].target).toBe(el);
  });

  it('does nothing when disabled', () => {
    const onStart = jest.fn();
    const r = new HoverRecognizer({ enabled: false }, { onStart });
    r.onHoverMove(fakeEvent(10, 10), fakeCtx());

    expect(onStart).not.toHaveBeenCalled();
    expect(r.phase).toBe(GesturePhase.UNDETERMINED);
  });
});
