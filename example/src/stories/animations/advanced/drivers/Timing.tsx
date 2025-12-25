import React, { useRef, useState } from 'react';
import { animate, AnimateValue, timing, Easing } from 'react-ui-animate';
import { ExampleLayout, Section, ExampleCard } from '../../shared';

const Example: React.FC = () => {
  const [trigger, setTrigger] = useState(0);
  const valueRef = useRef(new AnimateValue(0));
  const controllerRef = useRef<ReturnType<typeof timing> | null>(null);

  const startAnimation = () => {
    // Cancel any existing animation
    controllerRef.current?.cancel();

    // Create and start timing animation
    controllerRef.current = timing(valueRef.current, 200, {
      duration: 1000,
      easing: Easing.ease,
      onStart: () => console.log('Timing animation started'),
      onComplete: () => console.log('Timing animation completed'),
    });

    controllerRef.current.start();
  };

  const startWithCustomEasing = () => {
    controllerRef.current?.cancel();
    controllerRef.current = timing(valueRef.current, 200, {
      duration: 1500,
      easing: Easing.bounce,
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
      title="timing Driver (Low-level API)"
      description="The timing driver is a low-level API that takes an AnimateValue directly and returns an AnimateController. Use this when you need manual control over animations. For most cases, use withTiming descriptor instead."
      onRestart={() => {
        cancelAnimation();
        setTrigger((prev) => prev + 1);
      }}
    >
      <Section
        title="Basic Usage"
        description="Create a timing animation manually with full control over the controller"
      >
        <ExampleCard>
          <div style={{ marginBottom: 20 }}>
            <div
              style={{
                display: 'flex',
                gap: 10,
                flexWrap: 'wrap',
                marginBottom: 20,
              }}
            >
              <button onClick={startAnimation} style={buttonStyle}>
                Start Animation
              </button>
              <button
                onClick={pauseAnimation}
                style={{ ...buttonStyle, backgroundColor: '#ffd43b' }}
              >
                Pause
              </button>
              <button
                onClick={resumeAnimation}
                style={{ ...buttonStyle, backgroundColor: '#51cf66' }}
              >
                Resume
              </button>
              <button
                onClick={cancelAnimation}
                style={{ ...buttonStyle, backgroundColor: '#ff6b6b' }}
              >
                Cancel & Reset
              </button>
            </div>
            <p style={{ fontSize: 14, color: '#666', marginBottom: 10 }}>
              Value:{' '}
              {typeof valueRef.current.current === 'number'
                ? valueRef.current.current.toFixed(2)
                : valueRef.current.current}
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
        title="Custom Easing"
        description="Use different easing functions for different animation feels"
      >
        <ExampleCard>
          <div style={{ marginBottom: 20 }}>
            <button onClick={startWithCustomEasing} style={buttonStyle}>
              Start with Bounce Easing
            </button>
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

      <Section
        title="When to Use Drivers vs Descriptors"
        description="Understanding when to use low-level drivers vs high-level descriptors"
      >
        <ExampleCard>
          <div
            style={{ padding: 16, backgroundColor: '#f0f9ff', borderRadius: 8 }}
          >
            <h4 style={{ marginBottom: 10, fontSize: 16 }}>
              Use Drivers (Low-level) when:
            </h4>
            <ul style={{ marginBottom: 20, paddingLeft: 20, lineHeight: 1.8 }}>
              <li>You need manual control (pause, resume, cancel)</li>
              <li>You're building custom animation logic</li>
              <li>You need to programmatically control animations</li>
              <li>You're working directly with AnimateValue instances</li>
            </ul>
            <h4 style={{ marginBottom: 10, fontSize: 16 }}>
              Use Descriptors (High-level) when:
            </h4>
            <ul style={{ paddingLeft: 20, lineHeight: 1.8 }}>
              <li>You want declarative animations (animate prop)</li>
              <li>You're using useValue hook</li>
              <li>You want simpler, more React-friendly API</li>
              <li>You don't need manual control</li>
            </ul>
          </div>
          <div
            style={{
              marginTop: 20,
              padding: 12,
              backgroundColor: '#f5f5f5',
              borderRadius: 6,
            }}
          >
            <code style={{ fontSize: 12 }}>
              {`// Driver (Low-level)
const controller = timing(value, 200, { duration: 1000 });
controller.start();

// Descriptor (High-level) - Recommended
<animate.div animate={{ translateX: withTiming(200, { duration: 1000 }) }} />`}
            </code>
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
