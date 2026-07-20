import React, { useState } from 'react';
import { animate, Presence, withTiming } from 'react-ui-animate';

const Example: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <>
      <div style={{ display: 'flex', gap: 40 }}>
        <div>
          <p className="mb">Plain div (no exit animation)</p>
          <Presence>
            {isVisible && (
              <div
                key="plain"
                style={{
                  width: 100,
                  height: 100,
                  backgroundColor: 'red',
                  borderRadius: 8,
                }}
              />
            )}
          </Presence>
        </div>

        <div>
          <p className="mb">animate.div with exit</p>
          <Presence>
            {isVisible && (
              <animate.div
                key="animated"
                style={{
                  width: 100,
                  height: 100,
                  backgroundColor: 'teal',
                  borderRadius: 8,
                  opacity: 0,
                }}
                animate={{ opacity: withTiming(1, { duration: 300 }) }}
                exit={{ opacity: withTiming(0, { duration: 300 }) }}
              />
            )}
          </Presence>
        </div>
      </div>

      <button className="mt" onClick={() => setIsVisible((prev) => !prev)}>
        {isVisible ? 'Hide' : 'Show'}
      </button>
    </>
  );
};

export default Example;
