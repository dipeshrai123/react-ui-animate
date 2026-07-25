import React, { useState } from 'react';
import { animate, Presence, withTiming } from 'react-ui-animate';
import { ExampleLayout, ExampleCard } from '../../shared';

const Example: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <ExampleLayout
      title="Presence with a Plain Child"
      description="A plain (non-animate) element inside Presence has no `exit` prop to run, so it's removed immediately — only animate components with an `exit` animation get held in the DOM until it finishes."
      showRestartButton={false}
    >
      <ExampleCard>
        <div style={{ display: 'flex', gap: 40 }}>
          <div>
            <p style={{ marginBottom: 10, fontSize: 14, color: '#666' }}>
              Plain div (no exit animation)
            </p>
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
            <p style={{ marginBottom: 10, fontSize: 14, color: '#666' }}>
              animate.div with exit
            </p>
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
