import { parallel } from '../../drivers/parallel';
import type { AnimationController } from '../../drivers/AnimationController';

class DummyController implements AnimationController {
  startedCount = 0;
  pausedCount = 0;
  resumedCount = 0;
  cancelledCount = 0;
  resetCount = 0;
  private completeCb?: () => void;

  setOnComplete(fn: () => void) {
    this.completeCb = fn;
  }
  start() {
    this.startedCount++;
  }
  pause() {
    this.pausedCount++;
  }
  resume() {
    this.resumedCount++;
  }
  cancel() {
    this.cancelledCount++;
  }
  reset() {
    this.resetCount++;
  }

  complete() {
    this.completeCb?.();
  }
}

describe('parallel()', () => {
  it('calls onStart, starts all controllers, then fires onComplete once when all finish', () => {
    const c1 = new DummyController();
    const c2 = new DummyController();
    const onStart = jest.fn();
    const onComplete = jest.fn();
    const onAllDone = jest.fn();

    const ctrl = parallel([c1, c2], { onStart, onComplete });
    ctrl.setOnComplete?.(onAllDone);

    ctrl.start();
    expect(onStart).toHaveBeenCalledTimes(1);
    expect(c1.startedCount).toBe(1);
    expect(c2.startedCount).toBe(1);

    c1.complete();
    expect(onComplete).not.toHaveBeenCalled();
    expect(onAllDone).not.toHaveBeenCalled();

    c2.complete();
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onAllDone).toHaveBeenCalledTimes(1);
  });

  it('pause() and resume() delegate to all controllers and fire hooks', () => {
    const c1 = new DummyController();
    const c2 = new DummyController();
    const onPause = jest.fn();
    const onResume = jest.fn();

    const ctrl = parallel([c1, c2], { onPause, onResume });
    ctrl.start();

    ctrl.pause();
    expect(onPause).toHaveBeenCalledTimes(1);
    expect(c1.pausedCount).toBe(1);
    expect(c2.pausedCount).toBe(1);

    ctrl.resume();
    expect(onResume).toHaveBeenCalledTimes(1);
    expect(c1.resumedCount).toBe(1);
    expect(c2.resumedCount).toBe(1);
  });

  it('cancel() delegates to all controllers and prevents onComplete', () => {
    const c1 = new DummyController();
    const c2 = new DummyController();
    const onComplete = jest.fn();

    const ctrl = parallel([c1, c2], { onComplete });
    ctrl.start();

    ctrl.cancel();
    expect(c1.cancelledCount).toBe(1);
    expect(c2.cancelledCount).toBe(1);

    c1.complete();
    c2.complete();
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('reset() calls reset on each controller but does not start them, and allows restart', () => {
    const c1 = new DummyController();
    const c2 = new DummyController();

    const ctrl = parallel([c1, c2]);
    ctrl.start();

    c1.complete();
    c2.complete();
    expect(c1.resetCount).toBe(0);
    expect(c2.resetCount).toBe(0);

    ctrl.reset();
    expect(c1.resetCount).toBe(1);
    expect(c2.resetCount).toBe(1);

    expect(c1.startedCount).toBe(1);
    expect(c2.startedCount).toBe(1);

    ctrl.start();
    expect(c1.startedCount).toBe(2);
    expect(c2.startedCount).toBe(2);
  });
});
