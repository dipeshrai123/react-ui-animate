import { useRef } from 'react';
import { animate, useMove, useValue, withSpring } from 'react-ui-animate';

/**
 * Real-world example: Parallax Cards
 * 
 * This demonstrates useMove for creating parallax effects:
 * - Multiple layers moving at different speeds
 * - Creates depth and visual interest
 * - Smooth spring-based animations
 */
const Example = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Different spring configs for different layers
  const [layer1X, setLayer1X] = useValue(0);
  const [layer1Y, setLayer1Y] = useValue(0);
  const [layer2X, setLayer2X] = useValue(0);
  const [layer2Y, setLayer2Y] = useValue(0);
  const [layer3X, setLayer3X] = useValue(0);
  const [layer3Y, setLayer3Y] = useValue(0);

  useMove(containerRef, ({ offset }) => {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const deltaX = (offset.x - centerX) * 0.1;
    const deltaY = (offset.y - centerY) * 0.1;

    // Fastest layer (closest)
    setLayer1X(withSpring(deltaX * 1.5, { stiffness: 200, damping: 25 }));
    setLayer1Y(withSpring(deltaY * 1.5, { stiffness: 200, damping: 25 }));

    // Medium layer
    setLayer2X(withSpring(deltaX, { stiffness: 150, damping: 20 }));
    setLayer2Y(withSpring(deltaY, { stiffness: 150, damping: 20 }));

    // Slowest layer (furthest)
    setLayer3X(withSpring(deltaX * 0.5, { stiffness: 100, damping: 15 }));
    setLayer3Y(withSpring(deltaY * 0.5, { stiffness: 100, damping: 15 }));
  });

  const Card = ({ 
    x, 
    y, 
    color, 
    emoji, 
    title, 
    zIndex 
  }: { 
    x: any; 
    y: any; 
    color: string; 
    emoji: string; 
    title: string;
    zIndex: number;
  }) => (
    <animate.div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: 280,
        height: 200,
        backgroundColor: color,
        borderRadius: 24,
        padding: 32,
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        translateX: x,
        translateY: y,
        left: -140,
        top: -100,
        zIndex,
      }}
    >
      <div style={{ fontSize: 64, marginBottom: 16 }}>{emoji}</div>
      <h3 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: 'white' }}>
        {title}
      </h3>
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
      <Card
        x={layer3X}
        y={layer3Y}
        color="#16213e"
        emoji="🌙"
        title="Background"
        zIndex={1}
      />
      <Card
        x={layer2X}
        y={layer2Y}
        color="#0f3460"
        emoji="⭐"
        title="Middle"
        zIndex={2}
      />
      <Card
        x={layer1X}
        y={layer1Y}
        color="#533483"
        emoji="✨"
        title="Foreground"
        zIndex={3}
      />
      
      <div
        style={{
          position: 'absolute',
          bottom: 40,
          left: '50%',
          transform: 'translateX(-50%)',
          color: 'white',
          textAlign: 'center',
          zIndex: 10,
        }}
      >
        <p style={{ margin: 0, fontSize: 16, opacity: 0.7 }}>
          Move your mouse to see the parallax effect
        </p>
      </div>
    </div>
  );
};

export default Example;

