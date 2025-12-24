import React, { useState } from 'react';
import {
  animate,
  useValue,
  combine,
  withSpring,
  withTiming,
} from 'react-ui-animate';
import { ExampleLayout, Section, ExampleCard } from '../shared';

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
                border: '2px solid #ddd',
                borderRadius: 8,
                backgroundColor: '#f5f5f5',
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
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button
                onClick={() => setX(withSpring(100))}
                style={{
                  padding: '8px 16px',
                  fontSize: 14,
                  backgroundColor: '#3399ff',
                  color: 'white',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                }}
              >
                Move X to 100
              </button>
              <button
                onClick={() => setY(withSpring(100))}
                style={{
                  padding: '8px 16px',
                  fontSize: 14,
                  backgroundColor: '#51cf66',
                  color: 'white',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                }}
              >
                Move Y to 100
              </button>
              <button
                onClick={() => {
                  setX(withSpring(0));
                  setY(withSpring(0));
                }}
                style={{
                  padding: '8px 16px',
                  fontSize: 14,
                  backgroundColor: '#ff6b6b',
                  color: 'white',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                }}
              >
                Reset
              </button>
            </div>
          </div>
        </ExampleCard>
      </Section>

      <Section
        title="Mathematical Combination"
        description="Combine values with mathematical operations"
      >
        <ExampleCard>
          <div style={{ marginBottom: 20 }}>
            <p style={{ marginBottom: 10, fontSize: 14, color: '#666' }}>
              Combined transform value: <code>{position.current}</code>
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button
                onClick={() => {
                  setX(withSpring(150));
                  setY(withSpring(150));
                }}
                style={{
                  padding: '8px 16px',
                  fontSize: 14,
                  backgroundColor: '#845ef7',
                  color: 'white',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                }}
              >
                Move to (150, 150)
              </button>
              <button
                onClick={() => {
                  setX(withTiming(200, { duration: 1000 }));
                  setY(withTiming(100, { duration: 1000 }));
                }}
                style={{
                  padding: '8px 16px',
                  fontSize: 14,
                  backgroundColor: '#ffd43b',
                  color: 'white',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                }}
              >
                Timing to (200, 100)
              </button>
            </div>
            <div
              style={{
                position: 'relative',
                width: 400,
                height: 300,
                border: '2px solid #ddd',
                borderRadius: 8,
                backgroundColor: '#f5f5f5',
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
            <p style={{ marginBottom: 10, fontSize: 14, color: '#666' }}>
              The combine function can perform any calculation on the input
              values
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button
                onClick={() => {
                  setX(withSpring(100));
                  setY(withSpring(50));
                }}
                style={{
                  padding: '8px 16px',
                  fontSize: 14,
                  backgroundColor: '#20c997',
                  color: 'white',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                }}
              >
                Animate Both
              </button>
            </div>
            <div
              style={{
                position: 'relative',
                width: 400,
                height: 300,
                border: '2px solid #ddd',
                borderRadius: 8,
                backgroundColor: '#f5f5f5',
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
