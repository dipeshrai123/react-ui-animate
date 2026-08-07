import React, { useState } from 'react';
import { animate, withLoop, withSequence, withTiming, withSpring } from 'react-ui-animate';
import { ExampleLayout, Section, ExampleCard } from '../shared';

const Example: React.FC = () => {
  const [trigger, setTrigger] = useState(0);

  return (
    <ExampleLayout
      title="withLoop Descriptor"
      description="Loop animations a specified number of times or infinitely"
      tag="Descriptor"
      onRestart={() => setTrigger((prev) => prev + 1)}
    >
      <Section title="Finite Loop (3 times)" description="Rotates 3 times then stops">
        <ExampleCard align="center">
          <animate.div
            key={trigger}
            style={{
              width: 100,
              height: 100,
              backgroundColor: '#3399ff',
              borderRadius: 8,
              rotate: 0,
            }}
            animate={{
              rotate: withLoop(
                withSequence([
                  withTiming(90, { duration: 500 }),
                  withTiming(180, { duration: 500 }),
                  withTiming(270, { duration: 500 }),
                  withTiming(360, { duration: 500 }),
                ]),
                3
              ),
            }}
          />
        </ExampleCard>
      </Section>

      <Section title="Infinite Loop" description="Continuously rotates">
        <ExampleCard align="center">
          <animate.div
            key={trigger}
            style={{
              width: 100,
              height: 100,
              backgroundColor: '#ff6b6b',
              borderRadius: 8,
              rotate: 0,
            }}
            animate={{
              rotate: withLoop(withTiming(360, { duration: 1000 }), Infinity),
            }}
          />
        </ExampleCard>
      </Section>

      <Section title="Spring Loop" description="Pulses 5 times with spring animation">
        <ExampleCard align="center">
          <animate.div
            key={trigger}
            style={{
              width: 100,
              height: 100,
              backgroundColor: '#51cf66',
              borderRadius: 8,
              scale: 1,
            }}
            animate={{
              scale: withLoop(
                withSequence([
                  withSpring(1.5, { stiffness: 200, damping: 15 }),
                  withSpring(1, { stiffness: 200, damping: 15 }),
                ]),
                5
              ),
            }}
          />
        </ExampleCard>
      </Section>

      <Section title="Complex Loop">
        <ExampleCard align="center">
          <animate.div
            key={trigger}
            style={{
              width: 100,
              height: 100,
              backgroundColor: '#ffd43b',
              borderRadius: 8,
              translateX: 0,
              rotate: 0,
            }}
            animate={{
              translateX: withLoop(
                withSequence([
                  withTiming(100, { duration: 400 }),
                  withTiming(0, { duration: 400 }),
                ]),
                4
              ),
              rotate: withLoop(withTiming(360, { duration: 1600 }), 4),
            }}
          />
        </ExampleCard>
      </Section>

      <Section
        title="Yoyo"
        description={
          <>
            <code>{'{ yoyo: true }'}</code> alternates direction each
            iteration (0 → 200 → 0 → ...) instead of restarting forward every
            time. <code>iterations</code> counts legs, so 6 here means 3 round
            trips.
          </>
        }
      >
        <ExampleCard align="center">
          <animate.div
            key={trigger}
            style={{
              width: 100,
              height: 100,
              backgroundColor: '#20c997',
              borderRadius: 8,
              translateX: 0,
            }}
            animate={{
              translateX: withLoop(withSpring(200, { stiffness: 200, damping: 20 }), 6, {
                yoyo: true,
              }),
            }}
          />
        </ExampleCard>
      </Section>

      <Section title="With Callbacks" description="Check the console for callbacks">
        <ExampleCard align="center">
          <animate.div
            key={trigger}
            style={{
              width: 100,
              height: 100,
              backgroundColor: '#845ef7',
              borderRadius: 8,
              opacity: 1,
            }}
            animate={{
              opacity: withLoop(
                withSequence([
                  withTiming(0.5, { duration: 500 }),
                  withTiming(1, { duration: 500 }),
                ]),
                3,
                {
                  onStart: () => console.log('Loop started'),
                  onComplete: () => console.log('Loop completed'),
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
