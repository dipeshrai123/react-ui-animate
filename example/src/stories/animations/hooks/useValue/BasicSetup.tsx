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
  Unmount,
} from 'react-ui-animate';
import { ExampleLayout, Section, ExampleCard, Button, ButtonRow } from '../../shared';

const Example: React.FC = () => {
  const [x, setX] = useValue(0);
  const [mounted, setMounted] = useState(true);

  return (
    <ExampleLayout
      tag="HOOK"
      title="useValue — basic setup"
      description="useValue creates an animated value you control imperatively. It returns [value, setValue], where setValue accepts a descriptor (withSpring, withTiming, …) or an immediate value."
      showRestartButton={false}
    >
      <Section title="Basic usage" description="Drive one animated value with different descriptors.">
        <ExampleCard>
          <ButtonRow>
            <Button variant="primary" onClick={() => setX(withTiming(0, { duration: 500 }))}>
              Timing to 0
            </Button>
            <Button accent="#51cf66" onClick={() => setX(withSpring(100))}>
              Spring to 100
            </Button>
            <Button variant="ghost" onClick={() => setX(0)}>
              Immediate to 0
            </Button>
          </ButtonRow>
          <animate.div style={{ width: 100, height: 100, backgroundColor: '#3399ff', borderRadius: 8, translateX: x }} />
        </ExampleCard>
      </Section>

      <Section title="Loop animation" description="Repeat an animation a fixed number of times.">
        <ExampleCard>
          <ButtonRow>
            <Button accent="#845ef7" onClick={() => setX(withLoop(withSpring(100), 5))}>
              Loop 0 → 100 (5 times)
            </Button>
          </ButtonRow>
          <animate.div style={{ width: 100, height: 100, backgroundColor: '#845ef7', borderRadius: 8, translateX: x }} />
        </ExampleCard>
      </Section>

      <Section title="Explicit from value" description="Force an animation to start from a specific value, regardless of the current one.">
        <ExampleCard>
          <ButtonRow>
            <Button accent="#20c997" onClick={() => setX(withSpring(100, { from: 0 }))}>
              Spring 0 → 100 (explicit from)
            </Button>
            <Button accent="#ffd43b" onClick={() => setX(withTiming(200, { from: 50, duration: 500 }))}>
              Timing 50 → 200 (explicit from)
            </Button>
          </ButtonRow>
          <animate.div style={{ width: 100, height: 100, backgroundColor: '#20c997', borderRadius: 8, translateX: x }} />
        </ExampleCard>
      </Section>

      <Section title="Decay animation" description="Physics-based deceleration, as if the value were given an initial velocity.">
        <ExampleCard>
          <ButtonRow>
            <Button accent="#ff8787" onClick={() => setX(withDecay(1))}>
              Decay animation
            </Button>
          </ButtonRow>
          <animate.div style={{ width: 100, height: 100, backgroundColor: '#ff8787', borderRadius: 8, translateX: x }} />
        </ExampleCard>
      </Section>

      <Section title="Sequence animation" description="Chain several descriptors together into one continuous animation.">
        <ExampleCard>
          <ButtonRow>
            <Button
              accent="#ff6b6b"
              onClick={() =>
                setX(withSequence([withSpring(100), withDelay(2000), withTiming(200), withDecay(1)]))
              }
            >
              Sequence: spring → delay → timing → decay
            </Button>
          </ButtonRow>
          <animate.div style={{ width: 100, height: 100, backgroundColor: '#ff6b6b', borderRadius: 8, translateX: x }} />
        </ExampleCard>
      </Section>

      <Section title="With Unmount" description="useValue works seamlessly inside Unmount for exit animations.">
        <ExampleCard>
          <ButtonRow>
            <Button variant="primary" onClick={() => setMounted(!mounted)}>
              {mounted ? 'Hide' : 'Show'} element
            </Button>
          </ButtonRow>
          <Unmount>
            {mounted && (
              <animate.div
                key="box"
                onClick={() => setMounted(false)}
                style={{ width: 100, height: 100, backgroundColor: '#3399ff', borderRadius: 8, cursor: 'pointer' }}
                animate={{ width: 200, height: 200, backgroundColor: '#ff6b6b' }}
                unmount={{ opacity: withTiming(0, { duration: 1000 }) }}
              />
            )}
          </Unmount>
        </ExampleCard>
      </Section>
    </ExampleLayout>
  );
};

export default Example;
