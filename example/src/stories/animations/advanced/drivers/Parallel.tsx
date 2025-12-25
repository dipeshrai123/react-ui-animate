import React, { useRef, useState } from 'react';
import { animate, AnimateValue, timing, spring, parallel } from 'react-ui-animate';
import { ExampleLayout, Section, ExampleCard } from '../../shared';

const Example: React.FC = () => {
  const [trigger, setTrigger] = useState(0);
  const xRef = useRef(new AnimateValue(0));
  const yRef = useRef(new AnimateValue(0));
  const scaleRef = useRef(new AnimateValue(1));
  const controllerRef = useRef<ReturnType<typeof parallel> | null>(null);

  const startParallel = () => {
    controllerRef.current?.cancel();
    
    // Create multiple animations
    const timingCtrl = timing(xRef.current, 200, { duration: 1000 });
    const springCtrl = spring(yRef.current, 100, { stiffness: 100, damping: 15 });
    const scaleCtrl = spring(scaleRef.current, 1.5, { stiffness: 200, damping: 20 });
    
    // Run them in parallel
    controllerRef.current = parallel([timingCtrl, springCtrl, scaleCtrl], {
      onStart: () => console.log('Parallel animation started'),
      onComplete: () => console.log('Parallel animation completed'),
    });
    
    controllerRef.current.start();
  };

  const cancelAnimation = () => {
    controllerRef.current?.cancel();
    xRef.current.set(0);
    yRef.current.set(0);
    scaleRef.current.set(1);
  };

  return (
    <ExampleLayout
      title="parallel Driver (Low-level API)"
      description="The parallel driver runs multiple animations simultaneously. Use this when you need to manually control multiple animations together. For most cases, animate multiple properties in the animate prop instead."
      onRestart={() => {
        cancelAnimation();
        setTrigger((prev) => prev + 1);
      }}
    >
      <Section
        title="Multiple Animations in Parallel"
        description="Run timing, spring, and scale animations simultaneously"
      >
        <ExampleCard>
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
              <button onClick={startParallel} style={buttonStyle}>
                Start Parallel Animation
              </button>
              <button onClick={cancelAnimation} style={{ ...buttonStyle, backgroundColor: '#ff6b6b' }}>
                Cancel & Reset
              </button>
            </div>
            <div
              style={{
                position: 'relative',
                width: 400,
                height: 300,
                border: '2px solid #ddd',
                borderRadius: 8,
                backgroundColor: '#f5f5f5',
              }}
            >
              <animate.div
                key={trigger}
                style={{
                  width: 100,
                  height: 100,
                  backgroundColor: '#3399ff',
                  borderRadius: 8,
                  translateX: xRef.current,
                  translateY: yRef.current,
                  scale: scaleRef.current,
                }}
              />
            </div>
          </div>
        </ExampleCard>
      </Section>

      <Section
        title="When to Use parallel Driver"
        description="Understanding when to use parallel driver vs declarative approach"
      >
        <ExampleCard>
          <div style={{ padding: 16, backgroundColor: '#f0f9ff', borderRadius: 8 }}>
            <h4 style={{ marginBottom: 10, fontSize: 16 }}>Use parallel Driver when:</h4>
            <ul style={{ marginBottom: 20, paddingLeft: 20, lineHeight: 1.8 }}>
              <li>You need manual control over multiple animations</li>
              <li>You're building custom animation sequences</li>
              <li>You need to pause/resume multiple animations together</li>
            </ul>
            <h4 style={{ marginBottom: 10, fontSize: 16 }}>Use Declarative Approach when:</h4>
            <ul style={{ paddingLeft: 20, lineHeight: 1.8 }}>
              <li>You want simpler, more React-friendly code</li>
              <li>You're animating multiple properties in animate prop</li>
            </ul>
          </div>
          <div style={{ marginTop: 20, padding: 12, backgroundColor: '#f5f5f5', borderRadius: 6 }}>
            <code style={{ fontSize: 12 }}>
              {`// Driver (Low-level)
const ctrl1 = timing(x, 200);
const ctrl2 = spring(y, 100);
const parallelCtrl = parallel([ctrl1, ctrl2]);
parallelCtrl.start();

// Declarative (High-level) - Recommended
<animate.div animate={{
  translateX: withTiming(200),
  translateY: withSpring(100)
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

