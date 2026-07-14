import { WheelRecognizer } from '../WheelRecognizer';
import { GesturePhase } from '../../engine/phases';
import type { RecognizerContext } from '../../engine/GestureRecognizer';
import { createKinematicState } from '../../engine/PointerTracker';

function fakeEvent(deltaX: number, deltaY: number, t = 0): globalThis.WheelEvent {
  return { deltaX, deltaY, timeStamp: t } as globalThis.WheelEvent;
}

function fakeCtx(): RecognizerContext {
  return {
    target: document.createElement('div'),
    kinematics: createKinematicState({ x: 0, y: 0, t: 0 }),
    requestActivation: () => true,
    yieldTo: () => {},
  };
}

describe('WheelRecognizer', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('fires onStart then onChange with the per-event delta as movement', () => {
    const onStart = jest.fn();
    const onChange = jest.fn();
    const r = new WheelRecognizer({}, { onStart, onChange });

    r.onWheel(fakeEvent(10, 20), fakeCtx());

    expect(r.phase).toBe(GesturePhase.ACTIVE);
    expect(onStart).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0].movement).toEqual({ x: 10, y: 20 });
    expect(onChange.mock.calls[0][0].offset).toEqual({ x: 10, y: 20 });
  });

  it('accumulates offset across events without resetting', () => {
    const onChange = jest.fn();
    const r = new WheelRecognizer({}, { onChange });
    const ctx = fakeCtx();

    r.onWheel(fakeEvent(10, 0), ctx);
    r.onWheel(fakeEvent(5, 0), ctx);

    expect(onChange).toHaveBeenCalledTimes(2);
    expect(onChange.mock.calls[1][0].movement).toEqual({ x: 5, y: 0 });
    expect(onChange.mock.calls[1][0].offset).toEqual({ x: 15, y: 0 });
  });

  it('does not re-fire onStart on subsequent events in the same burst', () => {
    const onStart = jest.fn();
    const r = new WheelRecognizer({}, { onStart });
    const ctx = fakeCtx();

    r.onWheel(fakeEvent(10, 0), ctx);
    r.onWheel(fakeEvent(10, 0), ctx);

    expect(onStart).toHaveBeenCalledTimes(1);
  });

  it('fires onEnd + onFinalize 150ms after the last event, then resets', () => {
    const onEnd = jest.fn();
    const onFinalize = jest.fn();
    const r = new WheelRecognizer({}, { onEnd, onFinalize });

    r.onWheel(fakeEvent(10, 0), fakeCtx());
    expect(onEnd).not.toHaveBeenCalled();

    jest.advanceTimersByTime(150);

    expect(onEnd).toHaveBeenCalledTimes(1);
    expect(onFinalize).toHaveBeenCalledTimes(1);
    expect(r.phase).toBe(GesturePhase.UNDETERMINED);
  });

  it('debounce resets on each new event', () => {
    const onEnd = jest.fn();
    const r = new WheelRecognizer({}, { onEnd });
    const ctx = fakeCtx();

    r.onWheel(fakeEvent(10, 0), ctx);
    jest.advanceTimersByTime(100);
    r.onWheel(fakeEvent(10, 0), ctx);
    jest.advanceTimersByTime(100);

    expect(onEnd).not.toHaveBeenCalled();

    jest.advanceTimersByTime(50);
    expect(onEnd).toHaveBeenCalledTimes(1);
  });

  it('does nothing when disabled', () => {
    const onStart = jest.fn();
    const r = new WheelRecognizer({ enabled: false }, { onStart });
    r.onWheel(fakeEvent(10, 0), fakeCtx());

    expect(onStart).not.toHaveBeenCalled();
  });
});
