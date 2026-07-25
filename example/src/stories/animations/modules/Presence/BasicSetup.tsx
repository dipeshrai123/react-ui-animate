import React, { useState } from 'react';
import { animate, Presence, withTiming, withSpring } from 'react-ui-animate';
import { ExampleLayout, ExampleCard } from '../../shared';

const Example: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <ExampleLayout
      title="Presence Basic Setup"
      description="Wrap a conditionally-rendered animate component in Presence to play its `exit` animation before it's removed from the DOM, instead of vanishing instantly."
      showRestartButton={false}
    >
      <ExampleCard>
        <Presence>
          {isVisible && (
            <animate.div
              key="box"
              style={{
                width: 100,
                height: 100,
                backgroundColor: 'teal',
                borderRadius: 8,
                opacity: 0,
                scale: 0.8,
              }}
              animate={{
                opacity: withTiming(1, { duration: 300 }),
                scale: withSpring(1, { stiffness: 200, damping: 20 }),
              }}
              exit={{
                opacity: withTiming(0, { duration: 200 }),
                scale: withSpring(0.8, { stiffness: 200, damping: 20 }),
              }}
            />
          )}
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
          {isVisible ? 'Hide' : 'Show'}
        </button>
      </ExampleCard>
    </ExampleLayout>
  );
};

export default Example;
