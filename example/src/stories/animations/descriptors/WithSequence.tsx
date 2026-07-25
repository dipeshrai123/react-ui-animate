import React, { useState } from 'react';
import { animate, withSequence, withTiming, withSpring } from 'react-ui-animate';
import { ExampleLayout, Section, ExampleCard } from '../shared';

const Example: React.FC = () => {
  const [trigger, setTrigger] = useState(0);

  return (
    <ExampleLayout
      title="withSequence Descriptor"
      description="Run animations one after another in sequence"
      onRestart={() => setTrigger((prev) => prev + 1)}
    >
      <Section title="Basic Sequence" description="Moves right, then further right, then back">
        <ExampleCard>
          <animate.div
            key={trigger}
            style={{
              width: 100,
              height: 100,
              backgroundColor: '#3399ff',
              borderRadius: 8,
              translateX: 0,
            }}
            animate={{
              translateX: withSequence([
                withTiming(100, { duration: 300 }),
                withTiming(200, { duration: 300 }),
                withTiming(0, { duration: 300 }),
              ]),
            }}
          />
        </ExampleCard>
      </Section>

      <Section title="Mixed Animation Types">
        <ExampleCard>
          <animate.div
            key={trigger}
            style={{
              width: 100,
              height: 100,
              backgroundColor: '#ff6b6b',
              borderRadius: 8,
              translateX: 0,
              scale: 1,
            }}
            animate={{
              translateX: withSequence([
                withTiming(150, { duration: 400 }),
                withSpring(0, { stiffness: 100, damping: 15 }),
              ]),
              scale: withSequence([
                withSpring(1.5, { stiffness: 200, damping: 20 }),
                withTiming(1, { duration: 300 }),
              ]),
            }}
          />
        </ExampleCard>
      </Section>

      <Section title="Complex Sequence">
        <ExampleCard>
          <animate.div
            key={trigger}
            style={{
              width: 100,
              height: 100,
              backgroundColor: '#51cf66',
              borderRadius: 8,
              translateX: 0,
              rotate: 0,
            }}
            animate={{
              translateX: withSequence([
                withTiming(100, { duration: 300 }),
                withTiming(200, { duration: 300 }),
                withTiming(100, { duration: 300 }),
                withTiming(0, { duration: 300 }),
              ]),
              rotate: withSequence([
                withTiming(90, { duration: 300 }),
                withTiming(180, { duration: 300 }),
                withTiming(270, { duration: 300 }),
                withTiming(360, { duration: 300 }),
              ]),
            }}
          />
        </ExampleCard>
      </Section>

      <Section title="With Callbacks" description="Check the console for callbacks">
        <ExampleCard>
          <animate.div
            key={trigger}
            style={{
              width: 100,
              height: 100,
              backgroundColor: '#ffd43b',
              borderRadius: 8,
              opacity: 0,
            }}
            animate={{
              opacity: withSequence(
                [
                  withTiming(1, { duration: 500 }),
                  withTiming(0.5, { duration: 500 }),
                  withTiming(1, { duration: 500 }),
                ],
                {
                  onStart: () => console.log('Sequence started'),
                  onComplete: () => console.log('Sequence completed'),
                }
              ),
            }}
          />
        </ExampleCard>
      </Section>
    </ExampleLayout>
  );
};

export default Example;
