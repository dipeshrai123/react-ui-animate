import React, { useState } from 'react';
import { animate, Unmount, withTiming, withSpring } from 'react-ui-animate';
import { ExampleLayout, ExampleCard, Button } from '../../shared';

const Example: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <ExampleLayout
      tag="MODULE"
      title="Unmount — basic setup"
      description="Wrap a conditionally-rendered animate component in Unmount to play its `unmount` animation before it's removed from the DOM, instead of vanishing instantly."
      showRestartButton={false}
    >
      <ExampleCard align="center">
        <div>
          <Unmount>
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
                unmount={{
                  opacity: withTiming(0, { duration: 200 }),
                  scale: withSpring(0.8, { stiffness: 200, damping: 20 }),
                }}
              />
            )}
          </Unmount>
          <div style={{ marginTop: 16 }}>
            <Button variant="primary" onClick={() => setIsVisible((prev) => !prev)}>
              {isVisible ? 'Hide' : 'Show'}
            </Button>
          </div>
        </div>
      </ExampleCard>
    </ExampleLayout>
  );
};

export default Example;
