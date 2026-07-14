import { ScrollRecognizer } from '../ScrollRecognizer';
import { GesturePhase } from '../../engine/phases';
import type { RecognizerContext } from '../../engine/GestureRecognizer';
import { createKinematicState } from '../../engine/PointerTracker';

function fakeCtx(target: HTMLElement | Window): RecognizerContext {
  return {
    target,
    kinematics: createKinematicState({ x: 0, y: 0, t: 0 }),
    requestActivation: () => true,
    yieldTo: () => {},
  };
}

describe('ScrollRecognizer', () => {
  let el: HTMLElement;

  beforeEach(() => {
    jest.useFakeTimers();
    el = document.createElement('div');
    Object.defineProperty(el, 'scrollLeft', { value: 0, writable: true });
    Object.defineProperty(el, 'scrollTop', { value: 0, writable: true });
  });

  afterEach(() => jest.useRealTimers());

  it('fires onStart then onChange with absolute offset and delta movement', () => {
    const onStart = jest.fn();
    const onChange = jest.fn();
    const r = new ScrollRecognizer({}, { onStart, onChange });

    (el as any).scrollTop = 40;
    r.onScroll(new Event('scroll'), fakeCtx(el));

    expect(r.phase).toBe(GesturePhase.ACTIVE);
    expect(onStart).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0].offset).toEqual({ x: 0, y: 40 });
    expect(onChange.mock.calls[0][0].movement).toEqual({ x: 0, y: 40 });
  });

  it('movement is delta from the last scroll event, not reset per burst', () => {
    const onChange = jest.fn();
    const r = new ScrollRecognizer({}, { onChange });
    const ctx = fakeCtx(el);

    (el as any).scrollTop = 40;
    r.onScroll(new Event('scroll'), ctx);
    (el as any).scrollTop = 55;
    r.onScroll(new Event('scroll'), ctx);

    expect(onChange.mock.calls[1][0].movement).toEqual({ x: 0, y: 15 });
    expect(onChange.mock.calls[1][0].offset).toEqual({ x: 0, y: 55 });
  });

  it('fires onEnd + onFinalize 150ms after the last event, then resets', () => {
    const onEnd = jest.fn();
    const onFinalize = jest.fn();
    const r = new ScrollRecognizer({}, { onEnd, onFinalize });

    (el as any).scrollTop = 10;
    r.onScroll(new Event('scroll'), fakeCtx(el));
    expect(onEnd).not.toHaveBeenCalled();

    jest.advanceTimersByTime(150);

    expect(onEnd).toHaveBeenCalledTimes(1);
    expect(onFinalize).toHaveBeenCalledTimes(1);
    expect(r.phase).toBe(GesturePhase.UNDETERMINED);
  });

  it('reads scrollX/scrollY when target is window', () => {
    const onChange = jest.fn();
    const r = new ScrollRecognizer({}, { onChange });

    Object.defineProperty(window, 'scrollY', { value: 123, configurable: true });
    Object.defineProperty(window, 'scrollX', { value: 0, configurable: true });

    r.onScroll(new Event('scroll'), fakeCtx(window));

    expect(onChange.mock.calls[0][0].offset).toEqual({ x: 0, y: 123 });
  });

  it('does nothing when disabled', () => {
    const onStart = jest.fn();
    const r = new ScrollRecognizer({ enabled: false }, { onStart });
    r.onScroll(new Event('scroll'), fakeCtx(el));

    expect(onStart).not.toHaveBeenCalled();
  });
});
