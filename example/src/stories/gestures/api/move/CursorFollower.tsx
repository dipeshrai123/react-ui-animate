import { useRef } from 'react';
import { animate, Gesture, useGesture, useValue, withSpring } from 'react-ui-animate';

const Example = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [cursorX, setCursorX] = useValue(0);
  const [cursorY, setCursorY] = useValue(0);
  const [dotX, setDotX] = useValue(0);
  const [dotY, setDotY] = useValue(0);

  useGesture(
    containerRef,
    Gesture.Move().onChange(({ offset }) => {
      setCursorX(withSpring(offset.x, { stiffness: 300, damping: 30 }));
      setCursorY(withSpring(offset.y, { stiffness: 300, damping: 30 }));

      setDotX(withSpring(offset.x, { stiffness: 150, damping: 25 }));
      setDotY(withSpring(offset.y, { stiffness: 150, damping: 25 }));
    })
  );

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

