import React, { useRef, useEffect, useState } from 'react';
import {
  animate,
  useWheel,
  useValue,
  withSpring,
  AnimateValue,
} from 'react-ui-animate';

const ScaleDisplay = ({ scale }: { scale: AnimateValue<number> }) => {
  const [display, setDisplay] = useState('100%');

  useEffect(() => {
    const unsubscribe = scale.subscribe((v: number) => {
      setDisplay(`${(v * 100).toFixed(0)}%`);
    });
    return unsubscribe;
  }, [scale]);

  return (
    <div
      style={{
        marginTop: 8,
        fontSize: 12,
        color: 'rgba(255,255,255,0.8)',
      }}
    >
      {display}
    </div>
  );
};

/**
 * Real-world example: Scale on Wheel
 *
 * This demonstrates useWheel for creating scale effects:
 * - Scale elements based on wheel delta
 * - Different scaling for different elements
 * - Smooth animations
 */
const Example = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale1, setScale1] = useValue(1);
  const [scale2, setScale2] = useValue(1);
  const [scale3, setScale3] = useValue(1);

  useWheel(containerRef, ({ event }) => {
    // Different scaling speeds for different elements
    const speed1 = 0.05;
    const speed2 = 0.03;
    const speed3 = 0.08;

    const deltaScale = event.deltaY * -0.01; // Negative to make scroll up = scale up

    setScale1(
      withSpring(
        Math.max(0.5, Math.min(2, scale1.current + deltaScale * speed1)),
        { stiffness: 300, damping: 30 }
      )
    );
    setScale2(
      withSpring(
        Math.max(0.5, Math.min(2, scale2.current + deltaScale * speed2)),
        { stiffness: 250, damping: 25 }
      )
    );
    setScale3(
      withSpring(
        Math.max(0.5, Math.min(2, scale3.current + deltaScale * speed3)),
        { stiffness: 350, damping: 35 }
      )
    );
  });

  const Card = ({
    scale,
    color,
    emoji,
    title,
    zIndex,
  }: {
    scale: any;
    color: string;
    emoji: string;
    title: string;
    zIndex: number;
  }) => (
    <animate.div
      style={{
        position: 'absolute',
        width: 200,
        height: 200,
        backgroundColor: color,
        borderRadius: 20,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
        scale,
        left: 'calc(50% - 100px)',
        top: 'calc(50% - 100px)',
        zIndex,
      }}
    >
      <div style={{ fontSize: 48, marginBottom: 12 }}>{emoji}</div>
      <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: 'white' }}>
        {title}
      </h3>
      <ScaleDisplay scale={scale} />
    </animate.div>
  );

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100vh',
        backgroundColor: '#1a1a2e',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Card scale={scale1} color="#667eea" emoji="🔵" title="Slow" zIndex={1} />
      <Card
        scale={scale2}
        color="#f093fb"
        emoji="🟣"
        title="Medium"
        zIndex={2}
      />
      <Card scale={scale3} color="#4facfe" emoji="🔷" title="Fast" zIndex={3} />

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
          Scroll to scale the cards at different speeds
        </p>
      </div>
    </div>
  );
};

export default Example;
