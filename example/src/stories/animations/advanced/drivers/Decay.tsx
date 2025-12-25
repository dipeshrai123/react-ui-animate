import React, { useRef, useState } from 'react';
import { animate, AnimateValue, decay } from 'react-ui-animate';
import { ExampleLayout, Section, ExampleCard } from '../../shared';

const Example: React.FC = () => {
  const [trigger, setTrigger] = useState(0);
  const valueRef = useRef(new AnimateValue(0));
  const controllerRef = useRef<ReturnType<typeof decay> | null>(null);

  const startDecay = (velocity: number) => {
    controllerRef.current?.cancel();
    controllerRef.current = decay(valueRef.current, velocity, {
      decay: 0.998,
      onStart: () => console.log('Decay animation started'),
      onComplete: () => console.log('Decay animation completed'),
    });
    controllerRef.current.start();
  };

  const pauseAnimation = () => {
    controllerRef.current?.pause();
  };

  const resumeAnimation = () => {
    controllerRef.current?.resume();
  };

  const cancelAnimation = () => {
    controllerRef.current?.cancel();
    valueRef.current.set(0);
  };

  return (
    <ExampleLayout
      title="decay Driver (Low-level API)"
      description="The decay driver creates physics-based deceleration animations. Use this when you need manual control. For most cases, use withDecay descriptor instead."
      onRestart={() => {
        cancelAnimation();
        setTrigger((prev) => prev + 1);
      }}
    >
      <Section
        title="Basic Decay Animation"
        description="Create a decay animation with different velocities"
      >
        <ExampleCard>
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
              <button onClick={() => startDecay(0.5)} style={buttonStyle}>
                Slow (0.5)
              </button>
              <button onClick={() => startDecay(1)} style={buttonStyle}>
                Medium (1)
              </button>
              <button onClick={() => startDecay(2)} style={buttonStyle}>
                Fast (2)
              </button>
              <button onClick={pauseAnimation} style={{ ...buttonStyle, backgroundColor: '#ffd43b' }}>
                Pause
              </button>
              <button onClick={resumeAnimation} style={{ ...buttonStyle, backgroundColor: '#51cf66' }}>
                Resume
              </button>
              <button onClick={cancelAnimation} style={{ ...buttonStyle, backgroundColor: '#ff6b6b' }}>
                Cancel & Reset
              </button>
            </div>
            <p style={{ fontSize: 14, color: '#666', marginBottom: 10 }}>
              Value: {typeof valueRef.current.current === 'number' ? valueRef.current.current.toFixed(2) : valueRef.current.current}
            </p>
            <animate.div
              key={trigger}
              style={{
                width: 100,
                height: 100,
                backgroundColor: '#3399ff',
                borderRadius: 8,
                translateX: valueRef.current,
              }}
            />
          </div>
        </ExampleCard>
      </Section>
    </ExampleLayout>
  );
};

const buttonStyle = {
  padding: '8px 16px',
  fontSize: 14,
  backgroundColor: '#3399ff',
  color: 'white',
  border: 'none',
  borderRadius: 6,
  cursor: 'pointer',
} as const;

export default Example;

