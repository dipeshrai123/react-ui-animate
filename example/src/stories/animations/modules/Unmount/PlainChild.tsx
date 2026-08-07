import React, { useState } from 'react';
import { animate, Unmount, withTiming } from 'react-ui-animate';
import { ExampleLayout, ExampleCard, Button, theme } from '../../shared';

const Example: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <ExampleLayout
      tag="MODULE"
      title="Unmount with a plain child"
      description="A plain (non-animate) element inside Unmount has no `unmount` prop to run, so it's removed immediately — only animate components with an unmount animation get held in the DOM until it finishes."
      showRestartButton={false}
    >
      <ExampleCard>
        <div style={{ display: 'flex', gap: 40, marginBottom: 20 }}>
          <div>
            <p style={{ marginBottom: 10, fontSize: 13, color: theme.color.textFaint }}>
              Plain div — no unmount animation
            </p>
            <Unmount>
              {isVisible && (
                <div
                  key="plain"
                  style={{ width: 100, height: 100, backgroundColor: '#ff6b6b', borderRadius: 8 }}
                />
              )}
            </Unmount>
          </div>

          <div>
            <p style={{ marginBottom: 10, fontSize: 13, color: theme.color.textFaint }}>
              animate.div with unmount
            </p>
            <Unmount>
              {isVisible && (
                <animate.div
                  key="animated"
                  style={{ width: 100, height: 100, backgroundColor: 'teal', borderRadius: 8, opacity: 0 }}
                  animate={{ opacity: withTiming(1, { duration: 300 }) }}
                  unmount={{ opacity: withTiming(0, { duration: 300 }) }}
                />
              )}
            </Unmount>
          </div>
        </div>

        <Button variant="primary" onClick={() => setIsVisible((prev) => !prev)}>
          {isVisible ? 'Hide' : 'Show'}
        </Button>
      </ExampleCard>
    </ExampleLayout>
  );
};

export default Example;
