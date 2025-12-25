import React, { useState } from 'react';
import {
  animate,
  withDelay,
  withTiming,
  withSpring,
  withSequence,
} from 'react-ui-animate';

const Example: React.FC = () => {
  const [trigger, setTrigger] = useState(0);

  return (
    <div style={{ padding: 40 }}>
      <h1 style={{ marginBottom: 30 }}>withDelay Descriptor</h1>
      <p style={{ marginBottom: 40, color: '#666' }}>
        Delay animations in sequences - use withDelay inside withSequence to add
        pauses between animations
      </p>

      <div style={{ marginBottom: 40 }}>
        <h2 style={{ marginBottom: 20 }}>Basic Delay in Sequence</h2>
        <animate.div
          key={trigger}
          style={{
            width: 100,
            height: 100,
            backgroundColor: '#3399ff',
            borderRadius: 8,
            opacity: 0,
          }}
          animate={{
            opacity: withSequence([
              withDelay(500),
              withTiming(1, { duration: 500 }),
            ]),
          }}
        />
        <p style={{ marginTop: 10, fontSize: 12, color: '#999' }}>
          Waits 500ms, then fades in
        </p>
      </div>

      <div style={{ marginBottom: 40 }}>
        <h2 style={{ marginBottom: 20 }}>Multiple Delays in Sequence</h2>
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
            translateX: withSequence([
              withTiming(100, { duration: 300 }),
              withDelay(500),
              withTiming(200, { duration: 300 }),
              withDelay(500),
              withTiming(0, { duration: 300 }),
            ]),
          }}
        />
        <p style={{ marginTop: 10, fontSize: 12, color: '#999' }}>
          Moves right, delays, moves further, delays, returns
        </p>
      </div>

      <div style={{ marginBottom: 40 }}>
        <h2 style={{ marginBottom: 20 }}>
          Delay Between Different Animation Types
        </h2>
        <animate.div
          key={trigger}
          style={{
            width: 100,
            height: 100,
            backgroundColor: '#51cf66',
            borderRadius: 8,
            translateX: 0,
            scale: 1,
          }}
          animate={{
            translateX: withSequence([
              withSpring(150, { stiffness: 100, damping: 15 }),
              withDelay(800),
              withTiming(0, { duration: 500 }),
            ]),
            scale: withSequence([
              withSpring(1.5, { stiffness: 200, damping: 20 }),
              withDelay(800),
              withSpring(1, { stiffness: 100, damping: 15 }),
            ]),
          }}
        />
        <p style={{ marginTop: 10, fontSize: 12, color: '#999' }}>
          Spring animation, then delay, then timing/spring back
        </p>
      </div>

      <div style={{ marginBottom: 40 }}>
        <h2 style={{ marginBottom: 20 }}>
          Staggered Delays with Multiple Elements
        </h2>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          {[0, 1, 2, 3].map((index) => (
            <animate.div
              key={`${trigger}-${index}`}
              style={{
                width: 80,
                height: 80,
                backgroundColor: ['#ff6b6b', '#51cf66', '#ffd43b', '#845ef7'][
                  index
                ],
                borderRadius: 8,
                opacity: 0,
                scale: 0.5,
              }}
              animate={{
                opacity: withSequence([
                  withDelay(index * 200),
                  withTiming(1, { duration: 500 }),
                ]),
                scale: withSequence([
                  withDelay(index * 200),
                  withSpring(1, { stiffness: 100, damping: 15 }),
                ]),
              }}
            />
          ))}
        </div>
        <p style={{ marginTop: 10, fontSize: 12, color: '#999' }}>
          Each item delays by 200ms more than the previous
        </p>
      </div>

      <div style={{ marginBottom: 40 }}>
        <h2 style={{ marginBottom: 20 }}>Long Delay</h2>
        <animate.div
          key={trigger}
          style={{
            width: 100,
            height: 100,
            backgroundColor: '#20c997',
            borderRadius: 8,
            translateX: 0,
          }}
          animate={{
            translateX: withSequence([
              withDelay(1000),
              withTiming(200, { duration: 500 }),
            ]),
          }}
        />
        <p style={{ marginTop: 10, fontSize: 12, color: '#999' }}>
          Waits 1 second before moving
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
