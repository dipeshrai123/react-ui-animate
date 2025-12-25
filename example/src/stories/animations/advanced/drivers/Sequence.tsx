import React, { useRef, useState } from 'react';
import { animate, AnimateValue, timing, spring, sequence } from 'react-ui-animate';
import { ExampleLayout, Section, ExampleCard } from '../../shared';

const Example: React.FC = () => {
  const [trigger, setTrigger] = useState(0);
  const valueRef = useRef(new AnimateValue(0));
  const controllerRef = useRef<ReturnType<typeof sequence> | null>(null);

  const startSequence = () => {
    controllerRef.current?.cancel();
    
    // Create a sequence of animations
    const step1 = timing(valueRef.current, 100, { duration: 500 });
    const step2 = spring(valueRef.current, 200, { stiffness: 100, damping: 15 });
    const step3 = timing(valueRef.current, 0, { duration: 500 });
    
    // Run them in sequence
    controllerRef.current = sequence([step1, step2, step3], {
      onStart: () => console.log('Sequence started'),
      onComplete: () => console.log('Sequence completed'),
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
      title="sequence Driver (Low-level API)"
      description="The sequence driver runs multiple animations one after another. Use this when you need manual control. For most cases, use withSequence descriptor instead."
      onRestart={() => {
        cancelAnimation();
        setTrigger((prev) => prev + 1);
      }}
    >
      <Section
        title="Animation Sequence"
        description="Chain multiple animations to run sequentially"
      >
        <ExampleCard>
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
              <button onClick={startSequence} style={buttonStyle}>
                Start Sequence
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

