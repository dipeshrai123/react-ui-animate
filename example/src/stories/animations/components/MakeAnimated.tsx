import React, { useState } from 'react';
import { makeAnimated, withSpring, withTiming } from 'react-ui-animate';

// Create custom animated components
const AnimatedButton = makeAnimated('button');
const AnimatedSection = makeAnimated('section');
const AnimatedSpan = makeAnimated('span');

const Example: React.FC = () => {
  const [trigger, setTrigger] = useState(0);

  return (
    <div style={{ padding: 40 }}>
      <h1 style={{ marginBottom: 30 }}>makeAnimated</h1>
      <p style={{ marginBottom: 40, color: '#666' }}>
        Create custom animated components from any HTML element
      </p>

      <div style={{ marginBottom: 40 }}>
        <h2 style={{ marginBottom: 20 }}>Animated Button</h2>
        <AnimatedButton
          key={trigger}
          onClick={() => setTrigger((prev) => prev + 1)}
          style={{
            padding: '12px 24px',
            fontSize: 16,
            backgroundColor: '#3399ff',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
            scale: 1,
          }}
          animate={{
            scale: withSpring(1.1, { stiffness: 300, damping: 20 }),
          }}
          press={{
            scale: withSpring(0.95, { stiffness: 400, damping: 25 }),
          }}
        >
          Click Me
        </AnimatedButton>
      </div>

      <div style={{ marginBottom: 40 }}>
        <h2 style={{ marginBottom: 20 }}>Animated Section</h2>
        <AnimatedSection
          key={trigger}
          style={{
            padding: 20,
            backgroundColor: '#f0f0f0',
            borderRadius: 8,
            opacity: 0,
            translateY: 20,
          }}
          animate={{
            opacity: withTiming(1, { duration: 500 }),
            translateY: withSpring(0, { stiffness: 100, damping: 15 }),
          }}
        >
          <p>This is an animated section element</p>
        </AnimatedSection>
      </div>

      <div style={{ marginBottom: 40 }}>
        <h2 style={{ marginBottom: 20 }}>Animated Span</h2>
        <div>
          <AnimatedSpan
            key={trigger}
            style={{
              display: 'inline-block',
              padding: '8px 16px',
              backgroundColor: '#51cf66',
              color: 'white',
              borderRadius: 4,
              scale: 0,
            }}
            animate={{
              scale: withSpring(1, { stiffness: 200, damping: 15 }),
            }}
          >
            Animated Span
          </AnimatedSpan>
        </div>
      </div>

      <div style={{ marginBottom: 40 }}>
        <h2 style={{ marginBottom: 20 }}>Multiple Custom Components</h2>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          <AnimatedButton
            key={`btn1-${trigger}`}
            style={{
              padding: '10px 20px',
              backgroundColor: '#ff6b6b',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              opacity: 0,
            }}
            animate={{
              opacity: withTiming(1, { duration: 500 }),
            }}
          >
            Button 1
          </AnimatedButton>
          <AnimatedButton
            key={`btn2-${trigger}`}
            style={{
              padding: '10px 20px',
              backgroundColor: '#ffd43b',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              opacity: 0,
            }}
            animate={{
              opacity: withTiming(1, { duration: 700 }),
            }}
          >
            Button 2
          </AnimatedButton>
          <AnimatedButton
            key={`btn3-${trigger}`}
            style={{
              padding: '10px 20px',
              backgroundColor: '#845ef7',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              opacity: 0,
            }}
            animate={{
              opacity: withTiming(1, { duration: 900 }),
            }}
          >
            Button 3
          </AnimatedButton>
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
