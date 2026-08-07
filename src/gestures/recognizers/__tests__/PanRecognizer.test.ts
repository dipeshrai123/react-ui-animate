import { PanRecognizer } from '../PanRecognizer';
import { GesturePhase } from '../../engine/phases';
import type { RecognizerContext } from '../../engine/GestureRecognizer';
import { createKinematicState } from '../../engine/PointerTracker';

beforeAll(() => {
  HTMLElement.prototype.setPointerCapture = jest.fn();
  HTMLElement.prototype.releasePointerCapture = jest.fn();
});

afterEach(() => {
  jest.clearAllMocks();
});

function fakeEvent(x: number, y: number, t = 0): PointerEvent {
  return {
    clientX: x,
    clientY: y,
    timeStamp: t,
    pointerId: 1,
    preventDefault: () => {},
  } as unknown as PointerEvent;
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

  // Regression: setPointerCapture/preventDefault were dropped when porting
  // DragGesture's logic into this recognizer, which let the browser's
  // default text-selection drag run alongside the gesture (visible as
  // selected/highlighted text while dragging list items).
  it('captures the pointer and prevents default once the drag activates, releases on up', () => {
    const el = document.createElement('div');
    const captureSpy = jest.spyOn(el, 'setPointerCapture');
    const releaseSpy = jest.spyOn(el, 'releasePointerCapture');
    const r = new PanRecognizer({ minDistance: 5 }, {});
    const ctx = fakeCtx(el);

    r.onPointerDown(fakeEvent(0, 0), ctx);
    expect(captureSpy).not.toHaveBeenCalled(); // not yet — still POSSIBLE

    const moveEvent = fakeEvent(20, 0);
    const preventDefaultSpy = jest.spyOn(moveEvent, 'preventDefault');
    r.onPointerMove(moveEvent, ctx);

    expect(captureSpy).toHaveBeenCalledTimes(1);
    expect(preventDefaultSpy).toHaveBeenCalledTimes(1);

    r.onPointerUp(fakeEvent(20, 0), ctx);
    expect(releaseSpy).toHaveBeenCalledTimes(1);
  });

  it('does not capture the pointer or prevent default for a plain click (never crosses minDistance)', () => {
    const el = document.createElement('div');
    const captureSpy = jest.spyOn(el, 'setPointerCapture');
    const r = new PanRecognizer({ minDistance: 10 }, {});
    const ctx = fakeCtx(el);

    r.onPointerDown(fakeEvent(0, 0), ctx);
    r.onPointerMove(fakeEvent(2, 0), ctx); // under minDistance
    r.onPointerUp(fakeEvent(2, 0), ctx);

    expect(captureSpy).not.toHaveBeenCalled();
  });

  it('marks down=true only once BEGAN/ACTIVE, not while POSSIBLE', () => {
    const events: any[] = [];
    const r = new PanRecognizer({ minDistance: 10 }, { onChange: (e) => events.push(e) });
    const ctx = fakeCtx();
    r.onPointerDown(fakeEvent(0, 0), ctx);
    r.onPointerMove(fakeEvent(20, 0), ctx);

    expect(events[0].down).toBe(true);
  });

  describe('click suppression', () => {
    // Regression test: suppressNextClick was previously armed at the
    // threshold-cross point (onPointerMove) rather than at drag-end
    // (onPointerUp). Its fallback cleanup is a 0ms macrotask, so any real
    // drag lasting longer than that — i.e. any real drag at all — would
    // let the fallback remove the suppressor long before pointerup/click
    // actually happened, silently un-suppressing the click. Uses real
    // timers deliberately: this class of bug is invisible with
    // synchronous/fake-timer dispatch since there's no elapsed time for the
    // fallback to race against.
    it('still suppresses the synthetic click after a real-length drag', (done) => {
      const el = document.createElement('div');
      document.body.appendChild(el);
      const onDomClick = jest.fn();
      el.addEventListener('click', onDomClick);

      const r = new PanRecognizer({ minDistance: 5 }, {});
      const ctx = fakeCtx(el);

      r.onPointerDown(fakeEvent(0, 0, 0), ctx);
      r.onPointerMove(fakeEvent(20, 0, 10), ctx); // crosses threshold -> ACTIVE

      // Simulate a real drag that takes noticeably longer than a macrotask
      // tick before the user releases.
      setTimeout(() => {
        r.onPointerUp(fakeEvent(20, 0, 300), ctx);
        el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

        expect(onDomClick).not.toHaveBeenCalled();
        el.remove();
        done();
      }, 300);
    });
  });
});
