import React, { useState } from 'react';
import { animate, Unmount, withTiming } from 'react-ui-animate';
import { ExampleLayout, ExampleCard } from '../../shared';

const Example: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <ExampleLayout
      title="Unmount with a Plain Child"
      description="A plain (non-animate) element inside Unmount has no `unmount` prop to run, so it's removed immediately — only animate components with an `unmount` animation get held in the DOM until it finishes."
      showRestartButton={false}
    >
      <ExampleCard>
        <div style={{ display: 'flex', gap: 40 }}>
          <div>
            <p style={{ marginBottom: 10, fontSize: 14, color: '#666' }}>
              Plain div (no unmount animation)
            </p>
            <Unmount>
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
            </Unmount>
          </div>

          <div>
            <p style={{ marginBottom: 10, fontSize: 14, color: '#666' }}>
              animate.div with unmount
            </p>
            <Unmount>
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
                  unmount={{ opacity: withTiming(0, { duration: 300 }) }}
                />
              )}
            </Unmount>
          </div>
        </div>

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
