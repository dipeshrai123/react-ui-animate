import React, { useRef, useState } from 'react';
import { animate, AnimateValue, spring } from 'react-ui-animate';
import { ExampleLayout, Section, ExampleCard } from '../shared';

const Example: React.FC = () => {
  const [trigger, setTrigger] = useState(0);
  const valueRef = useRef(new AnimateValue(0));
  const controllerRef = useRef<ReturnType<typeof spring> | null>(null);

  const startAnimation = () => {
    controllerRef.current?.cancel();
    controllerRef.current = spring(valueRef.current, 200, {
      stiffness: 100,
      damping: 15,
      onStart: () => console.log('Spring animation started'),
      onComplete: () => console.log('Spring animation completed'),
    });
    controllerRef.current.start();
  };

  const startBouncy = () => {
    controllerRef.current?.cancel();
    controllerRef.current = spring(valueRef.current, 200, {
      stiffness: 50,
      damping: 10, // Low damping = bouncy
    });
    controllerRef.current.start();
  };

  const startStiff = () => {
    controllerRef.current?.cancel();
    controllerRef.current = spring(valueRef.current, 200, {
      stiffness: 300,
      damping: 30, // High damping = stiff
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
      title="spring Driver (Low-level API)"
      description="The spring driver provides physics-based animations with manual control. Use this when you need programmatic control. For most cases, use withSpring descriptor instead."
      onRestart={() => {
        cancelAnimation();
        setTrigger((prev) => prev + 1);
      }}
    >
      <Section
        title="Basic Spring Animation"
        description="Create a spring animation with manual controller"
      >
        <ExampleCard>
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
              <button onClick={startAnimation} style={buttonStyle}>
                Start Spring
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

      <Section
        title="Different Spring Configurations"
        description="Adjust stiffness and damping for different feels"
      >
        <ExampleCard>
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
              <button onClick={startBouncy} style={{ ...buttonStyle, backgroundColor: '#ff6b6b' }}>
                Bouncy (low damping)
              </button>
              <button onClick={startStiff} style={{ ...buttonStyle, backgroundColor: '#51cf66' }}>
                Stiff (high damping)
              </button>
            </div>
            <animate.div
              key={trigger}
              style={{
                width: 100,
                height: 100,
                backgroundColor: '#845ef7',
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

