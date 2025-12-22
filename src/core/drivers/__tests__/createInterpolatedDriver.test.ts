import { MotionValue } from '../../MotionValue';
import { createInterpolatedDriver } from '../../drivers/createInterpolatedDriver';
import type { AnimationController } from '../../drivers/AnimationController';

class DummyController implements AnimationController {
  public canceled = false;
  start() {}
  pause() {}
  resume() {}
  cancel() {
    this.canceled = true;
  }
  reset() {}
}

describe('createInterpolatedDriver()', () => {
  it('delegates to driver factory when both current and target are numbers', () => {
    const mv = new MotionValue<number>(0);
    const driver = jest.fn<AnimationController, [any, number, any]>(
      () => new DummyController()
    );
    const ctrl = createInterpolatedDriver(mv, 100, {}, driver);

    expect(driver).toHaveBeenCalledWith(mv, 100, {});
    expect(ctrl).toBeInstanceOf(DummyController);
  });

  it('throws if types are mismatched', () => {
    const mvNum = new MotionValue<number>(0);
    const mvStr = new MotionValue<string>('0px');
    const dummyDriver = jest.fn<AnimationController, any>(
      () => new DummyController()
    );

    expect(() =>
      createInterpolatedDriver(mvNum, '100px', {}, dummyDriver)
    ).toThrow(/Unsupported type/);

    expect(() => createInterpolatedDriver(mvStr, 100, {}, dummyDriver)).toThrow(
      /Unsupported type/
    );
  });

  it('creates an interpolated driver when both current and target are strings', () => {
    const mv = new MotionValue<string>('0px');
    const driver = jest.fn<AnimationController, [any, number, any]>(
      () => new DummyController()
    );
    const opts = { ease: 'linear' };

    const ctrl = createInterpolatedDriver(mv, '10px', opts, driver);

    expect(driver).toHaveBeenCalledTimes(1);
    const [progressArg, toArg, optsArg] = driver.mock.calls[0];
    expect(progressArg).toBeInstanceOf(MotionValue);
    expect(toArg).toBe(1);
    expect(optsArg).toBe(opts);
    expect(ctrl).toBeInstanceOf(DummyController);

    expect(mv.current).toBe('0px');

    progressArg.set(0.5);
    expect(mv.current).toBe('5px');

    progressArg.set(1);
    expect(mv.current).toBe('10px');
  });
});
