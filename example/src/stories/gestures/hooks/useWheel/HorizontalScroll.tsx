import React, { useRef, useEffect } from 'react';
import {
  animate,
  useWheel,
  useValue,
  withSpring,
  AnimateValue,
} from 'react-ui-animate';

const ScrollIndicator = ({
  scrollX,
  containerRef,
}: {
  scrollX: AnimateValue<number>;
  containerRef: React.RefObject<HTMLDivElement>;
}) => {
  const [progress, setProgress] = React.useState('0%');

  useEffect(() => {
    const unsubscribe = scrollX.subscribe((v) => {
      const maxScroll = containerRef.current
        ? containerRef.current.scrollWidth - containerRef.current.clientWidth
        : 1;
      setProgress(`${Math.round((v / maxScroll) * 100)}%`);
    });
    return unsubscribe;
  }, [scrollX, containerRef]);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 40,
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'rgba(0,0,0,0.7)',
        color: 'white',
        padding: '12px 24px',
        borderRadius: 8,
        fontSize: 14,
        zIndex: 1000,
      }}
    >
      {progress}
    </div>
  );
};

/**
 * Real-world example: Horizontal Scroll on Wheel
 *
 * This demonstrates useWheel for creating horizontal scrolling:
 * - Scroll horizontally with vertical wheel
 * - Smooth spring animations
 * - Useful for horizontal galleries, timelines, etc.
 */
const Example = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollX, setScrollX] = useValue(0);

  useWheel(containerRef, ({ event }) => {
    // Convert vertical wheel to horizontal scroll
    const scrollAmount = event.deltaY * 2;
    const maxScroll = containerRef.current
      ? containerRef.current.scrollWidth - containerRef.current.clientWidth
      : 0;
    const newScrollX = Math.max(
      0,
      Math.min(maxScroll, scrollX.current - scrollAmount)
    );
    setScrollX(withSpring(newScrollX, { stiffness: 200, damping: 25 }));
  });

  const items = Array.from({ length: 10 }, (_, i) => ({
    id: i,
    color: `hsl(${i * 36}, 70%, 60%)`,
    title: `Item ${i + 1}`,
  }));

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100vh',
        backgroundColor: '#f5f5f5',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <animate.div
        style={{
          display: 'flex',
          height: '100%',
          width: 'fit-content',
          translateX: scrollX,
        }}
      >
        {items.map((item) => (
          <div
            key={item.id}
            style={{
              width: '100vw',
              height: '100vh',
              backgroundColor: item.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <div style={{ textAlign: 'center', color: 'white' }}>
              <div style={{ fontSize: 64, marginBottom: 24 }}>📜</div>
              <h2 style={{ fontSize: 48, fontWeight: 700, marginBottom: 16 }}>
                {item.title}
              </h2>
              <p style={{ fontSize: 18, opacity: 0.9 }}>
                Scroll vertically to move horizontally
              </p>
            </div>
          </div>
        ))}
      </animate.div>

      {/* Scroll Indicator */}
      <ScrollIndicator scrollX={scrollX} containerRef={containerRef} />
    </div>
  );
};

export default Example;
