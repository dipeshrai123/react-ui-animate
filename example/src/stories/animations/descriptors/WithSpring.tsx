import React, { useState } from 'react';
import { animate, withSpring } from 'react-ui-animate';
import { ExampleLayout, Section, ExampleCard } from '../shared';

const Example: React.FC = () => {
  const [trigger, setTrigger] = useState(0);

  return (
    <ExampleLayout
      title="withSpring Descriptor"
      description="Spring animations provide natural, physics-based motion with configurable stiffness and damping"
      onRestart={() => setTrigger((prev) => prev + 1)}
    >
      <Section title="Basic Spring">
        <ExampleCard>
          <animate.div
            key={trigger}
            style={{
              width: 100,
              height: 100,
              backgroundColor: '#3399ff',
              borderRadius: 8,
              scale: 0,
            }}
            animate={{
              scale: withSpring(1, { stiffness: 100, damping: 15 }),
            }}
          />
        </ExampleCard>
      </Section>

      <Section
        title="Custom Stiffness & Damping"
        description="Different spring configurations create different feels"
      >
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          <animate.div
            key={`low-${trigger}`}
            style={{
              width: 80,
              height: 80,
              backgroundColor: '#ff6b6b',
              borderRadius: 8,
              translateX: 0,
            }}
            animate={{
              translateX: withSpring(200, { stiffness: 50, damping: 10 }),
            }}
          />
          <animate.div
            key={`medium-${trigger}`}
            style={{
              width: 80,
              height: 80,
              backgroundColor: '#51cf66',
              borderRadius: 8,
              translateX: 0,
            }}
            animate={{
              translateX: withSpring(200, { stiffness: 200, damping: 20 }),
            }}
          />
          <animate.div
            key={`high-${trigger}`}
            style={{
              width: 80,
              height: 80,
              backgroundColor: '#ffd43b',
              borderRadius: 8,
              translateX: 0,
            }}
            animate={{
              translateX: withSpring(200, { stiffness: 300, damping: 30 }),
            }}
          />
        </div>
        <p style={{ marginTop: 10, fontSize: 12, color: '#999' }}>
          Left: Low stiffness (bouncy) | Middle: Medium | Right: High stiffness
          (stiff)
        </p>
      </Section>

      <Section title="Multiple Properties">
        <ExampleCard>
          <animate.div
            key={trigger}
            style={{
              width: 100,
              height: 100,
              backgroundColor: '#845ef7',
              borderRadius: 8,
              scale: 0.5,
              rotate: 0,
              opacity: 0.5,
            }}
            animate={{
              scale: withSpring(1, { stiffness: 100, damping: 15 }),
              rotate: withSpring(360, { stiffness: 80, damping: 12 }),
              opacity: withSpring(1, { stiffness: 120, damping: 18 }),
            }}
          />
        </ExampleCard>
      </Section>

      <Section
        title="With Mass"
        description="Mass affects the inertia of the spring animation"
      >
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
              translateY: withSpring(200, {
                stiffness: 100,
                damping: 15,
                mass: 2, // Heavier mass = slower animation
              }),
            }}
          />
        </ExampleCard>
      </Section>
    </ExampleLayout>
  );
};

export default Example;
