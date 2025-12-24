import React, { useState, useMemo } from 'react';
import {
  animate,
  withTiming,
  withSpring,
  withSequence,
  withLoop,
} from 'react-ui-animate';
import { ExampleLayout, Section, ExampleCard } from '../shared';

const Example: React.FC = () => {
  const [trigger, setTrigger] = useState(0);

  const handleAnimate = () => {
    setTrigger((prev) => prev + 1);
  };

  // Memoize animate props to ensure they're recreated on trigger change
  const timingAnimate = useMemo(
    () => ({
      opacity: withTiming(1, { duration: 500 }),
      translateX: withTiming(200, { duration: 500 }),
    }),
    [trigger]
  );

  const springAnimate = useMemo(
    () => ({
      scale: withSpring(1, { stiffness: 100, damping: 10 }),
      rotate: withSpring(360, { stiffness: 50, damping: 15 }),
    }),
    [trigger]
  );

  const multipleAnimate = useMemo(
    () => ({
      opacity: withTiming(1, { duration: 600 }),
      translateX: withSpring(150, { stiffness: 80, damping: 12 }),
      translateY: withSpring(50, { stiffness: 80, damping: 12 }),
      scale: withSpring(1.2, { stiffness: 100, damping: 10 }),
    }),
    [trigger]
  );

  const sequenceAnimate = useMemo(
    () => ({
      translateX: withSequence([
        withTiming(100, { duration: 300 }),
        withTiming(200, { duration: 300 }),
        withTiming(0, { duration: 300 }),
      ]),
    }),
    [trigger]
  );

  const loopAnimate = useMemo(
    () => ({
      rotate: withLoop(
        withSequence([
          withTiming(90, { duration: 500 }),
          withTiming(180, { duration: 500 }),
          withTiming(270, { duration: 500 }),
          withTiming(360, { duration: 500 }),
        ]),
        2
      ),
    }),
    [trigger]
  );

  const combinedAnimate = useMemo(
    () => ({
      opacity: withTiming(1, { duration: 400 }),
      translateX: withSpring(0, { stiffness: 120, damping: 15 }),
      scale: withSpring(1, { stiffness: 100, damping: 10 }),
    }),
    [trigger]
  );

  const initialAnimate = useMemo(
    () => ({
      opacity: withTiming(1, { duration: 500 }),
      translateX: withSpring(200, { stiffness: 80, damping: 12 }),
    }),
    [trigger]
  );

  return (
    <ExampleLayout
      title="animate Component"
      description="The animate component provides declarative animations using the animate prop"
      onRestart={handleAnimate}
    >
      <Section title="Basic Timing Animation">
        <ExampleCard>
          <animate.div
            key={trigger}
            style={{
              width: 100,
              height: 100,
              backgroundColor: '#3399ff',
              borderRadius: 8,
              opacity: 0,
              translateX: 0,
            }}
            animate={timingAnimate}
          />
        </ExampleCard>
      </Section>

      <Section title="Spring Animation">
        <ExampleCard>
          <animate.div
            key={trigger}
            style={{
              width: 100,
              height: 100,
              backgroundColor: '#ff6b6b',
              borderRadius: 8,
              scale: 0.5,
              rotate: 0,
            }}
            animate={springAnimate}
          />
        </ExampleCard>
      </Section>

      <Section title="Multiple Properties">
        <ExampleCard>
          <animate.div
            key={trigger}
            style={{
              width: 100,
              height: 100,
              backgroundColor: '#51cf66',
              borderRadius: 8,
              opacity: 0,
              translateX: 0,
              translateY: 0,
              scale: 0.8,
            }}
            animate={multipleAnimate}
          />
        </ExampleCard>
      </Section>

      <Section title="Sequence Animation">
        <ExampleCard>
          <animate.div
            key={trigger}
            style={{
              width: 100,
              height: 100,
              backgroundColor: '#ffd43b',
              borderRadius: 8,
              translateX: 0,
            }}
            animate={sequenceAnimate}
          />
        </ExampleCard>
      </Section>

      <Section title="Loop Animation">
        <ExampleCard>
          <animate.div
            key={trigger}
            style={{
              width: 100,
              height: 100,
              backgroundColor: '#845ef7',
              borderRadius: 8,
              rotate: 0,
            }}
            animate={loopAnimate}
          />
        </ExampleCard>
      </Section>

      <Section title="Combined: Opacity + Transform">
        <ExampleCard>
          <animate.div
            key={trigger}
            style={{
              width: 100,
              height: 100,
              backgroundColor: '#ff8787',
              borderRadius: 8,
              opacity: 0,
              translateX: -50,
              scale: 0.5,
            }}
            animate={combinedAnimate}
          />
        </ExampleCard>
      </Section>

      <Section title="With Initial Style Values">
        <ExampleCard>
          <animate.div
            key={trigger}
            style={{
              width: 100,
              height: 100,
              backgroundColor: '#20c997',
              borderRadius: 8,
              opacity: 0.3,
              translateX: 50,
            }}
            animate={initialAnimate}
          />
        </ExampleCard>
      </Section>
    </ExampleLayout>
  );
};

export default Example;

