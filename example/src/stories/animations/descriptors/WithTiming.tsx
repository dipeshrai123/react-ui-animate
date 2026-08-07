import React, { useState } from 'react';
import { animate, withTiming, Easing } from 'react-ui-animate';
import { ExampleLayout, Section, ExampleCard } from '../shared';

const Example: React.FC = () => {
  const [trigger, setTrigger] = useState(0);

  return (
    <ExampleLayout
      title="withTiming Descriptor"
      description="Timing animations provide precise, duration-based motion"
      tag="Descriptor"
      onRestart={() => setTrigger((prev) => prev + 1)}
    >
      <Section title="Basic Timing">
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
              translateX: withTiming(200, { duration: 500 }),
            }}
          />
        </ExampleCard>
      </Section>

      <Section title="Different Durations">
        <ExampleCard>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          <animate.div
            key={`duration-300-${trigger}`}
            style={{
              width: 80,
              height: 80,
              backgroundColor: '#ff6b6b',
              borderRadius: 8,
              translateX: 0,
            }}
            animate={{
              translateX: withTiming(150, { duration: 300 }),
            }}
          />
          <animate.div
            key={`duration-1000-${trigger}`}
            style={{
              width: 80,
              height: 80,
              backgroundColor: '#51cf66',
              borderRadius: 8,
              translateX: 0,
            }}
            animate={{
              translateX: withTiming(150, { duration: 1000 }),
            }}
          />
          <animate.div
            key={`duration-2000-${trigger}`}
            style={{
              width: 80,
              height: 80,
              backgroundColor: '#ffd43b',
              borderRadius: 8,
              translateX: 0,
            }}
            animate={{
              translateX: withTiming(150, { duration: 2000 }),
            }}
          />
        </div>
        <p style={{ marginTop: 10, fontSize: 12, color: '#6c6c76' }}>
          Left: 300ms | Middle: 1000ms | Right: 2000ms
        </p>
        </ExampleCard>
      </Section>

      <Section title="With Easing Functions">
        <ExampleCard>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          <animate.div
            key={`easing-linear-${trigger}`}
            style={{
              width: 80,
              height: 80,
              backgroundColor: '#845ef7',
              borderRadius: 8,
              translateX: 0,
            }}
            animate={{
              translateX: withTiming(150, {
                duration: 800,
                easing: Easing.linear,
              }),
            }}
          />
          <animate.div
            key={`easing-ease-${trigger}`}
            style={{
              width: 80,
              height: 80,
              backgroundColor: '#20c997',
              borderRadius: 8,
              translateX: 0,
            }}
            animate={{
              translateX: withTiming(150, {
                duration: 800,
                easing: Easing.ease,
              }),
            }}
          />
          <animate.div
            key={`easing-inout-${trigger}`}
            style={{
              width: 80,
              height: 80,
              backgroundColor: '#ff8787',
              borderRadius: 8,
              translateX: 0,
            }}
            animate={{
              translateX: withTiming(150, {
                duration: 800,
                easing: Easing.inOut(Easing.ease),
              }),
            }}
          />
          <animate.div
            key={`easing-bounce-${trigger}`}
            style={{
              width: 80,
              height: 80,
              backgroundColor: '#ff6b6b',
              borderRadius: 8,
              translateX: 0,
            }}
            animate={{
              translateX: withTiming(150, {
                duration: 800,
                easing: Easing.bounce,
              }),
            }}
          />
        </div>
        <p style={{ marginTop: 10, fontSize: 12, color: '#6c6c76' }}>
          Linear | Ease | Ease In-Out | Bounce
        </p>
        </ExampleCard>
      </Section>

      <Section title="Multiple Properties">
        <ExampleCard align="center">
          <animate.div
            key={trigger}
            style={{
              width: 100,
              height: 100,
              backgroundColor: '#3399ff',
              borderRadius: 8,
              opacity: 0,
              translateX: 0,
              scale: 0.5,
            }}
            animate={{
              opacity: withTiming(1, { duration: 600 }),
              translateX: withTiming(200, { duration: 600 }),
              scale: withTiming(1, { duration: 600 }),
            }}
          />
        </ExampleCard>
      </Section>
    </ExampleLayout>
  );
};

export default Example;
