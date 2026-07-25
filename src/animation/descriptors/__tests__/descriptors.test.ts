import {
  withSpring,
  withTiming,
  withDecay,
  withDelay,
  withSequence,
  withLoop,
  withStagger,
  withKeyframes,
  withParallel,
  withCustom,
} from '../../descriptors';
import { Easing } from '../../utils/easing';

describe('descriptors', () => {
  describe('withSpring', () => {
    it('creates spring descriptor with default options', () => {
      const descriptor = withSpring(100);

      expect(descriptor.type).toBe('spring');
      expect(descriptor.to).toBe(100);
      expect(descriptor.options?.stiffness).toBe(158);
      expect(descriptor.options?.damping).toBe(20);
      expect(descriptor.options?.mass).toBe(1);
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

    it('accepts options-only form (no target) for transition configs', () => {
      const descriptor = withSpring({ stiffness: 400, damping: 32 });

      expect(descriptor.type).toBe('spring');
      expect(descriptor.to).toBeUndefined();
      expect(descriptor.options?.stiffness).toBe(400);
      expect(descriptor.options?.damping).toBe(32);
      expect(descriptor.options?.mass).toBe(1);
    });

    it('still treats object values as animation targets', () => {
      const descriptor = withSpring({ x: 10, y: 20 });

      expect(descriptor.to).toEqual({ x: 10, y: 20 });
      expect(descriptor.options?.stiffness).toBe(158);
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

    it('accepts options-only form (no target) for transition configs', () => {
      const descriptor = withTiming({ duration: 300, easing: Easing.linear });

      expect(descriptor.type).toBe('timing');
      expect(descriptor.to).toBeUndefined();
      expect(descriptor.options?.duration).toBe(300);
      expect(descriptor.options?.easing).toBe(Easing.linear);
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

    it('passes through the yoyo option', () => {
      const descriptor = withLoop(withTiming(100), 4, { yoyo: true });
      expect(descriptor.options?.yoyo).toBe(true);
    });

    it('defaults yoyo to undefined', () => {
      const descriptor = withLoop(withTiming(100), 4);
      expect(descriptor.options?.yoyo).toBeUndefined();
    });
  });

  describe('withKeyframes', () => {
    it('builds a sequence of timing steps splitting the total duration evenly', () => {
      const descriptor = withKeyframes([0, 100, 50], { duration: 300 });

      expect(descriptor.type).toBe('sequence');
      const animations = descriptor.options?.animations ?? [];
      expect(animations).toHaveLength(3);
      animations.forEach((anim, i) => {
        expect(anim.type).toBe('timing');
        expect(anim.options?.duration).toBe(100);
        expect(anim.to).toBe([0, 100, 50][i]);
      });
    });

    it('lets individual steps override duration and easing', () => {
      const customEasing = (t: number) => t;
      const descriptor = withKeyframes(
        [0, { to: 100, duration: 500, easing: customEasing }, 50],
        { duration: 300 }
      );

      const animations = descriptor.options?.animations ?? [];
      expect(animations[0].options?.duration).toBe(100);
      expect(animations[1].options?.duration).toBe(500);
      expect(animations[1].options?.easing).toBe(customEasing);
    });

    it('applies onStart/onComplete at the sequence level and onChange to every step', () => {
      const onStart = jest.fn();
      const onComplete = jest.fn();
      const onChange = jest.fn();

      const descriptor = withKeyframes([0, 100], {
        onStart,
        onComplete,
        onChange,
      });

      expect(descriptor.options?.onStart).toBe(onStart);
      expect(descriptor.options?.onComplete).toBe(onComplete);
      descriptor.options?.animations?.forEach((anim) => {
        expect(anim.options?.onChange).toBe(onChange);
      });
    });

    it('defaults to a 300ms total duration split across steps', () => {
      const descriptor = withKeyframes([0, 50, 100, 150]);
      const animations = descriptor.options?.animations ?? [];
      animations.forEach((anim) => expect(anim.options?.duration).toBe(75));
    });
  });

  describe('withParallel', () => {
    it('creates a parallel descriptor from a keyed record', () => {
      const x = withSpring(100);
      const y = withTiming(50, { duration: 800 });
      const descriptor = withParallel({ x, y });

      expect(descriptor.type).toBe('parallel');
      expect(descriptor.options?.parallel).toEqual({ x, y });
    });

    it('creates a parallel descriptor from an array aligned by index', () => {
      const first = withSpring(100);
      const second = withTiming(50);
      const descriptor = withParallel([first, second]);

      expect(descriptor.type).toBe('parallel');
      expect(descriptor.options?.parallel).toEqual([first, second]);
    });

    it('attaches onStart/onComplete but not onChange', () => {
      const onStart = jest.fn();
      const onComplete = jest.fn();
      const descriptor = withParallel({ x: withSpring(1) }, { onStart, onComplete });

      expect(descriptor.options?.onStart).toBe(onStart);
      expect(descriptor.options?.onComplete).toBe(onComplete);
    });
  });

  describe('withCustom', () => {
    it('creates a custom descriptor carrying the tick fn and options', () => {
      const tick = ({ from }: { from: number }) => from;
      const onStart = jest.fn();
      const onChange = jest.fn();
      const onComplete = jest.fn();

      const descriptor = withCustom(tick, {
        duration: 500,
        from: 10,
        onStart,
        onChange,
        onComplete,
      });

      expect(descriptor.type).toBe('custom');
      expect(descriptor.to).toBeUndefined();
      expect(descriptor.options?.tick).toBe(tick);
      expect(descriptor.options?.duration).toBe(500);
      expect(descriptor.options?.from).toBe(10);
      expect(descriptor.options?.onStart).toBe(onStart);
      expect(descriptor.options?.onChange).toBe(onChange);
      expect(descriptor.options?.onComplete).toBe(onComplete);
    });

    it('defaults duration/from/callbacks to undefined when omitted', () => {
      const descriptor = withCustom(({ from }) => from);

      expect(descriptor.options?.duration).toBeUndefined();
      expect(descriptor.options?.from).toBeUndefined();
    });
  });

  describe('withStagger', () => {
    it('returns the descriptor unchanged for index 0 with default options', () => {
      const anim = withTiming(100);
      const descriptor = withStagger(0, anim);

      expect(descriptor).toBe(anim);
    });

    it('wraps the descriptor in a delayed sequence proportional to index', () => {
      const anim = withTiming(100);
      const descriptor = withStagger(3, anim, { each: 50 });

      expect(descriptor.type).toBe('sequence');
      expect(descriptor.options?.animations?.[0]).toEqual(withDelay(150));
      expect(descriptor.options?.animations?.[1]).toBe(anim);
    });

    it('uses a default step of 50ms when `each` is omitted', () => {
      const anim = withSpring(1);
      const descriptor = withStagger(2, anim);

      expect(descriptor.options?.animations?.[0]).toEqual(withDelay(100));
    });

    it('adds a base `delay` before staggering starts', () => {
      const anim = withTiming(1);
      const descriptor = withStagger(1, anim, { each: 20, delay: 200 });

      expect(descriptor.options?.animations?.[0]).toEqual(withDelay(220));
    });

    it('returns the descriptor unchanged when total delay is zero or negative', () => {
      const anim = withSpring(1);
      const descriptor = withStagger(0, anim, { each: 50, delay: 0 });

      expect(descriptor).toBe(anim);
    });
  });
});

