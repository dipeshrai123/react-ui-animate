import React from 'react';
import {
  animate,
  useValue,
  withSpring,
  withTiming,
  withDecay,
  withSequence,
  withLoop,
  withDelay,
} from 'react-ui-animate';
import { ExampleLayout, Section, ExampleCard } from '../../shared';

const Example: React.FC = () => {
  const [obj, setObj] = useValue({ x: 0, y: 0, width: 100, height: 100 });

  return (
    <ExampleLayout
      title="useValue Hook - Object Values"
      description="useValue can animate objects with multiple properties. Each property is animated independently."
      showRestartButton={false}
    >
      <Section title="Basic Object Animation" description="Animate object properties">
        <ExampleCard>
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
              <button
                onClick={() =>
                  setObj(
                    withSpring(
                      { x: 100, y: 100, width: 200, height: 200 },
                      {
                        onStart: () => console.log('Animation started'),
                        onComplete: () => console.log('Animation complete'),
                      }
                    )
                  )
                }
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
                Spring Animation
              </button>
              <button
                onClick={() =>
                  setObj(
                    withTiming(
                      { x: 0, y: 0, width: 300, height: 100 },
                      {
                        onStart: () => console.log('Animation started'),
                        onComplete: () => console.log('Animation complete'),
                      }
                    )
                  )
                }
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
                Timing Animation
              </button>
              <button
                onClick={() => setObj({ x: 0, y: 0, width: 100, height: 100 })}
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
            <animate.div
              style={{
                width: obj.width,
                height: obj.height,
                backgroundColor: '#3399ff',
                borderRadius: 8,
                translateX: obj.x,
                translateY: obj.y,
              }}
            />
          </div>
        </ExampleCard>
      </Section>

      <Section title="Object with Sequence" description="Chain animations for object properties">
        <ExampleCard>
          <div style={{ marginBottom: 20 }}>
            <button
              onClick={() =>
                setObj(
                  withSequence(
                    [
                      withSpring({ x: 100, y: 100 }),
                      withTiming({ width: 200, height: 200 }),
                      withDelay(1000),
                      withTiming({ x: 0, y: 0 }, { duration: 3000 }),
                      withDecay(0.5),
                    ],
                    {
                      onStart() {
                        console.log('Object sequence started');
                      },
                      onComplete() {
                        console.log('Object sequence completed');
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
                marginBottom: 20,
              }}
            >
              Sequence: Spring → Timing → Delay → Timing → Decay
            </button>
            <animate.div
              style={{
                width: obj.width,
                height: obj.height,
                backgroundColor: '#845ef7',
                borderRadius: 8,
                translateX: obj.x,
                translateY: obj.y,
              }}
            />
          </div>
        </ExampleCard>
      </Section>

      <Section title="Object with Loop" description="Loop animations for object properties">
        <ExampleCard>
          <div style={{ marginBottom: 20 }}>
            <button
              onClick={() =>
                setObj(
                  withLoop(
                    withSequence([
                      withTiming({ x: 100 }),
                      withTiming({ y: 100 }),
                      withTiming({ x: 0 }),
                      withTiming({ y: 0 }),
                    ]),
                    5,
                    {
                      onStart() {
                        console.log('Loop started');
                      },
                      onComplete() {
                        console.log('Loop completed');
                      },
                    }
                  )
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
                marginBottom: 20,
              }}
            >
              Loop Sequence (5 times)
            </button>
            <animate.div
              style={{
                width: obj.width,
                height: obj.height,
                backgroundColor: '#20c997',
                borderRadius: 8,
                translateX: obj.x,
                translateY: obj.y,
              }}
            />
          </div>
        </ExampleCard>
      </Section>
    </ExampleLayout>
  );
};

export default Example;
