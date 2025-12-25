import React, { useState, useEffect } from 'react';
import { animate, useValue, withSpring, withTiming } from 'react-ui-animate';
import { ExampleLayout, Section, ExampleCard } from '../shared';

const Example: React.FC = () => {
  const [trigger, setTrigger] = useState(0);
  const [scrollValue, setScrollValue] = useState(0);
  const [scroll, setScroll] = useValue(0);
  const [animatedScroll, setAnimatedScroll] = useValue(0);
  const [animatedScrollValue, setAnimatedScrollValue] = useState(0);

  // Immediate update (no animation) - good for sliders
  useEffect(() => {
    setScroll(scrollValue);
  }, [scrollValue, setScroll]);

  // Animated update - smooth transitions
  useEffect(() => {
    setAnimatedScroll(withSpring(animatedScrollValue));
  }, [animatedScrollValue, setAnimatedScroll]);

  // Interpolate scroll value to different ranges
  const opacity = scroll.to([0, 100], [0, 1]);
  const scale = scroll.to([0, 100], [0.5, 1.5]);
  const color = scroll.to([0, 100], ['#3399ff', '#ff6b6b']);

  // Animated interpolations
  const animatedOpacity = animatedScroll.to([0, 100], [0, 1]);
  const animatedScale = animatedScroll.to([0, 100], [0.5, 1.5]);
  const animatedColor = animatedScroll.to([0, 100], ['#3399ff', '#ff6b6b']);

  return (
    <ExampleLayout
      title="to Interpolation Utility"
      description="Interpolate values from one range to another. The to() method creates a new AnimateValue that maps input ranges to output ranges."
      onRestart={() => setTrigger((prev) => prev + 1)}
    >
      <Section
        title="Immediate Updates (No Animation)"
        description="For slider-like interactions where you want immediate updates without animation. Pass the value directly to setValue."
      >
        <ExampleCard>
          <div style={{ marginBottom: 20 }}>
            <div style={{ marginBottom: 20 }}>
              <input
                type="range"
                min="0"
                max="100"
                value={scrollValue}
                onChange={(e) => setScrollValue(Number(e.target.value))}
                style={{ width: '100%', maxWidth: 400 }}
              />
              <p style={{ marginTop: 10, fontSize: 14, color: '#666' }}>
                Input:{' '}
                {typeof scroll.current === 'number'
                  ? scroll.current.toFixed(2)
                  : scroll.current}{' '}
                | Opacity:{' '}
                {typeof opacity.current === 'number'
                  ? opacity.current.toFixed(2)
                  : opacity.current}{' '}
                | Scale:{' '}
                {typeof scale.current === 'number'
                  ? scale.current.toFixed(2)
                  : scale.current}
              </p>
            </div>
            <animate.div
              key={trigger}
              style={{
                width: 100,
                height: 100,
                backgroundColor: color,
                borderRadius: 8,
                opacity: opacity,
                scale: scale,
              }}
            />
            <div
              style={{
                marginTop: 20,
                padding: 12,
                backgroundColor: '#f5f5f5',
                borderRadius: 6,
              }}
            >
              <code style={{ fontSize: 12 }}>
                {`useEffect(() => {
  setScroll(scrollValue); // Immediate update, no animation
}, [scrollValue, setScroll]);`}
              </code>
            </div>
          </div>
        </ExampleCard>
      </Section>

      <Section
        title="Animated Updates"
        description="For smooth transitions. Use withSpring or withTiming in useEffect to animate value changes."
      >
        <ExampleCard>
          <div style={{ marginBottom: 20 }}>
            <div style={{ marginBottom: 20 }}>
              <input
                type="range"
                min="0"
                max="100"
                value={animatedScrollValue}
                onChange={(e) => setAnimatedScrollValue(Number(e.target.value))}
                style={{ width: '100%', maxWidth: 400 }}
              />
              <p style={{ marginTop: 10, fontSize: 14, color: '#666' }}>
                Input:{' '}
                {typeof animatedScroll.current === 'number'
                  ? animatedScroll.current.toFixed(2)
                  : animatedScroll.current}{' '}
                | Opacity:{' '}
                {typeof animatedOpacity.current === 'number'
                  ? animatedOpacity.current.toFixed(2)
                  : animatedOpacity.current}{' '}
                | Scale:{' '}
                {typeof animatedScale.current === 'number'
                  ? animatedScale.current.toFixed(2)
                  : animatedScale.current}
              </p>
            </div>
            <animate.div
              key={trigger}
              style={{
                width: 100,
                height: 100,
                backgroundColor: animatedColor,
                borderRadius: 8,
                opacity: animatedOpacity,
                scale: animatedScale,
              }}
            />
            <div
              style={{
                marginTop: 20,
                padding: 12,
                backgroundColor: '#f5f5f5',
                borderRadius: 6,
              }}
            >
              <code style={{ fontSize: 12 }}>
                {`useEffect(() => {
  setAnimatedScroll(withSpring(animatedScrollValue)); // Smooth animation
}, [animatedScrollValue, setAnimatedScroll]);`}
              </code>
            </div>
          </div>
        </ExampleCard>
      </Section>

      <Section
        title="Color Interpolation"
        description="Interpolate between color values. The to() method handles color interpolation automatically."
      >
        <ExampleCard>
          <div style={{ marginBottom: 20 }}>
            <input
              type="range"
              min="0"
              max="100"
              value={scrollValue}
              onChange={(e) => setScrollValue(Number(e.target.value))}
              style={{ width: '100%', maxWidth: 400, marginBottom: 20 }}
            />
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              <animate.div
                key={trigger}
                style={{
                  width: 100,
                  height: 100,
                  backgroundColor: scroll.to([0, 100], ['#3399ff', '#ff6b6b']),
                  borderRadius: 8,
                }}
              />
              <animate.div
                key={trigger}
                style={{
                  width: 100,
                  height: 100,
                  backgroundColor: scroll.to([0, 100], ['#51cf66', '#ffd43b']),
                  borderRadius: 8,
                }}
              />
              <animate.div
                key={trigger}
                style={{
                  width: 100,
                  height: 100,
                  backgroundColor: scroll.to([0, 100], ['#845ef7', '#20c997']),
                  borderRadius: 8,
                }}
              />
            </div>
          </div>
        </ExampleCard>
      </Section>

      <Section
        title="Transform Interpolation"
        description="Interpolate transform values like translateX and rotate."
      >
        <ExampleCard>
          <div style={{ marginBottom: 20 }}>
            <input
              type="range"
              min="0"
              max="100"
              value={scrollValue}
              onChange={(e) => setScrollValue(Number(e.target.value))}
              style={{ width: '100%', maxWidth: 400, marginBottom: 20 }}
            />
            <animate.div
              key={trigger}
              style={{
                width: 100,
                height: 100,
                backgroundColor: '#3399ff',
                borderRadius: 8,
                translateX: scroll.to([0, 100], [0, 300]),
                rotate: scroll.to([0, 100], [0, 360]),
              }}
            />
          </div>
        </ExampleCard>
      </Section>

      <Section
        title="With Timing Animation"
        description="You can also use withTiming for different animation feel."
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
              <button
                onClick={() => {
                  setAnimatedScrollValue(0);
                  setAnimatedScroll(withTiming(100, { duration: 2000 }));
                }}
                style={{
                  padding: '8px 16px',
                  fontSize: 14,
                  backgroundColor: '#3399ff',
                  color: 'white',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                }}
              >
                Animate to 100 (Timing, 2s)
              </button>
              <button
                onClick={() => {
                  setAnimatedScrollValue(0);
                  setAnimatedScroll(withSpring(100));
                }}
                style={{
                  padding: '8px 16px',
                  fontSize: 14,
                  backgroundColor: '#51cf66',
                  color: 'white',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                }}
              >
                Animate to 100 (Spring)
              </button>
            </div>
            <animate.div
              key={trigger}
              style={{
                width: 100,
                height: 100,
                backgroundColor: animatedColor,
                borderRadius: 8,
                opacity: animatedOpacity,
                scale: animatedScale,
              }}
            />
            <div
              style={{
                marginTop: 20,
                padding: 12,
                backgroundColor: '#f5f5f5',
                borderRadius: 6,
              }}
            >
              <code style={{ fontSize: 12 }}>
                {`// Use withTiming for duration-based animation
setAnimatedScroll(withTiming(100, { duration: 2000 }));

// Use withSpring for physics-based animation
setAnimatedScroll(withSpring(100));`}
              </code>
            </div>
          </div>
        </ExampleCard>
      </Section>
    </ExampleLayout>
  );
};

export default Example;
