import React, { useRef, useEffect, useState } from 'react';
import { animate, useScroll, AnimateValue } from 'react-ui-animate';

const ProgressBar = ({
  scrollYProgress,
}: {
  scrollYProgress: AnimateValue<number>;
}) => {
  const [width, setWidth] = useState('0%');

  useEffect(() => {
    const unsubscribe = scrollYProgress.subscribe((v: number) => {
      setWidth(`${v * 100}%`);
    });
    return unsubscribe;
  }, [scrollYProgress]);

  return (
    <animate.div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width,
        height: 4,
        backgroundColor: '#6366f1',
        zIndex: 1000,
      }}
    />
  );
};

const ProgressDisplay = ({
  scrollYProgress,
}: {
  scrollYProgress: AnimateValue<number>;
}) => {
  const [percentage, setPercentage] = useState('0%');

  useEffect(() => {
    const unsubscribe = scrollYProgress.subscribe((v: number) => {
      setPercentage(`${Math.round(v * 100)}%`);
    });
    return unsubscribe;
  }, [scrollYProgress]);

  return (
    <animate.div
      style={{
        backgroundColor: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: '12px 20px',
        borderRadius: 8,
        fontSize: 14,
        fontWeight: 600,
      }}
    >
      {percentage}
    </animate.div>
  );
};

/**
 * Real-world example: Reading Progress Indicator
 *
 * This demonstrates useScroll with scroll progress for:
 * - Tracking reading progress through content
 * - Visual progress indicators
 * - Smooth animated progress values
 */
const Example = () => {
  const contentRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll(window, {
    target: contentRef,
    offset: ['start start', 'end end'],
  });

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '200vh' }}>
      <ProgressBar scrollYProgress={scrollYProgress} />

      {/* Content */}
      <div
        ref={contentRef}
        style={{ padding: '80px 40px', maxWidth: 800, margin: '0 auto' }}
      >
        <h1
          style={{
            fontSize: 48,
            fontWeight: 700,
            marginBottom: 24,
            color: '#333',
          }}
        >
          Reading Progress
        </h1>
        <p
          style={{
            fontSize: 18,
            color: '#666',
            lineHeight: 1.8,
            marginBottom: 32,
          }}
        >
          Scroll down to see the progress bar fill. This demonstrates how
          useScroll with scroll progress can be used to create reading progress
          indicators.
        </p>

        {Array.from({ length: 15 }).map((_, i) => (
          <div key={i} style={{ marginBottom: 40 }}>
            <h2
              style={{
                fontSize: 32,
                fontWeight: 600,
                marginBottom: 16,
                color: '#333',
              }}
            >
              Section {i + 1}
            </h2>
            <p style={{ fontSize: 16, color: '#666', lineHeight: 1.8 }}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
              reprehenderit in voluptate velit esse cillum dolore eu fugiat
              nulla pariatur.
            </p>
          </div>
        ))}

        {/* Progress Percentage Display */}
        <div style={{ position: 'fixed', bottom: 40, right: 40, zIndex: 1000 }}>
          <ProgressDisplay scrollYProgress={scrollYProgress} />
        </div>
      </div>
    </div>
  );
};

export default Example;
