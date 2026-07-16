import React, { useState } from 'react';
import { animate, useValue, withKeyframes, Easing } from 'react-ui-animate';

const Example: React.FC = () => {
  const [trigger, setTrigger] = useState(0);
  const [x, setX] = useValue(0);

  return (
    <div style={{ padding: 40 }}>
      <h1 style={{ marginBottom: 30 }}>withKeyframes Descriptor</h1>
      <p style={{ marginBottom: 40, color: '#666' }}>
        Animate a value through a list of intermediate stops in one call,
        instead of hand-rolling a <code>withSequence</code> of{' '}
        <code>withTiming</code> steps.
      </p>

      <div style={{ marginBottom: 40 }}>
        <h2 style={{ marginBottom: 20 }}>Basic Keyframes</h2>
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
            translateX: withKeyframes([0, 200, 100, 200], { duration: 900 }),
          }}
        />
        <p style={{ marginTop: 10, fontSize: 12, color: '#999' }}>
          Each stop gets an equal share of the total duration (900ms / 4
          steps)
        </p>
      </div>

      <div style={{ marginBottom: 40 }}>
        <h2 style={{ marginBottom: 20 }}>Per-Step Overrides</h2>
        <animate.div
          key={trigger}
          style={{
            width: 100,
            height: 100,
            backgroundColor: '#ff6b6b',
            borderRadius: 8,
            translateX: 0,
          }}
          animate={{
            translateX: withKeyframes([
              0,
              { to: 200, duration: 200, easing: Easing.linear },
              { to: 50, duration: 600 },
              200,
            ]),
          }}
        />
        <p style={{ marginTop: 10, fontSize: 12, color: '#999' }}>
          Individual steps can override <code>duration</code> and{' '}
          <code>easing</code>
        </p>
      </div>

      <div style={{ marginBottom: 40 }}>
        <h2 style={{ marginBottom: 20 }}>With Callbacks</h2>
        <animate.div
          key={trigger}
          style={{
            width: 100,
            height: 100,
            backgroundColor: '#51cf66',
            borderRadius: 8,
            scale: 1,
          }}
          animate={{
            scale: withKeyframes([1, 1.4, 0.8, 1], {
              duration: 800,
              onStart: () => console.log('Keyframes started'),
              onComplete: () => console.log('Keyframes completed'),
            }),
          }}
        />
        <p style={{ marginTop: 10, fontSize: 12, color: '#999' }}>
          Check console for callbacks
        </p>
      </div>

      <div style={{ marginBottom: 40 }}>
        <h2 style={{ marginBottom: 20 }}>Driven by a Value</h2>
        <animate.div
          style={{
            width: 100,
            height: 100,
            backgroundColor: '#ffd43b',
            borderRadius: 8,
            translateX: x,
          }}
        />
        <div style={{ marginTop: 10 }}>
          <button
            onClick={() =>
              setX(withKeyframes([0, 250, 120, 250, 0], { duration: 1200 }))
            }
            style={{
              padding: '8px 16px',
              fontSize: 14,
              backgroundColor: '#ffd43b',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
            }}
          >
            Run Keyframes on x
          </button>
        </div>
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
