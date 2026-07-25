import React, { useState } from 'react';
import { animate, withTiming, Easing } from 'react-ui-animate';
import { ExampleLayout, Section, ExampleCard } from '../shared';

const easingFunctions = [
  { name: 'linear', easing: Easing.linear },
  { name: 'ease', easing: Easing.ease },
  { name: 'quad', easing: Easing.quad },
  { name: 'cubic', easing: Easing.cubic },
  { name: 'sin', easing: Easing.sin },
  { name: 'circle', easing: Easing.circle },
  { name: 'exp', easing: Easing.exp },
  { name: 'bounce', easing: Easing.bounce },
  { name: 'in(ease)', easing: Easing.in(Easing.ease) },
  { name: 'out(ease)', easing: Easing.out(Easing.ease) },
  { name: 'inOut(ease)', easing: Easing.inOut(Easing.ease) },
  { name: 'bezier', easing: Easing.bezier(0.68, -0.55, 0.265, 1.55) },
];

const Example: React.FC = () => {
  const [trigger, setTrigger] = useState(0);

  return (
    <ExampleLayout
      title="Easing Functions"
      description="Different easing functions for custom animation curves"
      onRestart={() => setTrigger((prev) => prev + 1)}
    >
      <Section title="All Easing Functions">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 20,
          }}
        >
          {easingFunctions.map(({ name, easing }) => (
            <ExampleCard key={name} title={name}>
              <animate.div
                key={trigger}
                style={{
                  width: '100%',
                  height: 60,
                  backgroundColor: '#3399ff',
                  borderRadius: 8,
                  translateX: 0,
                }}
                animate={{
                  translateX: withTiming(150, {
                    duration: 1000,
                    easing,
                  }),
                }}
              />
            </ExampleCard>
          ))}
        </div>
      </Section>

      <Section title="Custom Bezier Curves">
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          <ExampleCard title="Ease In Out">
            <animate.div
              key={trigger}
              style={{
                width: 150,
                height: 60,
                backgroundColor: '#ff6b6b',
                borderRadius: 8,
                translateX: 0,
              }}
              animate={{
                translateX: withTiming(200, {
                  duration: 1000,
                  easing: Easing.bezier(0.42, 0, 0.58, 1),
                }),
              }}
            />
          </ExampleCard>
          <ExampleCard title="Bounce">
            <animate.div
              key={trigger}
              style={{
                width: 150,
                height: 60,
                backgroundColor: '#51cf66',
                borderRadius: 8,
                translateX: 0,
              }}
              animate={{
                translateX: withTiming(200, {
                  duration: 1000,
                  easing: Easing.bezier(0.68, -0.55, 0.265, 1.55),
                }),
              }}
            />
          </ExampleCard>
          <ExampleCard title="Elastic">
            <animate.div
              key={trigger}
              style={{
                width: 150,
                height: 60,
                backgroundColor: '#ffd43b',
                borderRadius: 8,
                translateX: 0,
              }}
              animate={{
                translateX: withTiming(200, {
                  duration: 1000,
                  easing: Easing.elastic(1),
                }),
              }}
            />
          </ExampleCard>
        </div>
      </Section>
    </ExampleLayout>
  );
};

export default Example;
