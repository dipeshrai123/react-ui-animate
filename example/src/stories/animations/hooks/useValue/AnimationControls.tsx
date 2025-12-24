import React from 'react';
import {
  animate,
  useValue,
  withSpring,
  withTiming,
  withDecay,
  withSequence,
  withDelay,
} from 'react-ui-animate';
import { ExampleLayout, Section, ExampleCard } from '../../shared';

const Example: React.FC = () => {
  const [x, setX, controls] = useValue(0);

  return (
    <ExampleLayout
      title="useValue Hook - Animation Controls"
      description="The useValue hook returns a third value: controls object with pause() and resume() methods for controlling running animations"
      showRestartButton={false}
    >
      <Section
        title="Basic Controls"
        description="Pause and resume running animations"
      >
        <ExampleCard>
          <div style={{ marginBottom: 20 }}>
            <div
              style={{
                display: 'flex',
                gap: 10,
                flexWrap: 'wrap',
                marginBottom: 20,
              }}
            >
              <button
                onClick={() => setX(withTiming(200, { duration: 5000 }))}
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
                Start Long Animation (5s)
              </button>
              <button
                onClick={() => setX(withSpring(300))}
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
                Start Spring Animation
              </button>
            </div>
            <div
              style={{
                display: 'flex',
                gap: 10,
                flexWrap: 'wrap',
                marginBottom: 20,
              }}
            >
              <button
                onClick={() => controls.pause()}
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
                PAUSE
              </button>
              <button
                onClick={() => controls.resume()}
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
                RESUME
              </button>
              <button
                onClick={() => setX(0)}
                style={{
                  padding: '8px 16px',
                  fontSize: 14,
                  backgroundColor: '#999',
                  color: 'white',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                }}
              >
                Reset to 0
              </button>
            </div>
            <animate.div
              style={{
                width: 100,
                height: 100,
                backgroundColor: '#3399ff',
                borderRadius: 8,
                translateX: x,
              }}
            />
          </div>
        </ExampleCard>
      </Section>

      <Section
        title="Controls with Sequence"
        description="Pause/resume works with complex animations"
      >
        <ExampleCard>
          <div style={{ marginBottom: 20 }}>
            <div
              style={{
                display: 'flex',
                gap: 10,
                flexWrap: 'wrap',
                marginBottom: 20,
              }}
            >
              <button
                onClick={() =>
                  setX(
                    withSequence(
                      [
                        withSpring(100),
                        withDelay(2000),
                        withTiming(200),
                        withDecay(1),
                      ],
                      {
                        onStart() {
                          console.log('Sequence started');
                        },
                        onComplete() {
                          console.log('Sequence completed');
                        },
                      }
                    )
                  )
                }
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
                Start Sequence
              </button>
            </div>
            <div
              style={{
                display: 'flex',
                gap: 10,
                flexWrap: 'wrap',
                marginBottom: 20,
              }}
            >
              <button
                onClick={() => controls.pause()}
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
                PAUSE
              </button>
              <button
                onClick={() => controls.resume()}
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
                RESUME
              </button>
            </div>
            <animate.div
              style={{
                width: 100,
                height: 100,
                backgroundColor: '#845ef7',
                borderRadius: 8,
                translateX: x,
              }}
            />
          </div>
        </ExampleCard>
      </Section>
    </ExampleLayout>
  );
};

export default Example;
