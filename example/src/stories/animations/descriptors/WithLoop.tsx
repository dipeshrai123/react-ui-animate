import React, { useState } from 'react';
import { animate, withLoop, withSequence, withTiming, withSpring } from 'react-ui-animate';

const Example: React.FC = () => {
  const [trigger, setTrigger] = useState(0);

  return (
    <div style={{ padding: 40 }}>
      <h1 style={{ marginBottom: 30 }}>withLoop Descriptor</h1>
      <p style={{ marginBottom: 40, color: '#666' }}>
        Loop animations a specified number of times or infinitely
      </p>

      <div style={{ marginBottom: 40 }}>
        <h2 style={{ marginBottom: 20 }}>Finite Loop (3 times)</h2>
        <animate.div
          key={trigger}
          style={{
            width: 100,
            height: 100,
            backgroundColor: '#3399ff',
            borderRadius: 8,
            rotate: 0,
          }}
          animate={{
            rotate: withLoop(
              withSequence([
                withTiming(90, { duration: 500 }),
                withTiming(180, { duration: 500 }),
                withTiming(270, { duration: 500 }),
                withTiming(360, { duration: 500 }),
              ]),
              3
            ),
          }}
        />
        <p style={{ marginTop: 10, fontSize: 12, color: '#999' }}>
          Rotates 3 times then stops
        </p>
      </div>

      <div style={{ marginBottom: 40 }}>
        <h2 style={{ marginBottom: 20 }}>Infinite Loop</h2>
        <animate.div
          key={trigger}
          style={{
            width: 100,
            height: 100,
            backgroundColor: '#ff6b6b',
            borderRadius: 8,
            rotate: 0,
          }}
          animate={{
            rotate: withLoop(withTiming(360, { duration: 1000 }), Infinity),
          }}
        />
        <p style={{ marginTop: 10, fontSize: 12, color: '#999' }}>
          Continuously rotates
        </p>
      </div>

      <div style={{ marginBottom: 40 }}>
        <h2 style={{ marginBottom: 20 }}>Spring Loop</h2>
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
            scale: withLoop(
              withSequence([
                withSpring(1.5, { stiffness: 200, damping: 15 }),
                withSpring(1, { stiffness: 200, damping: 15 }),
              ]),
              5
            ),
          }}
        />
        <p style={{ marginTop: 10, fontSize: 12, color: '#999' }}>
          Pulses 5 times with spring animation
        </p>
      </div>

      <div style={{ marginBottom: 40 }}>
        <h2 style={{ marginBottom: 20 }}>Complex Loop</h2>
        <animate.div
          key={trigger}
          style={{
            width: 100,
            height: 100,
            backgroundColor: '#ffd43b',
            borderRadius: 8,
            translateX: 0,
            rotate: 0,
          }}
          animate={{
            translateX: withLoop(
              withSequence([
                withTiming(100, { duration: 400 }),
                withTiming(0, { duration: 400 }),
              ]),
              4
            ),
            rotate: withLoop(withTiming(360, { duration: 1600 }), 4),
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
            backgroundColor: '#845ef7',
            borderRadius: 8,
            opacity: 1,
          }}
          animate={{
            opacity: withLoop(
              withSequence([
                withTiming(0.5, { duration: 500 }),
                withTiming(1, { duration: 500 }),
              ]),
              3,
              {
                onStart: () => console.log('Loop started'),
                onComplete: () => console.log('Loop completed'),
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

