import React, { useState } from 'react';
import {
  animate,
  withDelay,
  withTiming,
  withSpring,
  withSequence,
} from 'react-ui-animate';
import { ExampleLayout, Section, ExampleCard } from '../shared';

const Example: React.FC = () => {
  const [trigger, setTrigger] = useState(0);

  return (
    <ExampleLayout
      title="withDelay Descriptor"
      description="Delay animations in sequences — use withDelay inside withSequence to add pauses between animations"
      tag="Descriptor"
      onRestart={() => setTrigger((prev) => prev + 1)}
    >
      <Section title="Basic Delay in Sequence" description="Waits 500ms, then fades in">
        <ExampleCard align="center">
          <animate.div
            key={trigger}
            style={{
              width: 100,
              height: 100,
              backgroundColor: '#3399ff',
              borderRadius: 8,
              opacity: 0,
            }}
            animate={{
              opacity: withSequence([
                withDelay(500),
                withTiming(1, { duration: 500 }),
              ]),
            }}
          />
        </ExampleCard>
      </Section>

      <Section
        title="Multiple Delays in Sequence"
        description="Moves right, delays, moves further, delays, returns"
      >
        <ExampleCard align="center">
          <animate.div
            key={trigger}
            style={{
              width: 100,
              height: 100,
              backgroundColor: '#ff6b6b',
              borderRadius: 8,
              translateX: 0,
            }}
            animate={{
              translateX: withSequence([
                withTiming(100, { duration: 300 }),
                withDelay(500),
                withTiming(200, { duration: 300 }),
                withDelay(500),
                withTiming(0, { duration: 300 }),
              ]),
            }}
          />
        </ExampleCard>
      </Section>

      <Section
        title="Delay Between Different Animation Types"
        description="Spring animation, then delay, then timing/spring back"
      >
        <ExampleCard align="center">
          <animate.div
            key={trigger}
            style={{
              width: 100,
              height: 100,
              backgroundColor: '#51cf66',
              borderRadius: 8,
              translateX: 0,
              scale: 1,
            }}
            animate={{
              translateX: withSequence([
                withSpring(150, { stiffness: 100, damping: 15 }),
                withDelay(800),
                withTiming(0, { duration: 500 }),
              ]),
              scale: withSequence([
                withSpring(1.5, { stiffness: 200, damping: 20 }),
                withDelay(800),
                withSpring(1, { stiffness: 100, damping: 15 }),
              ]),
            }}
          />
        </ExampleCard>
      </Section>

      <Section
        title="Staggered Delays with Multiple Elements"
        description="Each item delays by 200ms more than the previous"
      >
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          {[0, 1, 2, 3].map((index) => (
            <animate.div
              key={`${trigger}-${index}`}
              style={{
                width: 80,
                height: 80,
                backgroundColor: ['#ff6b6b', '#51cf66', '#ffd43b', '#845ef7'][
                  index
                ],
                borderRadius: 8,
                opacity: 0,
                scale: 0.5,
              }}
              animate={{
                opacity: withSequence([
                  withDelay(index * 200),
                  withTiming(1, { duration: 500 }),
                ]),
                scale: withSequence([
                  withDelay(index * 200),
                  withSpring(1, { stiffness: 100, damping: 15 }),
                ]),
              }}
            />
          ))}
        </div>
      </Section>

      <Section title="Long Delay" description="Waits 1 second before moving">
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
              translateX: withSequence([
                withDelay(1000),
                withTiming(200, { duration: 500 }),
              ]),
            }}
          />
        </ExampleCard>
      </Section>
    </ExampleLayout>
  );
};

export default Example;
