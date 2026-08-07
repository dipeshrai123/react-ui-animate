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
import { ExampleLayout, Section, ExampleCard, Button, ButtonRow } from '../../shared';

const Example: React.FC = () => {
  const [x, setX, controls] = useValue(0);

  return (
    <ExampleLayout
      tag="HOOK"
      title="useValue — animation controls"
      description="useValue returns a third value alongside [value, setValue]: a controls object exposing pause() and resume() for any animation currently running."
      showRestartButton={false}
    >
      <Section title="Basic controls" description="Pause and resume a running animation mid-flight.">
        <ExampleCard>
          <ButtonRow>
            <Button variant="primary" onClick={() => setX(withTiming(200, { duration: 5000 }))}>
              Start long animation (5s)
            </Button>
            <Button accent="#51cf66" onClick={() => setX(withSpring(300))}>
              Start spring animation
            </Button>
          </ButtonRow>
          <ButtonRow>
            <Button accent="#ff6b6b" onClick={() => controls.pause()}>
              Pause
            </Button>
            <Button accent="#51cf66" onClick={() => controls.resume()}>
              Resume
            </Button>
            <Button variant="ghost" onClick={() => setX(0)}>
              Reset to 0
            </Button>
          </ButtonRow>
          <animate.div
            style={{
              width: 100,
              height: 100,
              backgroundColor: '#3399ff',
              borderRadius: 8,
              translateX: x,
            }}
          />
        </ExampleCard>
      </Section>

      <Section title="Controls with a sequence" description="Pause/resume works even mid-way through a chained withSequence animation.">
        <ExampleCard>
          <ButtonRow>
            <Button
              accent="#845ef7"
              onClick={() =>
                setX(
                  withSequence([
                    withSpring(100),
                    withDelay(2000),
                    withTiming(200),
                    withDecay(1),
                  ])
                )
              }
            >
              Start sequence
            </Button>
          </ButtonRow>
          <ButtonRow>
            <Button accent="#ff6b6b" onClick={() => controls.pause()}>
              Pause
            </Button>
            <Button accent="#51cf66" onClick={() => controls.resume()}>
              Resume
            </Button>
          </ButtonRow>
          <animate.div
            style={{
              width: 100,
              height: 100,
              backgroundColor: '#845ef7',
              borderRadius: 8,
              translateX: x,
            }}
          />
        </ExampleCard>
      </Section>
    </ExampleLayout>
  );
};

export default Example;
