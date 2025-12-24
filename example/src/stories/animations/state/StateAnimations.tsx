import React from 'react';
import { animate, withTiming, withSpring } from 'react-ui-animate';
import { ExampleLayout, Section, ExampleCard } from '../shared';

const Example: React.FC = () => {
  return (
    <ExampleLayout
      title="State Animations"
      description="Animations triggered by user interactions: hover, press, and focus states"
      showRestartButton={false}
    >
      <Section title="Hover Animation">
        <ExampleCard description="Scale and color change on hover">
          <animate.div
            style={{
              width: 100,
              height: 100,
              backgroundColor: '#3399ff',
              borderRadius: 8,
              scale: 1,
            }}
            hover={{
              scale: withSpring(1.2, { stiffness: 300, damping: 20 }),
              backgroundColor: '#ff6b6b',
            }}
          />
        </ExampleCard>
      </Section>

      <Section title="Press Animation">
        <ExampleCard description="Scale down on press/tap">
          <animate.div
            style={{
              width: 100,
              height: 100,
              backgroundColor: '#51cf66',
              borderRadius: 8,
              scale: 1,
            }}
            press={{
              scale: withSpring(0.9, { stiffness: 400, damping: 25 }),
            }}
          />
        </ExampleCard>
      </Section>

      <Section title="Focus Animation">
        <ExampleCard description="Scale and border color change on focus">
          <animate.input
            type="text"
            placeholder="Click to focus"
            style={{
              padding: '12px 16px',
              fontSize: 16,
              border: '2px solid #ccc',
              borderRadius: 8,
              outline: 'none',
              width: 200,
              scale: 1,
            }}
            focus={{
              scale: withSpring(1.05, { stiffness: 300, damping: 20 }),
              borderColor: withTiming('#3399ff', { duration: 200 }),
            }}
          />
        </ExampleCard>
      </Section>

      <Section title="Combined State Animations">
        <ExampleCard description="Hover and press working together">
          <animate.div
            style={{
              width: 120,
              height: 120,
              backgroundColor: '#845ef7',
              borderRadius: 12,
              scale: 1,
              cursor: 'pointer',
            }}
            hover={{
              scale: withSpring(1.1, { stiffness: 300, damping: 20 }),
              backgroundColor: '#a78bfa',
            }}
            press={{
              scale: withSpring(0.95, { stiffness: 400, damping: 25 }),
            }}
          />
        </ExampleCard>
      </Section>
    </ExampleLayout>
  );
};

export default Example;

