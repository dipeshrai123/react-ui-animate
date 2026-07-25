import React, { useState } from 'react';
import { animate, withDecay } from 'react-ui-animate';
import { ExampleLayout, Section, ExampleCard } from '../shared';

const Example: React.FC = () => {
  const [trigger, setTrigger] = useState(0);

  return (
    <ExampleLayout
      title="withDecay Descriptor"
      description="Decay animations simulate momentum-based motion that gradually slows down"
      onRestart={() => setTrigger((prev) => prev + 1)}
    >
      <Section title="Basic Decay" description="Velocity: 1 — gentle momentum that gradually slows down">
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
              translateX: withDecay(1),
            }}
          />
        </ExampleCard>
      </Section>

      <Section title="Different Velocities">
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          <animate.div
            key={`velocity-0.5-${trigger}`}
            style={{
              width: 80,
              height: 80,
              backgroundColor: '#ff6b6b',
              borderRadius: 8,
              translateX: 0,
            }}
            animate={{
              translateX: withDecay(0.5),
            }}
          />
          <animate.div
            key={`velocity-1-${trigger}`}
            style={{
              width: 80,
              height: 80,
              backgroundColor: '#51cf66',
              borderRadius: 8,
              translateX: 0,
            }}
            animate={{
              translateX: withDecay(1),
            }}
          />
          <animate.div
            key={`velocity-2-${trigger}`}
            style={{
              width: 80,
              height: 80,
              backgroundColor: '#ffd43b',
              borderRadius: 8,
              translateX: 0,
            }}
            animate={{
              translateX: withDecay(2),
            }}
          />
        </div>
        <p style={{ marginTop: 10, fontSize: 12, color: '#999' }}>
          Left: Low velocity (0.5) | Middle: Medium (1) | Right: High (2)
        </p>
      </Section>

      <Section title="With Hard Clamp" description="Animation stops abruptly at boundaries (0-400px)">
        <ExampleCard>
          <animate.div
            key={trigger}
            style={{
              width: 100,
              height: 100,
              backgroundColor: '#845ef7',
              borderRadius: 8,
              translateX: 0,
            }}
            animate={{
              translateX: withDecay(1.5, {
                clamp: [0, 400],
              }),
            }}
          />
        </ExampleCard>
      </Section>

      <Section
        title="With Elastic Clamp"
        description="Animation bounces back elastically at boundaries (0-400px)"
      >
        <ExampleCard>
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
              translateX: withDecay(1.5, {
                clamp: [0, 400],
                elastic: true,
              }),
            }}
          />
        </ExampleCard>
      </Section>

      <Section
        title="With Custom Elastic Constant"
        description="More elastic bounce with a custom constant (0.3)"
      >
        <ExampleCard>
          <animate.div
            key={trigger}
            style={{
              width: 100,
              height: 100,
              backgroundColor: '#51cf66',
              borderRadius: 8,
              translateX: 0,
            }}
            animate={{
              translateX: withDecay(1.5, {
                clamp: [0, 400],
                elastic: 0.3,
              }),
            }}
          />
        </ExampleCard>
      </Section>

      <Section title="Vertical Decay" description="Decay works in any direction">
        <ExampleCard>
          <animate.div
            key={trigger}
            style={{
              width: 100,
              height: 100,
              backgroundColor: '#20c997',
              borderRadius: 8,
              translateY: 0,
            }}
            animate={{
              translateY: withDecay(1),
            }}
          />
        </ExampleCard>
      </Section>
    </ExampleLayout>
  );
};

export default Example;
