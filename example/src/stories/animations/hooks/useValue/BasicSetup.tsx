import React, { useState } from 'react';
import {
  animate,
  useValue,
  withSpring,
  withTiming,
  withDecay,
  withSequence,
  withLoop,
  withDelay,
  Presence,
} from 'react-ui-animate';
import { ExampleLayout, Section, ExampleCard } from '../../shared';

const Example: React.FC = () => {
  const [x, setX] = useValue(0);
  const [mounted, setMounted] = useState(true);

  return (
    <ExampleLayout
      title="useValue Hook - Basic Setup"
      description="The useValue hook creates an animated value that can be controlled imperatively. It returns [value, setValue] where setValue accepts descriptors or immediate values."
      showRestartButton={false}
    >
      <Section title="Basic Usage" description="Create and animate a numeric value">
        <ExampleCard>
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
              <button
                onClick={() => setX(withTiming(0, { duration: 500 }))}
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
                Timing to 0
              </button>
              <button
                onClick={() => setX(withSpring(100))}
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
                Spring to 100
              </button>
              <button
                onClick={() => setX(0)}
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
                Immediate to 0
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

      <Section title="Loop Animation" description="Loop animations with callbacks">
        <ExampleCard>
          <div style={{ marginBottom: 20 }}>
            <button
              onClick={() =>
                setX(
                  withLoop(withSpring(100), 5, {
                    onStart() {
                      console.log('Loop started');
                    },
                    onComplete() {
                      console.log('Loop completed');
                    },
                  })
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
                marginBottom: 20,
              }}
            >
              Loop 0 to 100 (5 times)
            </button>
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

      <Section title="Explicit From Value" description="Start animations from a specific value">
        <ExampleCard>
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
              <button
                onClick={() =>
                  setX(
                    withSpring(100, {
                      from: 0, // Explicitly start from 0
                    })
                  )
                }
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
                Spring 0→100 (explicit from)
              </button>
              <button
                onClick={() =>
                  setX(
                    withTiming(200, {
                      from: 50, // Start from 50, animate to 200
                      duration: 500,
                    })
                  )
                }
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
                Timing 50→200 (explicit from)
              </button>
            </div>
            <animate.div
              style={{
                width: 100,
                height: 100,
                backgroundColor: '#20c997',
                borderRadius: 8,
                translateX: x,
              }}
            />
          </div>
        </ExampleCard>
      </Section>

      <Section title="Decay Animation" description="Physics-based decay animation">
        <ExampleCard>
          <div style={{ marginBottom: 20 }}>
            <button
              onClick={() => setX(withDecay(1))}
              style={{
                padding: '8px 16px',
                fontSize: 14,
                backgroundColor: '#ff8787',
                color: 'white',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
                marginBottom: 20,
              }}
            >
              Decay Animation
            </button>
            <animate.div
              style={{
                width: 100,
                height: 100,
                backgroundColor: '#ff8787',
                borderRadius: 8,
                translateX: x,
              }}
            />
          </div>
        </ExampleCard>
      </Section>

      <Section title="Sequence Animation" description="Chain multiple animations together">
        <ExampleCard>
          <div style={{ marginBottom: 20 }}>
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
                backgroundColor: '#ff6b6b',
                color: 'white',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
                marginBottom: 20,
              }}
            >
              Sequence: Spring → Delay → Timing → Decay
            </button>
            <animate.div
              style={{
                width: 100,
                height: 100,
                backgroundColor: '#ff6b6b',
                borderRadius: 8,
                translateX: x,
              }}
            />
          </div>
        </ExampleCard>
      </Section>

      <Section title="With Presence" description="useValue works with Presence for exit animations">
        <ExampleCard>
          <div style={{ marginBottom: 20 }}>
            <button
              onClick={() => setMounted(!mounted)}
              style={{
                padding: '8px 16px',
                fontSize: 14,
                backgroundColor: '#3399ff',
                color: 'white',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
                marginBottom: 20,
              }}
            >
              {mounted ? 'Hide' : 'Show'} Element
            </button>
            <Presence>
              {mounted && (
                <animate.div
                  onClick={() => setMounted(false)}
                  style={{
                    width: 100,
                    height: 100,
                    backgroundColor: '#3399ff',
                    borderRadius: 8,
                    cursor: 'pointer',
                  }}
                  animate={{
                    width: 200,
                    height: 200,
                    backgroundColor: '#ff6b6b',
                  }}
                  exit={{
                    opacity: withTiming(0, { duration: 1000 }),
                  }}
                />
              )}
            </Presence>
          </div>
        </ExampleCard>
      </Section>
    </ExampleLayout>
  );
};

export default Example;
