import React, { useState } from 'react';
import { animate, withSequence, withTiming, withSpring } from 'react-ui-animate';

const Example: React.FC = () => {
  const [trigger, setTrigger] = useState(0);

  return (
    <div style={{ padding: 40 }}>
      <h1 style={{ marginBottom: 30 }}>withSequence Descriptor</h1>
      <p style={{ marginBottom: 40, color: '#666' }}>
        Run animations one after another in sequence
      </p>

      <div style={{ marginBottom: 40 }}>
        <h2 style={{ marginBottom: 20 }}>Basic Sequence</h2>
        <animate.div
          key={trigger}
          style={{
            width: 100,
            height: 100,
            backgroundColor: '#3399ff',
            borderRadius: 8,
            translateX: 0,
          }}
          animate={{
            translateX: withSequence([
              withTiming(100, { duration: 300 }),
              withTiming(200, { duration: 300 }),
              withTiming(0, { duration: 300 }),
            ]),
          }}
        />
        <p style={{ marginTop: 10, fontSize: 12, color: '#999' }}>
          Moves right, then further right, then back
        </p>
      </div>

      <div style={{ marginBottom: 40 }}>
        <h2 style={{ marginBottom: 20 }}>Mixed Animation Types</h2>
        <animate.div
          key={trigger}
          style={{
            width: 100,
            height: 100,
            backgroundColor: '#ff6b6b',
            borderRadius: 8,
            translateX: 0,
            scale: 1,
          }}
          animate={{
            translateX: withSequence([
              withTiming(150, { duration: 400 }),
              withSpring(0, { stiffness: 100, damping: 15 }),
            ]),
            scale: withSequence([
              withSpring(1.5, { stiffness: 200, damping: 20 }),
              withTiming(1, { duration: 300 }),
            ]),
          }}
        />
      </div>

      <div style={{ marginBottom: 40 }}>
        <h2 style={{ marginBottom: 20 }}>Complex Sequence</h2>
        <animate.div
          key={trigger}
          style={{
            width: 100,
            height: 100,
            backgroundColor: '#51cf66',
            borderRadius: 8,
            translateX: 0,
            rotate: 0,
          }}
          animate={{
            translateX: withSequence([
              withTiming(100, { duration: 300 }),
              withTiming(200, { duration: 300 }),
              withTiming(100, { duration: 300 }),
              withTiming(0, { duration: 300 }),
            ]),
            rotate: withSequence([
              withTiming(90, { duration: 300 }),
              withTiming(180, { duration: 300 }),
              withTiming(270, { duration: 300 }),
              withTiming(360, { duration: 300 }),
            ]),
          }}
        />
      </div>

      <div style={{ marginBottom: 40 }}>
        <h2 style={{ marginBottom: 20 }}>With Callbacks</h2>
        <animate.div
          key={trigger}
          style={{
            width: 100,
            height: 100,
            backgroundColor: '#ffd43b',
            borderRadius: 8,
            opacity: 0,
          }}
          animate={{
            opacity: withSequence(
              [
                withTiming(1, { duration: 500 }),
                withTiming(0.5, { duration: 500 }),
                withTiming(1, { duration: 500 }),
              ],
              {
                onStart: () => console.log('Sequence started'),
                onComplete: () => console.log('Sequence completed'),
              }
            ),
          }}
        />
        <p style={{ marginTop: 10, fontSize: 12, color: '#999' }}>
          Check console for callbacks
        </p>
      </div>

      <div style={{ marginTop: 40 }}>
        <button
          onClick={() => setTrigger((prev) => prev + 1)}
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
          Restart Animations
        </button>
      </div>
    </div>
  );
};

export default Example;

