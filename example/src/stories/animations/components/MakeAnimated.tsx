import React, { useState } from 'react';
import { makeAnimated, withSpring, withTiming } from 'react-ui-animate';
import { ExampleLayout, Section, ExampleCard, theme } from '../shared';

// Create custom animated components
const AnimatedButton = makeAnimated('button');
const AnimatedSection = makeAnimated('section');
const AnimatedSpan = makeAnimated('span');

const Example: React.FC = () => {
  const [trigger, setTrigger] = useState(0);

  return (
    <ExampleLayout
      title="makeAnimated"
      tag="Component"
      description="Turn any HTML tag — button, section, span, or your own component — into an animatable one with a single factory call."
      onRestart={() => setTrigger((prev) => prev + 1)}
    >
      <Section title="Animated Button" description="Buttons stay fully interactive while animating.">
        <ExampleCard align="center">
          <AnimatedButton
            key={trigger}
            onClick={() => setTrigger((prev) => prev + 1)}
            style={{
              padding: '12px 24px',
              fontSize: 15,
              fontWeight: 600,
              backgroundColor: theme.color.accent,
              color: '#0a0a0d',
              border: 'none',
              borderRadius: theme.radius.sm,
              cursor: 'pointer',
              scale: 1,
            }}
            animate={{
              scale: withSpring(1.1, { stiffness: 300, damping: 20 }),
            }}
            press={{
              scale: withSpring(0.95, { stiffness: 400, damping: 25 }),
            }}
          >
            Click Me
          </AnimatedButton>
        </ExampleCard>
      </Section>

      <Section title="Animated Section">
        <ExampleCard align="center">
          <AnimatedSection
            key={trigger}
            style={{
              padding: 20,
              backgroundColor: theme.color.surfaceRaised,
              border: `1px solid ${theme.color.border}`,
              borderRadius: theme.radius.sm,
              color: theme.color.text,
              opacity: 0,
              translateY: 20,
            }}
            animate={{
              opacity: withTiming(1, { duration: 500 }),
              translateY: withSpring(0, { stiffness: 100, damping: 15 }),
            }}
          >
            <p>This is an animated section element</p>
          </AnimatedSection>
        </ExampleCard>
      </Section>

      <Section title="Animated Span">
        <ExampleCard align="center">
          <AnimatedSpan
            key={trigger}
            style={{
              display: 'inline-block',
              padding: '8px 16px',
              backgroundColor: '#51cf66',
              color: 'white',
              borderRadius: 4,
              scale: 0,
            }}
            animate={{
              scale: withSpring(1, { stiffness: 200, damping: 15 }),
            }}
          >
            Animated Span
          </AnimatedSpan>
        </ExampleCard>
      </Section>

      <Section
        title="Multiple Custom Components"
        description="Every instance created by makeAnimated animates independently."
      >
        <ExampleCard>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          <AnimatedButton
            key={`btn1-${trigger}`}
            style={{
              padding: '10px 20px',
              backgroundColor: '#ff6b6b',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              opacity: 0,
            }}
            animate={{
              opacity: withTiming(1, { duration: 500 }),
            }}
          >
            Button 1
          </AnimatedButton>
          <AnimatedButton
            key={`btn2-${trigger}`}
            style={{
              padding: '10px 20px',
              backgroundColor: '#ffd43b',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              opacity: 0,
            }}
            animate={{
              opacity: withTiming(1, { duration: 700 }),
            }}
          >
            Button 2
          </AnimatedButton>
          <AnimatedButton
            key={`btn3-${trigger}`}
            style={{
              padding: '10px 20px',
              backgroundColor: '#845ef7',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              opacity: 0,
            }}
            animate={{
              opacity: withTiming(1, { duration: 900 }),
            }}
          >
            Button 3
          </AnimatedButton>
        </div>
        </ExampleCard>
      </Section>
    </ExampleLayout>
  );
};

export default Example;
