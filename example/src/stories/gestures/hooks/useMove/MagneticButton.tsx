import { useRef, useState, useEffect, useMemo } from 'react';
import {
  animate,
  useMove,
  useValue,
  withSpring,
  combine,
} from 'react-ui-animate';

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
  const [magneticScale, setMagneticScale] = useValue(1);
  const [hoverScale, setHoverScale] = useValue(1);
  const [pressScale, setPressScale] = useValue(1);
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  // Store the initial button center position to avoid feedback loop
  const [centerPoint, setCenterPoint] = useState<{
    x: number;
    y: number;
  } | null>(null);

  useEffect(() => {
    if (buttonRef.current && !centerPoint) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      setCenterPoint({
        x: buttonRect.left + buttonRect.width / 2,
        y: buttonRect.top + buttonRect.height / 2,
      });
    }
  }, [centerPoint]);

  useMove(window, ({ offset }) => {
    if (!centerPoint) return;

    const distanceX = offset.x - centerPoint.x;
    const distanceY = offset.y - centerPoint.y;
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
      setMagneticScale(
        withSpring(1 + strength * 0.1, { stiffness: 400, damping: 30 })
      );
    } else {
      // Return to center when mouse is far
      setOffsetX(withSpring(0, { stiffness: 300, damping: 25 }));
      setOffsetY(withSpring(0, { stiffness: 300, damping: 25 }));
      setMagneticScale(withSpring(1, { stiffness: 300, damping: 25 }));
    }
  });

  // Combine all scales multiplicatively using combine utility
  const combinedScale = useMemo(
    () =>
      combine([magneticScale, hoverScale, pressScale], (m, h, p) => m * h * p),
    [magneticScale, hoverScale, pressScale]
  );

  // Handle hover state
  useEffect(() => {
    if (isHovered) {
      setHoverScale(withSpring(1.05, { stiffness: 400, damping: 25 }));
    } else {
      setHoverScale(withSpring(1, { stiffness: 400, damping: 25 }));
    }
  }, [isHovered, setHoverScale]);

  // Handle press state
  useEffect(() => {
    if (isPressed) {
      setPressScale(withSpring(0.95, { stiffness: 400, damping: 25 }));
    } else {
      setPressScale(withSpring(1, { stiffness: 400, damping: 25 }));
    }
  }, [isPressed, setPressScale]);

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
          scale: combinedScale,
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setIsPressed(false);
        }}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
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
