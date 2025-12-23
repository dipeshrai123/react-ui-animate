import React from 'react';
import {
  animate,
  withTiming,
  withSpring,
} from 'react-ui-animate';

const Example: React.FC = () => {
  return (
    <div style={{ padding: 40 }}>
      <h1 style={{ marginBottom: 30 }}>State Animations</h1>
      
      <div style={{ marginBottom: 40 }}>
        <h2 style={{ marginBottom: 20 }}>Hover Animation</h2>
        <animate.div
          style={{
            width: 100,
            height: 100,
            backgroundColor: '#3399ff',
            borderRadius: 8,
            scale: 1,
          }}
          whileHover={{
            scale: withSpring(1.2, { stiffness: 300, damping: 20 }),
            // backgroundColor: withTiming('#ff6b6b', { duration: 0 }),
            backgroundColor: '#ff6b6b',
        }}
        />
      </div>

      <div style={{ marginBottom: 40 }}>
        <h2 style={{ marginBottom: 20 }}>Tap Animation</h2>
        <animate.div
          style={{
            width: 100,
            height: 100,
            backgroundColor: '#51cf66',
            borderRadius: 8,
            scale: 1,
          }}
          whileTap={{
            scale: withSpring(0.9, { stiffness: 400, damping: 25 }),
          }}
        />
      </div>

      <div style={{ marginBottom: 40 }}>
        <h2 style={{ marginBottom: 20 }}>Focus Animation</h2>
        <animate.input
          type="text"
          placeholder="Click to focus"
          style={{
            padding: '12px 16px',
            fontSize: 16,
            border: '2px solid #ccc',
            borderRadius: 8,
            outline: 'none',
            width: 200,
            scale: 1,
          }}
          whileFocus={{
            scale: withSpring(1.05, { stiffness: 300, damping: 20 }),
            borderColor: withTiming('#3399ff', { duration: 200 }),
          }}
        />
      </div>

      <div style={{ marginBottom: 40 }}>
        <h2 style={{ marginBottom: 20 }}>Combined: Hover + Tap</h2>
        <animate.button
          style={{
            padding: '12px 24px',
            fontSize: 16,
            backgroundColor: '#845ef7',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
            scale: 1,
            translateY: 0,
          }}
          whileHover={{
            scale: withSpring(1.1, { stiffness: 300, damping: 20 }),
            translateY: withSpring(-2, { stiffness: 300, damping: 20 }),
          }}
          whileTap={{
            scale: withSpring(0.95, { stiffness: 400, damping: 25 }),
            translateY: withSpring(0, { stiffness: 400, damping: 25 }),
          }}
        >
          Hover & Tap Me
        </animate.button>
      </div>

      <div style={{ marginBottom: 40 }}>
        <h2 style={{ marginBottom: 20 }}>Multiple Properties on Hover</h2>
        <animate.div
          style={{
            width: 100,
            height: 100,
            backgroundColor: '#ffd43b',
            borderRadius: 8,
            rotate: 0,
            opacity: 0.8,
          }}
          whileHover={{
            rotate: withSpring(45, { stiffness: 200, damping: 15 }),
            opacity: withTiming(1, { duration: 200 }),
            scale: withSpring(1.15, { stiffness: 300, damping: 20 }),
          }}
        />
      </div>
    </div>
  );
};

export default Example;

