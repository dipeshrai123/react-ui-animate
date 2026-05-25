import React, { useState } from 'react';
import { animate, Presence, useIsPresent, withTiming } from 'react-ui-animate';

/**
 * Example: Using useIsPresent to conditionally render content
 * 
 * useIsPresent() returns a boolean indicating if the component is present (not exiting).
 * Use it when you need to conditionally render content based on presence state.
 */
const AnimatedCard: React.FC = () => {
  const isPresent = useIsPresent();

  return (
    <animate.div
      style={{
        width: 200,
        padding: 20,
        backgroundColor: '#3399ff',
        borderRadius: 8,
        color: 'white',
        opacity: 0,
        translateY: -20,
      }}
      animate={{
        opacity: withTiming(1, { duration: 300 }),
        translateY: withTiming(0, { duration: 300 }),
      }}
      exit={{
        opacity: withTiming(0, { duration: 200 }),
        translateY: withTiming(-20, { duration: 200 }),
      }}
    >
      <h3 style={{ margin: '0 0 12px' }}>Card Title</h3>
      <p style={{ margin: 0, fontSize: 14 }}>
        {isPresent ? 'I am present!' : 'I am exiting...'}
      </p>
      {/* Conditionally show content only when present */}
      {isPresent && (
        <div style={{ marginTop: 12, padding: 8, background: 'rgba(255,255,255,0.2)', borderRadius: 4 }}>
          This content only shows when the card is present
        </div>
      )}
    </animate.div>
  );
};

const Example: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <div>
      <Presence>
        {isVisible && <AnimatedCard key="card" />}
      </Presence>
      
      <button
        onClick={() => setIsVisible((prev) => !prev)}
        style={{
          marginTop: 16,
          padding: '10px 20px',
          backgroundColor: '#3399ff',
          color: 'white',
          border: 'none',
          borderRadius: 6,
          cursor: 'pointer',
        }}
      >
        {isVisible ? 'Hide Card' : 'Show Card'}
      </button>
    </div>
  );
};

export default Example;

