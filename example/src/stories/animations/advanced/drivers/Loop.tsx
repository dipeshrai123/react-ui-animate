import React, { useRef, useState } from 'react';
import {
  animate,
  AnimateValue,
  timing,
  spring,
  loop,
  sequence,
} from 'react-ui-animate';
import { ExampleLayout, Section, ExampleCard } from '../../shared';

const Example: React.FC = () => {
  const [trigger, setTrigger] = useState(0);
  const valueRef = useRef(new AnimateValue(0));
  const controllerRef = useRef<ReturnType<typeof loop> | null>(null);

  const startLoop = () => {
    controllerRef.current?.cancel();
    valueRef.current.set(0); // Reset to initial value

    // Create an animation to loop - use 'from' to ensure it starts from 0 each time
    const animation = timing(valueRef.current, 200, {
      duration: 500,
      from: 0, // Explicitly start from 0 each iteration
    });

    // Loop it 3 times
    controllerRef.current = loop(animation, 3, {
      onStart: () => console.log('Loop started'),
      onComplete: () => console.log('Loop completed'),
    });

    controllerRef.current.start();
  };

  const startInfiniteLoop = () => {
    controllerRef.current?.cancel();
    valueRef.current.set(0); // Reset to initial value

    const animation = spring(valueRef.current, 200, {
      stiffness: 100,
      damping: 15,
      from: 0, // Explicitly start from 0 each iteration
    });

    // Loop infinitely - use a very large number since 0 means "no iterations"
    // Note: The loop implementation treats 0 as "no iterations", so we use a large number
    controllerRef.current = loop(animation, 999999, {
      onStart: () => console.log('Infinite loop started'),
    });

    controllerRef.current.start();
  };

  const startSequenceLoop = () => {
    controllerRef.current?.cancel();
    valueRef.current.set(0); // Reset to initial value

    // Create a sequence - first step should start from 0
    const step1 = timing(valueRef.current, 100, {
      duration: 300,
      from: 0, // Start from 0
    });
    const step2 = timing(valueRef.current, 200, { duration: 300 });
    const seq = sequence([step1, step2]);

    // Loop the sequence
    controllerRef.current = loop(seq, 3);
    controllerRef.current.start();
  };

  const cancelAnimation = () => {
    controllerRef.current?.cancel();
    valueRef.current.set(0);
  };

  return (
    <ExampleLayout
      title="loop Driver (Low-level API)"
      description="The loop driver repeats animations a specified number of times. Use this when you need manual control. For most cases, use withLoop descriptor instead."
      onRestart={() => {
        cancelAnimation();
        setTrigger((prev) => prev + 1);
      }}
    >
      <Section
        title="Basic Loop"
        description="Loop an animation a specific number of times"
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
              <button onClick={startLoop} style={buttonStyle}>
                Loop 3 Times
              </button>
              <button
                onClick={startInfiniteLoop}
                style={{ ...buttonStyle, backgroundColor: '#ff6b6b' }}
              >
                Infinite Loop
              </button>
              <button
                onClick={startSequenceLoop}
                style={{ ...buttonStyle, backgroundColor: '#51cf66' }}
              >
                Loop Sequence
              </button>
              <button
                onClick={cancelAnimation}
                style={{ ...buttonStyle, backgroundColor: '#999' }}
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
