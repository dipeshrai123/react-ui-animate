import { useRef } from 'react';
import { animate, useMove, useValue, withSpring } from 'react-ui-animate';

/**
 * Real-world example: Magnetic Button
 * 
 * This demonstrates useMove for creating a magnetic button effect:
 * - Button follows mouse when nearby
 * - Creates an engaging interactive element
 * - Smooth spring animations
 */
const Example = () => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [offsetX, setOffsetX] = useValue(0);
  const [offsetY, setOffsetY] = useValue(0);
  const [scale, setScale] = useValue(1);

  useMove(window, ({ offset }) => {
    if (!buttonRef.current) return;

    const buttonRect = buttonRef.current.getBoundingClientRect();
    const buttonCenterX = buttonRect.left + buttonRect.width / 2;
    const buttonCenterY = buttonRect.top + buttonRect.height / 2;

    const distanceX = offset.x - buttonCenterX;
    const distanceY = offset.y - buttonCenterY;
    const distance = Math.sqrt(distanceX ** 2 + distanceY ** 2);

    // Magnetic effect radius
    const radius = 150;
    
    if (distance < radius) {
      // Calculate pull strength (stronger when closer)
      const strength = 1 - distance / radius;
      const pullX = distanceX * strength * 0.3;
      const pullY = distanceY * strength * 0.3;
      
      setOffsetX(withSpring(pullX, { stiffness: 400, damping: 30 }));
      setOffsetY(withSpring(pullY, { stiffness: 400, damping: 30 }));
      setScale(withSpring(1 + strength * 0.1, { stiffness: 400, damping: 30 }));
    } else {
      // Return to center when mouse is far
      setOffsetX(withSpring(0, { stiffness: 300, damping: 25 }));
      setOffsetY(withSpring(0, { stiffness: 300, damping: 25 }));
      setScale(withSpring(1, { stiffness: 300, damping: 25 }));
    }
  });

  return (
    <div
      style={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8f9fa',
        position: 'relative',
      }}
    >
      <animate.button
        ref={buttonRef}
        style={{
          padding: '20px 40px',
          fontSize: 18,
          fontWeight: 600,
          color: 'white',
          backgroundColor: '#6366f1',
          border: 'none',
          borderRadius: 12,
          cursor: 'pointer',
          boxShadow: '0 10px 30px rgba(99, 102, 241, 0.3)',
          translateX: offsetX,
          translateY: offsetY,
          scale,
        }}
        hover={{
          scale: withSpring(1.05, { stiffness: 400, damping: 25 }),
        }}
        press={{
          scale: withSpring(0.95, { stiffness: 400, damping: 25 }),
        }}
      >
        Hover Near Me
      </animate.button>
      
      <div
        style={{
          position: 'absolute',
          bottom: 40,
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center',
          color: '#666',
        }}
      >
        <p style={{ margin: 0, fontSize: 14 }}>
          Move your mouse near the button to see the magnetic effect
        </p>
      </div>
    </div>
  );
};

export default Example;

