import React, { useState } from 'react';
import {
  animate,
  useValue,
  combine,
  withSpring,
  withTiming,
} from 'react-ui-animate';
import { ExampleLayout, Section, ExampleCard, Button, ButtonRow } from '../shared';

const Example: React.FC = () => {
  const [trigger, setTrigger] = useState(0);
  const [x, setX] = useValue(0);
  const [y, setY] = useValue(0);

  // Combine x and y into a single value
  const position = combine(
    [x, y],
    (xVal, yVal) => `translate(${xVal}px, ${yVal}px)`
  );

  return (
    <ExampleLayout
      tag="Utility"
      title="combine Utility"
      description="Combine multiple AnimateValues into a single computed value. The combined value automatically updates when any input value changes."
      onRestart={() => setTrigger((prev) => prev + 1)}
    >
      <Section
        title="Combining Two Values"
        description="Combine x and y positions into a transform string"
      >
        <ExampleCard>
          <div style={{ marginBottom: 20 }}>
            <div
              style={{
                position: 'relative',
                width: 400,
                height: 300,
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 8,
                backgroundColor: '#131317',
                marginBottom: 20,
              }}
            >
              <animate.div
                key={trigger}
                style={{
                  width: 60,
                  height: 60,
                  backgroundColor: '#3399ff',
                  borderRadius: '50%',
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  transform: position,
                }}
              />
            </div>
            <ButtonRow>
              <Button variant="primary" accent="#3399ff" onClick={() => setX(withSpring(100))}>
                Move X to 100
              </Button>
              <Button variant="primary" accent="#51cf66" onClick={() => setY(withSpring(100))}>
                Move Y to 100
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setX(withSpring(0));
                  setY(withSpring(0));
                }}
              >
                Reset
              </Button>
            </ButtonRow>
          </div>
        </ExampleCard>
      </Section>

      <Section
        title="Mathematical Combination"
        description="Combine values with mathematical operations"
      >
        <ExampleCard>
          <div style={{ marginBottom: 20 }}>
            <p style={{ marginBottom: 10, fontSize: 14, color: '#9a9aa4' }}>
              Combined transform value: <code>{position.current}</code>
            </p>
            <ButtonRow>
              <Button
                variant="primary"
                accent="#845ef7"
                onClick={() => {
                  setX(withSpring(150));
                  setY(withSpring(150));
                }}
              >
                Move to (150, 150)
              </Button>
              <Button
                variant="primary"
                accent="#ffd43b"
                onClick={() => {
                  setX(withTiming(200, { duration: 1000 }));
                  setY(withTiming(100, { duration: 1000 }));
                }}
              >
                Timing to (200, 100)
              </Button>
            </ButtonRow>
            <div
              style={{
                position: 'relative',
                width: 400,
                height: 300,
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 8,
                backgroundColor: '#131317',
                marginTop: 20,
              }}
            >
              <animate.div
                key={trigger}
                style={{
                  width: 60,
                  height: 60,
                  backgroundColor: '#845ef7',
                  borderRadius: '50%',
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  transform: position,
                }}
              />
            </div>
          </div>
        </ExampleCard>
      </Section>

      <Section
        title="Complex Combination"
        description="Combine multiple values with complex calculations"
      >
        <ExampleCard>
          <div style={{ marginBottom: 20 }}>
            <p style={{ marginBottom: 10, fontSize: 14, color: '#9a9aa4' }}>
              The combine function can perform any calculation on the input
              values
            </p>
            <ButtonRow>
              <Button
                variant="primary"
                accent="#20c997"
                onClick={() => {
                  setX(withSpring(100));
                  setY(withSpring(50));
                }}
              >
                Animate Both
              </Button>
            </ButtonRow>
            <div
              style={{
                position: 'relative',
                width: 400,
                height: 300,
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 8,
                backgroundColor: '#131317',
                marginTop: 20,
              }}
            >
              <animate.div
                key={trigger}
                style={{
                  width: 60,
                  height: 60,
                  backgroundColor: '#20c997',
                  borderRadius: '50%',
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  transform: position,
                }}
              />
            </div>
          </div>
        </ExampleCard>
      </Section>
    </ExampleLayout>
  );
};

export default Example;
