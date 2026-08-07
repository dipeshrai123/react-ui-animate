import React, { useState } from 'react';
import { animate, useValue, withKeyframes, Easing } from 'react-ui-animate';
import { ExampleLayout, Section, ExampleCard, Button } from '../shared';

const Example: React.FC = () => {
  const [trigger, setTrigger] = useState(0);
  const [x, setX] = useValue(0);

  return (
    <ExampleLayout
      title="withKeyframes Descriptor"
      description={
        <>
          Animate a value through a list of intermediate stops in one call,
          instead of hand-rolling a <code>withSequence</code> of{' '}
          <code>withTiming</code> steps.
        </>
      }
      tag="Descriptor"
      onRestart={() => setTrigger((prev) => prev + 1)}
    >
      <Section
        title="Basic Keyframes"
        description="Each stop gets an equal share of the total duration (900ms / 4 steps)"
      >
        <ExampleCard align="center">
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
              translateX: withKeyframes([0, 200, 100, 200], { duration: 900 }),
            }}
          />
        </ExampleCard>
      </Section>

      <Section
        title="Per-Step Overrides"
        description={
          <>
            Individual steps can override <code>duration</code> and{' '}
            <code>easing</code>
          </>
        }
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
              translateX: withKeyframes([
                0,
                { to: 200, duration: 200, easing: Easing.linear },
                { to: 50, duration: 600 },
                200,
              ]),
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
              backgroundColor: '#51cf66',
              borderRadius: 8,
              scale: 1,
            }}
            animate={{
              scale: withKeyframes([1, 1.4, 0.8, 1], {
                duration: 800,
                onStart: () => console.log('Keyframes started'),
                onComplete: () => console.log('Keyframes completed'),
              }),
            }}
          />
        </ExampleCard>
      </Section>

      <Section title="Driven by a Value">
        <ExampleCard align="center">
          <animate.div
            style={{
              width: 100,
              height: 100,
              backgroundColor: '#ffd43b',
              borderRadius: 8,
              translateX: x,
              marginBottom: 20,
            }}
          />
          <Button
            variant="primary"
            accent="#ffd43b"
            onClick={() =>
              setX(withKeyframes([0, 250, 120, 250, 0], { duration: 1200 }))
            }
          >
            Run Keyframes on x
          </Button>
        </ExampleCard>
      </Section>
    </ExampleLayout>
  );
};

export default Example;
