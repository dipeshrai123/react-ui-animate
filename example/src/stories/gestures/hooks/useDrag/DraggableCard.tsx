import { useRef } from 'react';
import { animate, useDrag, useValue, withSpring } from 'react-ui-animate';

/**
 * Real-world example: Draggable Card
 *
 * This demonstrates useDrag for creating a draggable card that:
 * - Can be dragged around the screen
 * - Returns to center when released
 * - Shows visual feedback during drag
 * - Uses spring physics for smooth animations
 */
const Example = () => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [x, setX] = useValue(0);
  const [y, setY] = useValue(0);
  const [scale, setScale] = useValue(1);
  const [rotation, setRotation] = useValue(0);

  useDrag(cardRef, ({ down, movement, velocity }) => {
    // Update position while dragging
    setX(down ? movement.x : withSpring(0, { stiffness: 300, damping: 30 }));
    setY(down ? movement.y : withSpring(0, { stiffness: 300, damping: 30 }));

    // Scale down slightly when dragging for visual feedback
    setScale(
      down ? withSpring(0.95, { stiffness: 400, damping: 25 }) : withSpring(1)
    );

    // Add slight rotation based on horizontal movement
    setRotation(
      down
        ? withSpring(movement.x * 0.1, { stiffness: 200, damping: 20 })
        : withSpring(0, { stiffness: 200, damping: 20 })
    );
  });

  return (
    <div
      style={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f0f0f0',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <animate.div
        ref={cardRef}
        style={{
          width: 300,
          height: 200,
          backgroundColor: 'white',
          borderRadius: 20,
          boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
          cursor: 'grab',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          translateX: x,
          translateY: y,
          scale,
          rotate: rotation,
        }}
      >
        <div style={{ fontSize: 48, marginBottom: 16 }}>🎴</div>
        <h3 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: '#333' }}>
          Drag Me!
        </h3>
        <p
          style={{
            margin: '8px 0 0',
            fontSize: 14,
            color: '#666',
            textAlign: 'center',
          }}
        >
          Drag this card around and release to see it spring back
        </p>
      </animate.div>
    </div>
  );
};

export default Example;
