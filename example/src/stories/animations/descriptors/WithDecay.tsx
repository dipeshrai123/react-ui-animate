import React, { useState } from 'react';
import { animate, withDecay } from 'react-ui-animate';

const Example: React.FC = () => {
  const [trigger, setTrigger] = useState(0);

  return (
    <div style={{ padding: 40 }}>
      <h1 style={{ marginBottom: 30 }}>withDecay Descriptor</h1>
      <p style={{ marginBottom: 40, color: '#666' }}>
        Decay animations simulate momentum-based motion that gradually slows
        down
      </p>

      <div style={{ marginBottom: 40 }}>
        <h2 style={{ marginBottom: 20 }}>Basic Decay</h2>
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
            translateX: withDecay(1),
          }}
        />
        <p style={{ marginTop: 10, fontSize: 12, color: '#999' }}>
          Velocity: 1 - gentle momentum that gradually slows down
        </p>
      </div>

      <div style={{ marginBottom: 40 }}>
        <h2 style={{ marginBottom: 20 }}>Different Velocities</h2>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          <animate.div
            key={trigger}
            style={{
              width: 80,
              height: 80,
              backgroundColor: '#ff6b6b',
              borderRadius: 8,
              translateX: 0,
            }}
            animate={{
              translateX: withDecay(0.5),
            }}
          />
          <animate.div
            key={trigger}
            style={{
              width: 80,
              height: 80,
              backgroundColor: '#51cf66',
              borderRadius: 8,
              translateX: 0,
            }}
            animate={{
              translateX: withDecay(1),
            }}
          />
          <animate.div
            key={trigger}
            style={{
              width: 80,
              height: 80,
              backgroundColor: '#ffd43b',
              borderRadius: 8,
              translateX: 0,
            }}
            animate={{
              translateX: withDecay(2),
            }}
          />
        </div>
        <p style={{ marginTop: 10, fontSize: 12, color: '#999' }}>
          Left: Low velocity (0.5) | Middle: Medium (1) | Right: High (2)
        </p>
      </div>

      <div style={{ marginBottom: 40 }}>
        <h2 style={{ marginBottom: 20 }}>With Clamp</h2>
        <animate.div
          key={trigger}
          style={{
            width: 100,
            height: 100,
            backgroundColor: '#845ef7',
            borderRadius: 8,
            translateX: 0,
          }}
          animate={{
            translateX: withDecay(1.5, {
              clamp: [0, 400], // Clamp between 0 and 400
            }),
          }}
        />
        <p style={{ marginTop: 10, fontSize: 12, color: '#999' }}>
          Animation stops at boundaries (0-400px)
        </p>
      </div>

      <div style={{ marginBottom: 40 }}>
        <h2 style={{ marginBottom: 20 }}>Vertical Decay</h2>
        <animate.div
          key={trigger}
          style={{
            width: 100,
            height: 100,
            backgroundColor: '#20c997',
            borderRadius: 8,
            translateY: 0,
          }}
          animate={{
            translateY: withDecay(1),
          }}
        />
        <p style={{ marginTop: 10, fontSize: 12, color: '#999' }}>
          Decay works in any direction
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
