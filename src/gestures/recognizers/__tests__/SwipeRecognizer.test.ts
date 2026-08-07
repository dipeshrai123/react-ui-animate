import { SwipeRecognizer } from '../SwipeRecognizer';
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

function fakeCtx(
  target: HTMLElement | Window = document.createElement('div'),
  velocity: { x: number; y: number } = { x: 0, y: 0 }
): RecognizerContext {
  return {
    target,
    kinematics: { ...createKinematicState({ x: 0, y: 0, t: 0 }), velocity },
    pointers: new Map(),
    requestActivation: () => true,
    yieldTo: () => {},
  };
}

describe('SwipeRecognizer', () => {
  it('starts UNDETERMINED', () => {
    const r = new SwipeRecognizer({}, {});
    expect(r.phase).toBe(GesturePhase.UNDETERMINED);
  });

  it('moves to POSSIBLE and captures the pointer on pointerdown', () => {
    const el = document.createElement('div');
    const captureSpy = jest.spyOn(el, 'setPointerCapture');
    const r = new SwipeRecognizer({}, {});
    r.onPointerDown(fakeEvent(0, 0), fakeCtx(el));

    expect(r.phase).toBe(GesturePhase.POSSIBLE);
    expect(captureSpy).toHaveBeenCalledTimes(1);
  });

  it('fires onSwipe with direction "right" when horizontal distance and velocity qualify', () => {
    const onSwipe = jest.fn();
    const r = new SwipeRecognizer({}, { onSwipe });
    const ctx = fakeCtx(document.createElement('div'), { x: 1, y: 0 });

    r.onPointerDown(fakeEvent(0, 0), ctx);
    r.onPointerMove(fakeEvent(50, 0));
    r.onPointerUp(fakeEvent(50, 0), ctx);

    expect(onSwipe).toHaveBeenCalledTimes(1);
    expect(onSwipe.mock.calls[0][0].direction).toBe('right');
    expect(onSwipe.mock.calls[0][0].movement).toEqual({ x: 50, y: 0 });
    expect(r.phase).toBe(GesturePhase.UNDETERMINED);
  });

  it('fires onSwipe with direction "left"', () => {
    const onSwipe = jest.fn();
    const r = new SwipeRecognizer({}, { onSwipe });
    const ctx = fakeCtx(document.createElement('div'), { x: -1, y: 0 });

    r.onPointerDown(fakeEvent(0, 0), ctx);
    r.onPointerMove(fakeEvent(-50, 0));
    r.onPointerUp(fakeEvent(-50, 0), ctx);

    expect(onSwipe.mock.calls[0][0].direction).toBe('left');
  });

  it('fires onSwipe with direction "down"', () => {
    const onSwipe = jest.fn();
    const r = new SwipeRecognizer({}, { onSwipe });
    const ctx = fakeCtx(document.createElement('div'), { x: 0, y: 1 });

    r.onPointerDown(fakeEvent(0, 0), ctx);
    r.onPointerMove(fakeEvent(0, 50));
    r.onPointerUp(fakeEvent(0, 50), ctx);

    expect(onSwipe.mock.calls[0][0].direction).toBe('down');
  });

  it('fires onSwipe with direction "up"', () => {
    const onSwipe = jest.fn();
    const r = new SwipeRecognizer({}, { onSwipe });
    const ctx = fakeCtx(document.createElement('div'), { x: 0, y: -1 });

    r.onPointerDown(fakeEvent(0, 0), ctx);
    r.onPointerMove(fakeEvent(0, -50));
    r.onPointerUp(fakeEvent(0, -50), ctx);

    expect(onSwipe.mock.calls[0][0].direction).toBe('up');
  });

  it('does not fire onSwipe when distance is under distanceThreshold, even if velocity qualifies', () => {
    const onSwipe = jest.fn();
    const r = new SwipeRecognizer({ distanceThreshold: 100 }, { onSwipe });
    const ctx = fakeCtx(document.createElement('div'), { x: 5, y: 0 });

    r.onPointerDown(fakeEvent(0, 0), ctx);
    r.onPointerMove(fakeEvent(50, 0));
    r.onPointerUp(fakeEvent(50, 0), ctx);

    expect(onSwipe).not.toHaveBeenCalled();
  });

  it('does not fire onSwipe when velocity is under velocityThreshold, even if distance qualifies', () => {
    const onSwipe = jest.fn();
    const r = new SwipeRecognizer({ velocityThreshold: 5 }, { onSwipe });
    const ctx = fakeCtx(document.createElement('div'), { x: 0.1, y: 0 });

    r.onPointerDown(fakeEvent(0, 0), ctx);
    r.onPointerMove(fakeEvent(50, 0));
    r.onPointerUp(fakeEvent(50, 0), ctx);

    expect(onSwipe).not.toHaveBeenCalled();
  });

  it('resolves diagonal movement to the dominant axis', () => {
    const onSwipe = jest.fn();
    const r = new SwipeRecognizer({}, { onSwipe });
    const ctx = fakeCtx(document.createElement('div'), { x: 1, y: 0.2 });

    r.onPointerDown(fakeEvent(0, 0), ctx);
    r.onPointerMove(fakeEvent(60, 10));
    r.onPointerUp(fakeEvent(60, 10), ctx);

    expect(onSwipe.mock.calls[0][0].direction).toBe('right');
  });

  it('respects an axis lock', () => {
    const onSwipe = jest.fn();
    const r = new SwipeRecognizer({ axis: 'x' }, { onSwipe });
    const ctx = fakeCtx(document.createElement('div'), { x: 0, y: 1 });

    r.onPointerDown(fakeEvent(0, 0), ctx);
    r.onPointerMove(fakeEvent(0, 50)); // vertical movement zeroed by axis lock
    r.onPointerUp(fakeEvent(0, 50), ctx);

    expect(onSwipe).not.toHaveBeenCalled();
  });

  it('fires nothing on pointercancel', () => {
    const onSwipe = jest.fn();
    const r = new SwipeRecognizer({}, { onSwipe });
    const ctx = fakeCtx(document.createElement('div'), { x: 1, y: 0 });

    r.onPointerDown(fakeEvent(0, 0), ctx);
    r.onPointerMove(fakeEvent(50, 0));
    r.onPointerCancel(fakeEvent(50, 0));

    expect(onSwipe).not.toHaveBeenCalled();
    expect(r.phase).toBe(GesturePhase.UNDETERMINED);
  });

  it('does nothing when disabled', () => {
    const r = new SwipeRecognizer({ enabled: false }, {});
    r.onPointerDown(fakeEvent(0, 0), fakeCtx());

    expect(r.phase).toBe(GesturePhase.UNDETERMINED);
  });

  it('releases pointer capture on pointerup', () => {
    const el = document.createElement('div');
    const releaseSpy = jest.spyOn(el, 'releasePointerCapture');
    const r = new SwipeRecognizer({}, {});
    const ctx = fakeCtx(el);

    r.onPointerDown(fakeEvent(0, 0), ctx);
    r.onPointerUp(fakeEvent(2, 0), ctx);

    expect(releaseSpy).toHaveBeenCalledTimes(1);
  });

  it('releases pointer capture on pointercancel', () => {
    const el = document.createElement('div');
    const releaseSpy = jest.spyOn(el, 'releasePointerCapture');
    const r = new SwipeRecognizer({}, {});
    const ctx = fakeCtx(el);

    r.onPointerDown(fakeEvent(0, 0), ctx);
    r.onPointerCancel(fakeEvent(2, 0));

    expect(releaseSpy).toHaveBeenCalledTimes(1);
  });

  it('suppresses the synthetic click only on a qualifying swipe', () => {
    const el = document.createElement('div');
    document.body.appendChild(el);
    const onDomClick = jest.fn();
    el.addEventListener('click', onDomClick);

    const r = new SwipeRecognizer({}, {});
    const ctx = fakeCtx(el, { x: 1, y: 0 });

    r.onPointerDown(fakeEvent(0, 0), ctx);
    r.onPointerMove(fakeEvent(50, 0));
    r.onPointerUp(fakeEvent(50, 0), ctx);
    el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

    expect(onDomClick).not.toHaveBeenCalled();
    el.remove();
  });

  it('does not suppress the synthetic click on a failed (non-qualifying) release', () => {
    const el = document.createElement('div');
    document.body.appendChild(el);
    const onDomClick = jest.fn();
    el.addEventListener('click', onDomClick);

    const r = new SwipeRecognizer({}, {});
    const ctx = fakeCtx(el, { x: 0, y: 0 });

    r.onPointerDown(fakeEvent(0, 0), ctx);
    r.onPointerMove(fakeEvent(2, 0));
    r.onPointerUp(fakeEvent(2, 0), ctx);
    el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

    expect(onDomClick).toHaveBeenCalledTimes(1);
    el.remove();
  });
});
