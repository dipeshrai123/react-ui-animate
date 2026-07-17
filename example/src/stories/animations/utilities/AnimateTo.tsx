import React, { useState } from 'react';
import { animate, useValue, animateTo, withSpring, withTiming } from 'react-ui-animate';
import { ExampleLayout, Section, ExampleCard } from '../shared';

const Example: React.FC = () => {
  const [trigger, setTrigger] = useState(0);
  const [running, setRunning] = useState(false);
  const [x, setX] = useValue(0);
  const [scale, setScale] = useValue(1);
  const [opacity, setOpacity] = useValue(1);

  const runSequence = async () => {
    if (running) return;
    setRunning(true);

    // Each step lives on a *different* value — withSequence only chains
    // steps on one value, so this is what animateTo is for: awaiting a
    // descriptor's completion so separate AnimateValues can be sequenced
    // with plain async/await.
    await animateTo(setX, withSpring(200, { stiffness: 200, damping: 20 }));
    await animateTo(setScale, withSpring(1.4, { stiffness: 300, damping: 15 }));
    await animateTo(setOpacity, withTiming(0.4, { duration: 300 }));
    await animateTo(setOpacity, withTiming(1, { duration: 300 }));
    await animateTo(setScale, withSpring(1));
    await animateTo(setX, withSpring(0));

    setRunning(false);
  };

  return (
    <ExampleLayout
      title="animateTo Utility"
      description="Wraps a descriptor's onComplete callback in a Promise, so animations on different AnimateValues can be sequenced with ordinary async/await instead of only within a single withSequence chain. The same primitive is useful in tests: await animateTo(...) instead of hand-rolling jest.advanceTimersByTime plus manual assertions."
      onRestart={() => setTrigger((prev) => prev + 1)}
    >
      <Section
        title="Sequencing Across Multiple Values"
        description="Move, then pulse, then flash, then settle back — six awaited steps across three separate values, one after another."
      >
        <ExampleCard>
          <div
            style={{
              position: 'relative',
              width: 400,
              height: 140,
              border: '2px solid #ddd',
              borderRadius: 8,
              backgroundColor: '#f5f5f5',
              marginBottom: 20,
            }}
          >
            <animate.div
              key={trigger}
              style={{
                position: 'absolute',
                left: 20,
                top: 40,
                width: 60,
                height: 60,
                backgroundColor: '#3399ff',
                borderRadius: 12,
                translateX: x,
                scale,
                opacity,
              }}
            />
          </div>
          <button
            onClick={runSequence}
            disabled={running}
            style={{
              padding: '8px 16px',
              fontSize: 14,
              backgroundColor: running ? '#aac9ec' : '#3399ff',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              cursor: running ? 'default' : 'pointer',
            }}
          >
            {running ? 'Running…' : 'Run Sequence'}
          </button>
          <pre
            style={{
              marginTop: 16,
              fontSize: 12,
              color: '#666',
              backgroundColor: '#fafafa',
              padding: 12,
              borderRadius: 6,
              overflowX: 'auto',
            }}
          >
{`await animateTo(setX, withSpring(200));
await animateTo(setScale, withSpring(1.4));
await animateTo(setOpacity, withTiming(0.4));
await animateTo(setOpacity, withTiming(1));
await animateTo(setScale, withSpring(1));
await animateTo(setX, withSpring(0));`}
          </pre>
        </ExampleCard>
      </Section>
    </ExampleLayout>
  );
};

export default Example;
