import React from 'react';
import {
  animate,
  useValue,
  withSpring,
  withTiming,
  withDecay,
  withSequence,
  withLoop,
} from 'react-ui-animate';
import { ExampleLayout, Section, ExampleCard } from '../../shared';

const Example: React.FC = () => {
  const [values, setValues] = useValue([0, 100, 200]);

  return (
    <ExampleLayout
      title="useValue Hook - Array Values"
      description="useValue can animate arrays of numbers. Each element in the array is animated independently."
      showRestartButton={false}
    >
      <Section title="Basic Array Animation" description="Animate multiple values simultaneously">
        <ExampleCard>
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
              <button
                onClick={() => setValues(withSpring([0, 100, 200]))}
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
                Spring to [0, 100, 200]
              </button>
              <button
                onClick={() => setValues(withTiming([100, 200, 300]))}
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
                Timing to [100, 200, 300]
              </button>
              <button
                onClick={() => setValues([0, 0, 0])}
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
                Reset to [0, 0, 0]
              </button>
            </div>
            <div style={{ display: 'flex', gap: 20, flexDirection: 'column' }}>
              {values.map((value, index) => (
                <animate.div
                  key={index}
                  style={{
                    width: 100,
                    height: 100,
                    backgroundColor: ['#3399ff', '#51cf66', '#ff6b6b'][index],
                    borderRadius: 8,
                    translateX: value,
                  }}
                />
              ))}
            </div>
          </div>
        </ExampleCard>
      </Section>

      <Section title="Array with Sequence" description="Chain animations for array values">
        <ExampleCard>
          <div style={{ marginBottom: 20 }}>
            <button
              onClick={() =>
                setValues(
                  withSequence(
                    [
                      withTiming([100, 200, 300]),
                      withSpring([0, 0, 0]),
                      withDecay(0.5),
                    ],
                    {
                      onStart() {
                        console.log('Array sequence started');
                      },
                      onComplete() {
                        console.log('Array sequence completed');
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
              Sequence: Timing → Spring → Decay
            </button>
            <div style={{ display: 'flex', gap: 20, flexDirection: 'column' }}>
              {values.map((value, index) => (
                <animate.div
                  key={index}
                  style={{
                    width: 100,
                    height: 100,
                    backgroundColor: ['#845ef7', '#ff8787', '#20c997'][index],
                    borderRadius: 8,
                    translateX: value,
                  }}
                />
              ))}
            </div>
          </div>
        </ExampleCard>
      </Section>

      <Section title="Array with Loop" description="Loop animations for array values">
        <ExampleCard>
          <div style={{ marginBottom: 20 }}>
            <button
              onClick={() =>
                setValues(
                  withLoop(
                    withSequence([
                      withTiming([0, 0, 0]),
                      withTiming([200, 100, 50]),
                      withDecay(0.5),
                    ]),
                    3,
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
                backgroundColor: '#ffd43b',
                color: 'white',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
                marginBottom: 20,
              }}
            >
              Loop Sequence (3 times)
            </button>
            <div style={{ display: 'flex', gap: 20, flexDirection: 'column' }}>
              {values.map((value, index) => (
                <animate.div
                  key={index}
                  style={{
                    width: 100,
                    height: 100,
                    backgroundColor: ['#ffd43b', '#ff6b6b', '#3399ff'][index],
                    borderRadius: 8,
                    translateX: value,
                  }}
                />
              ))}
            </div>
          </div>
        </ExampleCard>
      </Section>
    </ExampleLayout>
  );
};

export default Example;
