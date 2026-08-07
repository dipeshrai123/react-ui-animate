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
import { ExampleLayout, Section, ExampleCard, Button, ButtonRow } from '../../shared';

const Example: React.FC = () => {
  const [values, setValues] = useValue([0, 100, 200]);

  return (
    <ExampleLayout
      tag="HOOK"
      title="useValue — array values"
      description="useValue animates arrays of numbers directly — each element is interpolated independently on its own timeline."
      showRestartButton={false}
    >
      <Section title="Basic array animation" description="Animate multiple values in one call.">
        <ExampleCard>
          <ButtonRow>
            <Button variant="primary" onClick={() => setValues(withSpring([0, 100, 200]))}>
              Spring to [0, 100, 200]
            </Button>
            <Button accent="#51cf66" onClick={() => setValues(withTiming([100, 200, 300]))}>
              Timing to [100, 200, 300]
            </Button>
            <Button variant="ghost" onClick={() => setValues([0, 0, 0])}>
              Reset to [0, 0, 0]
            </Button>
          </ButtonRow>
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
        </ExampleCard>
      </Section>

      <Section title="Array with sequence" description="Chain animations across every element in the array.">
        <ExampleCard>
          <ButtonRow>
            <Button
              accent="#845ef7"
              onClick={() =>
                setValues(
                  withSequence([
                    withTiming([100, 200, 300]),
                    withSpring([0, 0, 0]),
                    withDecay(0.5),
                  ])
                )
              }
            >
              Sequence: Timing → Spring → Decay
            </Button>
          </ButtonRow>
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
        </ExampleCard>
      </Section>

      <Section title="Array with loop" description="Loop a chained animation across every element.">
        <ExampleCard>
          <ButtonRow>
            <Button
              accent="#ffd43b"
              onClick={() =>
                setValues(
                  withLoop(
                    withSequence([
                      withTiming([0, 0, 0]),
                      withTiming([200, 100, 50]),
                      withDecay(0.5),
                    ]),
                    3
                  )
                )
              }
            >
              Loop sequence (3 times)
            </Button>
          </ButtonRow>
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
        </ExampleCard>
      </Section>
    </ExampleLayout>
  );
};

export default Example;
