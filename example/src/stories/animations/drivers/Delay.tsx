import React, { useRef, useState } from 'react';
import { animate, AnimateValue, timing, sequence, delay } from 'react-ui-animate';
import { ExampleLayout, Section, ExampleCard } from '../shared';

const Example: React.FC = () => {
  const [trigger, setTrigger] = useState(0);
  const valueRef = useRef(new AnimateValue(0));
  const controllerRef = useRef<ReturnType<typeof sequence> | null>(null);

  const startWithDelay = () => {
    controllerRef.current?.cancel();
    
    // Create a sequence with delay
    const delayCtrl = delay(1000); // 1 second delay
    const animation = timing(valueRef.current, 200, { duration: 500 });
    
    controllerRef.current = sequence([delayCtrl, animation], {
      onStart: () => console.log('Animation with delay started'),
      onComplete: () => console.log('Animation completed'),
    });
    
    controllerRef.current.start();
  };

  const startMultipleDelays = () => {
    controllerRef.current?.cancel();
    
    const step1 = timing(valueRef.current, 100, { duration: 300 });
    const delay1 = delay(500);
    const step2 = timing(valueRef.current, 200, { duration: 300 });
    const delay2 = delay(500);
    const step3 = timing(valueRef.current, 0, { duration: 300 });
    
    controllerRef.current = sequence([step1, delay1, step2, delay2, step3]);
    controllerRef.current.start();
  };

  const cancelAnimation = () => {
    controllerRef.current?.cancel();
    valueRef.current.set(0);
  };

  return (
    <ExampleLayout
      title="delay Driver (Low-level API)"
      description="The delay driver creates pauses in animation sequences. Use this when you need manual control. For most cases, use withDelay descriptor inside withSequence instead."
      onRestart={() => {
        cancelAnimation();
        setTrigger((prev) => prev + 1);
      }}
    >
      <Section
        title="Delay in Sequence"
        description="Add delays between animations"
      >
        <ExampleCard>
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
              <button onClick={startWithDelay} style={buttonStyle}>
                Start with 1s Delay
              </button>
              <button onClick={startMultipleDelays} style={{ ...buttonStyle, backgroundColor: '#51cf66' }}>
                Multiple Delays
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
        title="When to Use delay Driver"
        description="Understanding delay driver usage"
      >
        <ExampleCard>
          <div style={{ padding: 16, backgroundColor: '#f0f9ff', borderRadius: 8 }}>
            <p style={{ marginBottom: 10, lineHeight: 1.6 }}>
              The delay driver is typically used within sequences to create pauses. 
              In most cases, you'll use it with the sequence driver or withSequence descriptor.
            </p>
          </div>
          <div style={{ marginTop: 20, padding: 12, backgroundColor: '#f5f5f5', borderRadius: 6 }}>
            <code style={{ fontSize: 12 }}>
              {`// Driver (Low-level)
const delayCtrl = delay(1000);
const animation = timing(value, 200);
const seq = sequence([delayCtrl, animation]);
seq.start();

// Descriptor (High-level) - Recommended
<animate.div animate={{
  translateX: withSequence([
    withDelay(1000),
    withTiming(200)
  ])
}} />`}
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

