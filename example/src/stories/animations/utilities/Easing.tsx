import React, { useState } from 'react';
import { animate, withTiming, Easing } from 'react-ui-animate';

const Example: React.FC = () => {
  const [trigger, setTrigger] = useState(0);

  const easingFunctions = [
    { name: 'linear', easing: Easing.linear },
    { name: 'ease', easing: Easing.ease },
    { name: 'quad', easing: Easing.quad },
    { name: 'cubic', easing: Easing.cubic },
    { name: 'sin', easing: Easing.sin },
    { name: 'circle', easing: Easing.circle },
    { name: 'exp', easing: Easing.exp },
    { name: 'bounce', easing: Easing.bounce },
    { name: 'in(ease)', easing: Easing.in(Easing.ease) },
    { name: 'out(ease)', easing: Easing.out(Easing.ease) },
    { name: 'inOut(ease)', easing: Easing.inOut(Easing.ease) },
    { name: 'bezier', easing: Easing.bezier(0.68, -0.55, 0.265, 1.55) },
  ];

  return (
    <div style={{ padding: 40 }}>
      <h1 style={{ marginBottom: 30 }}>Easing Functions</h1>
      <p style={{ marginBottom: 40, color: '#666' }}>
        Different easing functions for custom animation curves
      </p>

      <div style={{ marginBottom: 40 }}>
        <h2 style={{ marginBottom: 20 }}>All Easing Functions</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
          {easingFunctions.map(({ name, easing }) => (
            <div key={name} style={{ marginBottom: 20 }}>
              <p style={{ marginBottom: 10, fontSize: 14, fontWeight: 'bold' }}>{name}</p>
              <animate.div
                key={trigger}
                style={{
                  width: '100%',
                  height: 60,
                  backgroundColor: '#3399ff',
                  borderRadius: 8,
                  translateX: 0,
                }}
                animate={{
                  translateX: withTiming(150, {
                    duration: 1000,
                    easing,
                  }),
                }}
              />
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 40 }}>
        <h2 style={{ marginBottom: 20 }}>Custom Bezier Curves</h2>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          <div>
            <p style={{ marginBottom: 10, fontSize: 14, fontWeight: 'bold' }}>Ease In Out</p>
            <animate.div
              key={trigger}
              style={{
                width: 150,
                height: 60,
                backgroundColor: '#ff6b6b',
                borderRadius: 8,
                translateX: 0,
              }}
              animate={{
                translateX: withTiming(200, {
                  duration: 1000,
                  easing: Easing.bezier(0.42, 0, 0.58, 1),
                }),
              }}
            />
          </div>
          <div>
            <p style={{ marginBottom: 10, fontSize: 14, fontWeight: 'bold' }}>Bounce</p>
            <animate.div
              key={trigger}
              style={{
                width: 150,
                height: 60,
                backgroundColor: '#51cf66',
                borderRadius: 8,
                translateX: 0,
              }}
              animate={{
                translateX: withTiming(200, {
                  duration: 1000,
                  easing: Easing.bezier(0.68, -0.55, 0.265, 1.55),
                }),
              }}
            />
          </div>
          <div>
            <p style={{ marginBottom: 10, fontSize: 14, fontWeight: 'bold' }}>Elastic</p>
            <animate.div
              key={trigger}
              style={{
                width: 150,
                height: 60,
                backgroundColor: '#ffd43b',
                borderRadius: 8,
                translateX: 0,
              }}
              animate={{
                translateX: withTiming(200, {
                  duration: 1000,
                  easing: Easing.elastic(1),
                }),
              }}
            />
          </div>
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

