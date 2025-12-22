import { loop } from '../../drivers/loop';
import type { AnimationController } from '../../drivers/AnimationController';

class DummyController implements AnimationController {
  public started = 0;
  public paused = 0;
  public resumed = 0;
  public cancelled = 0;
  public resetCount = 0;
  private completeCb?: () => void;

  setOnComplete(fn: () => void) {
    this.completeCb = fn;
  }
  start() {
    this.started++;
  }
  pause() {
    this.paused++;
  }
  resume() {
    this.resumed++;
  }
  cancel() {
    this.cancelled++;
  }
  reset() {
    this.resetCount++;
  }

  complete() {
    this.completeCb?.();
  }
}

describe('loop()', () => {
  it('runs the driver N times then fires hooks once', () => {
    const driver = new DummyController();
    const onStart = jest.fn();
    const onComplete = jest.fn();
    const onAllDone = jest.fn();

    const iterations = 3;
    const seq = loop(driver, iterations, { onStart, onComplete });
    seq.setOnComplete?.(onAllDone);

    seq.start();

    expect(onStart).toHaveBeenCalledTimes(1);
    expect(driver.resetCount).toBe(1);
    expect(driver.started).toBe(1);

    for (let i = 0; i < iterations; i++) {
      driver.complete();
    }

    expect(driver.started).toBe(iterations);

    expect(driver.resetCount).toBe(1 + (iterations - 1));

    expect(onAllDone).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('pause() / resume() delegate to current iteration and fire hooks', () => {
    const driver = new DummyController();
    const onPause = jest.fn();
    const onResume = jest.fn();
    const seq = loop(driver, 2, { onPause, onResume });

    seq.start();
    expect(driver.started).toBe(1);

    seq.pause();
    expect(driver.paused).toBe(1);
    expect(onPause).toHaveBeenCalledTimes(1);

    seq.resume();
    expect(driver.resumed).toBe(1);
    expect(onResume).toHaveBeenCalledTimes(1);
  });

  it('cancel() stops further iterations and cancels the driver', () => {
    const driver = new DummyController();
    const seq = loop(driver, 2);

    seq.start();
    expect(driver.started).toBe(1);

    seq.cancel();
    expect(driver.cancelled).toBe(1);

    driver.complete();
    expect(driver.started).toBe(1);
  });

  it('reset() resets the internal count and calls reset() but does not start again', () => {
    const driver = new DummyController();
    const seq = loop(driver, 2);

    seq.start();
    expect(driver.resetCount).toBe(1);
    expect(driver.started).toBe(1);
    driver.complete();
    expect(driver.resetCount).toBe(2);
    expect(driver.started).toBe(2);
    driver.complete();
    expect(driver.started).toBe(2);

    const beforeStarted = driver.started;
    seq.reset();
    expect(driver.resetCount).toBe(3);
    expect(driver.started).toBe(beforeStarted);

    seq.start();
    expect(driver.started).toBe(beforeStarted + 1);
  });
});
