import {
  withSpring,
  withTiming,
  withDecay,
  withDelay,
  withSequence,
  withLoop,
} from '../../descriptors';
import { Config } from '../../Config';
import { Easing } from '../../utils/easing';

describe('descriptors', () => {
  describe('withSpring', () => {
    it('creates spring descriptor with default options', () => {
      const descriptor = withSpring(100);

      expect(descriptor.type).toBe('spring');
      expect(descriptor.to).toBe(100);
      expect(descriptor.options?.stiffness).toBe(Config.Spring.EASE.stiffness);
      expect(descriptor.options?.damping).toBe(Config.Spring.EASE.damping);
      expect(descriptor.options?.mass).toBe(Config.Spring.EASE.mass);
    });

    it('creates spring descriptor with custom options', () => {
      const onStart = jest.fn();
      const onComplete = jest.fn();
      const onChange = jest.fn();

      const descriptor = withSpring(200, {
        stiffness: 300,
        damping: 25,
        mass: 1.5,
        from: 0,
        onStart,
        onChange,
        onComplete,
      });

      expect(descriptor.type).toBe('spring');
      expect(descriptor.to).toBe(200);
      expect(descriptor.options?.stiffness).toBe(300);
      expect(descriptor.options?.damping).toBe(25);
      expect(descriptor.options?.mass).toBe(1.5);
      expect(descriptor.options?.from).toBe(0);
      expect(descriptor.options?.onStart).toBe(onStart);
      expect(descriptor.options?.onChange).toBe(onChange);
      expect(descriptor.options?.onComplete).toBe(onComplete);
    });

    it('handles string values', () => {
      const descriptor = withSpring('100px');
      expect(descriptor.to).toBe('100px');
    });
  });

  describe('withTiming', () => {
    it('creates timing descriptor with default options', () => {
      const descriptor = withTiming(100);

      expect(descriptor.type).toBe('timing');
      expect(descriptor.to).toBe(100);
      expect(descriptor.options?.duration).toBeUndefined();
      expect(descriptor.options?.easing).toBeUndefined();
    });

    it('creates timing descriptor with custom options', () => {
      const onStart = jest.fn();
      const onComplete = jest.fn();
      const onChange = jest.fn();

      const descriptor = withTiming(200, {
        duration: 500,
        easing: Easing.inOut(Easing.ease),
        from: 0,
        onStart,
        onChange,
        onComplete,
      });

      const expectedEasing = Easing.inOut(Easing.ease);
      
      expect(descriptor.type).toBe('timing');
      expect(descriptor.to).toBe(200);
      expect(descriptor.options?.duration).toBe(500);
      expect(typeof descriptor.options?.easing).toBe('function');
      // Test that the easing function works correctly
      expect(descriptor.options?.easing?.(0)).toBeCloseTo(expectedEasing(0), 5);
      expect(descriptor.options?.easing?.(1)).toBeCloseTo(expectedEasing(1), 5);
      expect(descriptor.options?.from).toBe(0);
      expect(descriptor.options?.onStart).toBe(onStart);
      expect(descriptor.options?.onChange).toBe(onChange);
      expect(descriptor.options?.onComplete).toBe(onComplete);
    });

    it('handles string values', () => {
      const descriptor = withTiming('rgba(255,0,0,1)');
      expect(descriptor.to).toBe('rgba(255,0,0,1)');
    });
  });

  describe('withDecay', () => {
    it('creates decay descriptor with velocity', () => {
      const descriptor = withDecay(0.5);

      expect(descriptor.type).toBe('decay');
      expect(descriptor.options?.velocity).toBe(0.5);
    });

    it('creates decay descriptor with options', () => {
      const onStart = jest.fn();
      const onComplete = jest.fn();
      const onChange = jest.fn();

      const descriptor = withDecay(1.0, {
        clamp: [0, 100],
        elastic: true,
        onStart,
        onChange,
        onComplete,
      });

      expect(descriptor.type).toBe('decay');
      expect(descriptor.options?.velocity).toBe(1.0);
      expect(descriptor.options?.clamp).toEqual([0, 100]);
      expect(descriptor.options?.elastic).toBe(true);
      expect(descriptor.options?.onStart).toBe(onStart);
      expect(descriptor.options?.onChange).toBe(onChange);
      expect(descriptor.options?.onComplete).toBe(onComplete);
    });
  });

  describe('withDelay', () => {
    it('creates delay descriptor', () => {
      const descriptor = withDelay(500);

      expect(descriptor.type).toBe('delay');
      expect(descriptor.options?.delay).toBe(500);
    });

    it('handles zero delay', () => {
      const descriptor = withDelay(0);
      expect(descriptor.options?.delay).toBe(0);
    });
  });

  describe('withSequence', () => {
    it('creates sequence descriptor with animations', () => {
      const anim1 = withTiming(50);
      const anim2 = withTiming(100);
      const descriptor = withSequence([anim1, anim2]);

      expect(descriptor.type).toBe('sequence');
      expect(descriptor.options?.animations).toEqual([anim1, anim2]);
    });

    it('creates sequence descriptor with callbacks', () => {
      const onStart = jest.fn();
      const onComplete = jest.fn();
      const anim1 = withTiming(50);
      const anim2 = withTiming(100);

      const descriptor = withSequence([anim1, anim2], {
        onStart,
        onComplete,
      });

      expect(descriptor.type).toBe('sequence');
      expect(descriptor.options?.onStart).toBe(onStart);
      expect(descriptor.options?.onComplete).toBe(onComplete);
    });

    it('handles empty sequence', () => {
      const descriptor = withSequence([]);
      expect(descriptor.options?.animations).toEqual([]);
    });

    it('handles mixed animation types in sequence', () => {
      const anim1 = withTiming(50);
      const anim2 = withSpring(100);
      const delay = withDelay(100);
      const descriptor = withSequence([anim1, delay, anim2]);

      expect(descriptor.options?.animations).toEqual([anim1, delay, anim2]);
    });
  });

  describe('withLoop', () => {
    it('creates loop descriptor with default iterations', () => {
      const animation = withTiming(100);
      const descriptor = withLoop(animation);

      expect(descriptor.type).toBe('loop');
      expect(descriptor.options?.animation).toBe(animation);
      expect(descriptor.options?.iterations).toBe(Infinity);
    });

    it('creates loop descriptor with finite iterations', () => {
      const animation = withTiming(100);
      const descriptor = withLoop(animation, 3);

      expect(descriptor.type).toBe('loop');
      expect(descriptor.options?.animation).toBe(animation);
      expect(descriptor.options?.iterations).toBe(3);
    });

    it('creates loop descriptor with callbacks', () => {
      const onStart = jest.fn();
      const onComplete = jest.fn();
      const animation = withTiming(100);

      const descriptor = withLoop(animation, 2, {
        onStart,
        onComplete,
      });

      expect(descriptor.type).toBe('loop');
      expect(descriptor.options?.onStart).toBe(onStart);
      expect(descriptor.options?.onComplete).toBe(onComplete);
    });

    it('handles zero iterations', () => {
      const animation = withTiming(100);
      const descriptor = withLoop(animation, 0);
      expect(descriptor.options?.iterations).toBe(0);
    });

    it('handles sequence in loop', () => {
      const sequence = withSequence([
        withTiming(50),
        withTiming(100),
      ]);
      const descriptor = withLoop(sequence, 2);

      expect(descriptor.options?.animation).toBe(sequence);
    });
  });
});

