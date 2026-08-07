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
import { ExampleLayout, Section, ExampleCard, Button, ButtonRow } from '../../shared';

const Example: React.FC = () => {
  const [obj, setObj] = useValue({ x: 0, y: 0, width: 100, height: 100 });

  return (
    <ExampleLayout
      tag="HOOK"
      title="useValue — object values"
      description="useValue also animates plain objects — every property interpolates independently, so you can drive a whole box model from one call."
      showRestartButton={false}
    >
      <Section title="Basic object animation" description="Animate several object properties at once.">
        <ExampleCard>
          <ButtonRow>
            <Button
              variant="primary"
              onClick={() => setObj(withSpring({ x: 100, y: 100, width: 200, height: 200 }))}
            >
              Spring animation
            </Button>
            <Button
              accent="#51cf66"
              onClick={() => setObj(withTiming({ x: 0, y: 0, width: 300, height: 100 }))}
            >
              Timing animation
            </Button>
            <Button variant="ghost" onClick={() => setObj({ x: 0, y: 0, width: 100, height: 100 })}>
              Reset
            </Button>
          </ButtonRow>
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
        </ExampleCard>
      </Section>

      <Section title="Object with sequence" description="Chain animations across a mix of object properties.">
        <ExampleCard>
          <ButtonRow>
            <Button
              accent="#845ef7"
              onClick={() =>
                setObj(
                  withSequence([
                    withSpring({ x: 100, y: 100 }),
                    withTiming({ width: 200, height: 200 }),
                    withDelay(1000),
                    withTiming({ x: 0, y: 0 }, { duration: 3000 }),
                    withDecay(0.5),
                  ])
                )
              }
            >
              Sequence: Spring → Timing → Delay → Timing → Decay
            </Button>
          </ButtonRow>
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
        </ExampleCard>
      </Section>

      <Section title="Object with loop" description="Loop a chained animation across object properties.">
        <ExampleCard>
          <ButtonRow>
            <Button
              accent="#20c997"
              onClick={() =>
                setObj(
                  withLoop(
                    withSequence([
                      withTiming({ x: 100 }),
                      withTiming({ y: 100 }),
                      withTiming({ x: 0 }),
                      withTiming({ y: 0 }),
                    ]),
                    5
                  )
                )
              }
            >
              Loop sequence (5 times)
            </Button>
          </ButtonRow>
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
        </ExampleCard>
      </Section>
    </ExampleLayout>
  );
};

export default Example;
