import React, { useState, useMemo } from 'react';
import {
  animate,
  withTiming,
  withSpring,
  withSequence,
  withLoop,
} from 'react-ui-animate';

const Example: React.FC = () => {
  const [trigger, setTrigger] = useState(0);

  const handleAnimate = () => {
    setTrigger((prev) => prev + 1);
  };

  // Memoize animate props to ensure they're recreated on trigger change
  const timingAnimate = useMemo(
    () => ({
      opacity: withTiming(1, { duration: 500 }),
      translateX: withTiming(200, { duration: 500 }),
    }),
    [trigger]
  );

  const springAnimate = useMemo(
    () => ({
      scale: withSpring(1, { stiffness: 100, damping: 10 }),
      rotate: withSpring(360, { stiffness: 50, damping: 15 }),
    }),
    [trigger]
  );

  const multipleAnimate = useMemo(
    () => ({
      opacity: withTiming(1, { duration: 600 }),
      translateX: withSpring(150, { stiffness: 80, damping: 12 }),
      translateY: withSpring(50, { stiffness: 80, damping: 12 }),
      scale: withSpring(1.2, { stiffness: 100, damping: 10 }),
    }),
    [trigger]
  );

  const sequenceAnimate = useMemo(
    () => ({
      translateX: withSequence([
        withTiming(100, { duration: 300 }),
        withTiming(200, { duration: 300 }),
        withTiming(0, { duration: 300 }),
      ]),
    }),
    [trigger]
  );

  const loopAnimate = useMemo(
    () => ({
      rotate: withLoop(
        withSequence([
          withTiming(90, { duration: 500 }),
          withTiming(180, { duration: 500 }),
          withTiming(270, { duration: 500 }),
          withTiming(360, { duration: 500 }),
        ]),
        2
      ),
    }),
    [trigger]
  );

  const combinedAnimate = useMemo(
    () => ({
      opacity: withTiming(1, { duration: 400 }),
      translateX: withSpring(0, { stiffness: 120, damping: 15 }),
      scale: withSpring(1, { stiffness: 100, damping: 10 }),
    }),
    [trigger]
  );

  const initialAnimate = useMemo(
    () => ({
      opacity: withTiming(1, { duration: 500 }),
      translateX: withSpring(200, { stiffness: 80, damping: 12 }),
    }),
    [trigger]
  );

  return (
    <div style={{ padding: 40 }}>
      <h1 style={{ marginBottom: 30 }}>Declarative Animate Prop</h1>

      <div style={{ marginBottom: 40 }}>
        <h2 style={{ marginBottom: 20 }}>Basic Timing Animation</h2>
        <animate.div
          style={{
            width: 100,
            height: 100,
            backgroundColor: '#3399ff',
            borderRadius: 8,
            opacity: 0,
            translateX: 0,
          }}
          animate={timingAnimate}
        />
      </div>

      <div style={{ marginBottom: 40 }}>
        <h2 style={{ marginBottom: 20 }}>Spring Animation</h2>
        <animate.div
          style={{
            width: 100,
            height: 100,
            backgroundColor: '#ff6b6b',
            borderRadius: 8,
            scale: 0.5,
            rotate: 0,
          }}
          animate={springAnimate}
        />
      </div>

      <div style={{ marginBottom: 40 }}>
        <h2 style={{ marginBottom: 20 }}>Multiple Properties</h2>
        <animate.div
          style={{
            width: 100,
            height: 100,
            backgroundColor: '#51cf66',
            borderRadius: 8,
            opacity: 0,
            translateX: 0,
            translateY: 0,
            scale: 0.8,
          }}
          animate={multipleAnimate}
        />
      </div>

      <div style={{ marginBottom: 40 }}>
        <h2 style={{ marginBottom: 20 }}>Sequence Animation</h2>
        <animate.div
          style={{
            width: 100,
            height: 100,
            backgroundColor: '#ffd43b',
            borderRadius: 8,
            translateX: 0,
          }}
          animate={sequenceAnimate}
        />
      </div>

      <div style={{ marginBottom: 40 }}>
        <h2 style={{ marginBottom: 20 }}>Loop Animation</h2>
        <animate.div
          style={{
            width: 100,
            height: 100,
            backgroundColor: '#845ef7',
            borderRadius: 8,
            rotate: 0,
          }}
          animate={loopAnimate}
        />
      </div>

      <div style={{ marginBottom: 40 }}>
        <h2 style={{ marginBottom: 20 }}>Combined: Opacity + Transform</h2>
        <animate.div
          style={{
            width: 100,
            height: 100,
            backgroundColor: '#ff8787',
            borderRadius: 8,
            opacity: 0,
            translateX: -50,
            scale: 0.5,
          }}
          animate={combinedAnimate}
        />
      </div>

      <div style={{ marginBottom: 40 }}>
        <h2 style={{ marginBottom: 20 }}>With Initial Style Values</h2>
        <animate.div
          style={{
            width: 100,
            height: 100,
            backgroundColor: '#20c997',
            borderRadius: 8,
            opacity: 0.3,
            translateX: 50,
          }}
          animate={initialAnimate}
        />
      </div>

      <div style={{ marginTop: 40 }}>
        <button
          onClick={handleAnimate}
          style={{
            padding: '12px 24px',
            fontSize: 16,
            backgroundColor: '#3399ff',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
          }}
        >
          Restart All Animations
        </button>
      </div>
    </div>
  );
};

export default Example;
