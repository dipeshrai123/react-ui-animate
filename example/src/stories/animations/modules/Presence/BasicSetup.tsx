import React, { useState } from 'react';
import { animate, Presence, withTiming, withSpring } from 'react-ui-animate';

const Example: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <>
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
        className="mt"
        onClick={() => setIsVisible((prev) => !prev)}
      >
        {isVisible ? 'Hide' : 'Show'}
      </button>
    </>
  );
};

export default Example;

