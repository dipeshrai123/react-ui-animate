import React, { useRef, useEffect } from 'react';
import {
  animate,
  useWheel,
  useValue,
  withSpring,
  AnimateValue,
} from 'react-ui-animate';

const ScaleDisplay = ({ scale }: { scale: AnimateValue<number> }) => {
  const [display, setDisplay] = React.useState('1.00');

  useEffect(() => {
    const unsubscribe = scale.subscribe((v) => {
      setDisplay(v.toFixed(2));
    });
    return unsubscribe;
  }, [scale]);

  return (
    <div
      style={{
        fontSize: 14,
        color: '#999',
        padding: '8px 16px',
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
      }}
    >
      Scale: {display}x
    </div>
  );
};

/**
 * Real-world example: Zoom on Wheel
 *
 * This demonstrates useWheel for creating zoom effects:
 * - Zoom in/out with mouse wheel
 * - Smooth spring animations
 * - Useful for image viewers, maps, etc.
 */
const Example = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useValue(1);
  const [rotation, setRotation] = useValue(0);

  useWheel(containerRef, ({ event }) => {
    // Zoom in/out based on wheel delta
    const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.5, Math.min(3, scale.current * zoomFactor));
    setScale(withSpring(newScale, { stiffness: 300, damping: 30 }));

    // Add slight rotation for visual interest
    const rotationDelta = event.deltaY * 0.5;
    setRotation(
      withSpring(rotation.current + rotationDelta, {
        stiffness: 200,
        damping: 25,
      })
    );
  });

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1a1a2e',
        overflow: 'hidden',
        cursor: 'grab',
      }}
    >
      <animate.div
        style={{
          width: 400,
          height: 400,
          backgroundColor: 'white',
          borderRadius: 24,
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 40,
          scale,
          rotate: rotation,
        }}
      >
        <div style={{ fontSize: 80, marginBottom: 24 }}>🔍</div>
        <h2
          style={{
            fontSize: 32,
            fontWeight: 700,
            marginBottom: 16,
            color: '#333',
          }}
        >
          Zoom Me!
        </h2>
        <p
          style={{
            fontSize: 16,
            color: '#666',
            textAlign: 'center',
            marginBottom: 24,
          }}
        >
          Scroll up to zoom in
          <br />
          Scroll down to zoom out
        </p>
        <ScaleDisplay scale={scale} />
      </animate.div>

      <div
        style={{
          position: 'absolute',
          bottom: 40,
          left: '50%',
          transform: 'translateX(-50%)',
          color: 'white',
          textAlign: 'center',
          opacity: 0.7,
        }}
      >
        <p style={{ margin: 0, fontSize: 14 }}>
          Use your mouse wheel to zoom in and out
        </p>
      </div>
    </div>
  );
};

export default Example;
