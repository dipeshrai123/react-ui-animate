import { sequence } from '../../drivers/sequence';
import type { AnimationController } from '../../drivers/AnimationController';

class ImmediateController implements AnimationController {
  public started = false;
  public paused = false;
  public resumed = false;
  public cancelled = false;
  public resetCalled = false;
  private completeCb?: () => void;

  setOnComplete(fn: () => void) {
    this.completeCb = fn;
  }
  start() {
    this.started = true;
    this.completeCb!();
  }
  pause() {
    this.paused = true;
  }
  resume() {
    this.resumed = true;
  }
  cancel() {
    this.cancelled = true;
  }
  reset() {
    this.resetCalled = true;
  }
}

class ManualController implements AnimationController {
  public started = false;
  public paused = false;
  public resumed = false;
  public cancelled = false;
  public resetCalled = false;
  private completeCb?: () => void;

  setOnComplete(fn: () => void) {
    this.completeCb = fn;
  }
  start() {
    this.started = true;
  }
  pause() {
    this.paused = true;
  }
  resume() {
    this.resumed = true;
  }
  cancel() {
    this.cancelled = true;
  }
  reset() {
    this.resetCalled = true;
  }

  // call to simulate async completion
  complete() {
    this.completeCb!();
  }
}

describe('sequence()', () => {
  it('runs controllers in order and fires onComplete at the end', () => {
    const c1 = new ImmediateController();
    const c2 = new ImmediateController();
    const onStart = jest.fn();
    const onSequenceComplete = jest.fn();

    const seq = sequence([c1, c2], { onStart, onComplete: onSequenceComplete });
    seq.start();

    expect(onStart).toHaveBeenCalledTimes(1);

    expect(c1.started).toBe(true);
    expect(c2.started).toBe(true);

    expect(onSequenceComplete).toHaveBeenCalledTimes(1);
  });

  it('supports setOnComplete callback (onAllDone) and preserves hook order', () => {
    const c = new ImmediateController();
    const calls: string[] = [];
    const seqHook = () => calls.push('hook');
    const allDone = () => calls.push('all');
    const seq = sequence([c], { onComplete: seqHook });
    seq.setOnComplete?.(allDone);
    seq.start();
    expect(calls).toEqual(['all', 'hook']);
  });

  it('pauses, resumes, and cancels the current controller and fires hooks', () => {
    const m = new ManualController();
    const m2 = new ManualController();
    const onPause = jest.fn();
    const onResume = jest.fn();
    const seq = sequence([m, m2], { onPause, onResume });

    seq.start();
    expect(m.started).toBe(true);
    expect(m2.started).toBe(false);

    seq.pause();
    expect(onPause).toHaveBeenCalledTimes(1);
    expect(m.paused).toBe(true);

    seq.resume();
    expect(onResume).toHaveBeenCalledTimes(1);
    expect(m.resumed).toBe(true);

    seq.cancel();
    expect(m.cancelled).toBe(true);
    m.complete();
    expect(m2.started).toBe(false);
  });

  it('reset() calls reset() on all controllers and allows restarting', () => {
    const m1 = new ManualController();
    const m2 = new ManualController();
    const seq = sequence([m1, m2]);

    seq.start();
    m1.complete();
    m2.complete();

    seq.reset();
    expect(m1.resetCalled).toBe(true);
    expect(m2.resetCalled).toBe(true);

    m1.started = false;
    m2.started = false;
    seq.start();
    expect(m1.started).toBe(true);
    expect(m2.started).toBe(false);
  });
});
