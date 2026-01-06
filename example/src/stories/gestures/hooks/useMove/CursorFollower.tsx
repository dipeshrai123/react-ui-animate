import { useRef } from 'react';
import { animate, useMove, useValue, withSpring } from 'react-ui-animate';

/**
 * Real-world example: Cursor Follower
 * 
 * This demonstrates useMove for creating a custom cursor follower that:
 * - Tracks mouse movement smoothly
 * - Uses spring physics for natural motion
 * - Can be used for custom cursor effects
 */
const Example = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [cursorX, setCursorX] = useValue(0);
  const [cursorY, setCursorY] = useValue(0);
  const [dotX, setDotX] = useValue(0);
  const [dotY, setDotY] = useValue(0);

  // Track mouse position on the container
  useMove(containerRef, ({ offset }) => {
    setCursorX(withSpring(offset.x, { stiffness: 300, damping: 30 }));
    setCursorY(withSpring(offset.y, { stiffness: 300, damping: 30 }));
    
    // Secondary dot with more damping for trailing effect
    setDotX(withSpring(offset.x, { stiffness: 150, damping: 25 }));
    setDotY(withSpring(offset.y, { stiffness: 150, damping: 25 }));
  });

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100vh',
        backgroundColor: '#0a0a0a',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'none',
      }}
    >
      {/* Main cursor dot */}
      <animate.div
        style={{
          position: 'absolute',
          width: 20,
          height: 20,
          borderRadius: '50%',
          backgroundColor: '#fff',
          pointerEvents: 'none',
          left: cursorX.to((v) => v - 10),
          top: cursorY.to((v) => v - 10),
        }}
      />
      
      {/* Trailing dot */}
      <animate.div
        style={{
          position: 'absolute',
          width: 40,
          height: 40,
          borderRadius: '50%',
          backgroundColor: 'rgba(255, 255, 255, 0.3)',
          pointerEvents: 'none',
          left: dotX.to((v) => v - 20),
          top: dotY.to((v) => v - 20),
        }}
      />
      
      {/* Content */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          color: 'white',
          zIndex: 1,
        }}
      >
        <h1 style={{ fontSize: 48, marginBottom: 16, fontWeight: 700 }}>
          Move Your Mouse
        </h1>
        <p style={{ fontSize: 18, color: '#999' }}>
          Watch the custom cursor follow your movement
        </p>
      </div>
    </div>
  );
};

export default Example;

