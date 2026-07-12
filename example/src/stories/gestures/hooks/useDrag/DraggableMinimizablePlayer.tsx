import { useRef, useState } from 'react';
import { animate, Gesture, useGesture, useValue, withSpring } from 'react-ui-animate';
import { ExampleLayout } from '../../../animations/shared';

const EXPANDED = { width: 480, height: 270 };
const MINIMIZED = { width: 220, height: 124 };

function Example() {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);

  const [x, setX] = useValue(0);
  const [y, setY] = useValue(0);
  const [expanded, setExpanded] = useState(true);

  // `movement` resets every drag — track the position it started from so
  // consecutive drags accumulate instead of jumping back to (0, 0).
  const dragStartRef = useRef({ x: 0, y: 0 });

  useGesture(
    playerRef,
    Gesture.Pan()
      .onStart(() => {
        dragStartRef.current = { x: x.current, y: y.current };
      })
      .onUpdate(({ movement }) => {
        setX(dragStartRef.current.x + movement.x);
        setY(dragStartRef.current.y + movement.y);
      })
      .onEnd(({ movement }) => {
        setX(withSpring(dragStartRef.current.x + movement.x, { stiffness: 300, damping: 30 }));
        setY(withSpring(dragStartRef.current.y + movement.y, { stiffness: 300, damping: 30 }));
      })
  );

  const size = expanded ? EXPANDED : MINIMIZED;

  return (
    <ExampleLayout
      title="Draggable, Minimizable Player"
      description="Dragging the player moves it around; a plain tap toggles expand/minimize. Gesture.Pan() swallows the synthetic click the browser fires after a drag, so dragging never also triggers onClick."
      showRestartButton={false}
    >
      <div
        ref={containerRef}
        style={{
          position: 'relative',
          width: '100%',
          height: 420,
          border: '2px solid #e0e0e0',
          borderRadius: 12,
          backgroundColor: '#0f1115',
          overflow: 'hidden',
        }}
      >
        <animate.div
          ref={playerRef}
          onClick={() => setExpanded((v) => !v)}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: size.width,
            height: size.height,
            borderRadius: 14,
            backgroundColor: '#1a1d24',
            boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
            cursor: 'grab',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            color: 'white',
            userSelect: 'none',
            translateX: x,
            translateY: y,
          }}
          animate={{
            width: withSpring(size.width, { stiffness: 260, damping: 26 }),
            height: withSpring(size.height, { stiffness: 260, damping: 26 }),
          }}
        >
          <div style={{ fontSize: expanded ? 56 : 32 }}>▶️</div>
          <p style={{ margin: '8px 0 0', fontSize: 13, color: '#9aa0ac' }}>
            Drag to move · tap to {expanded ? 'minimize' : 'expand'}
          </p>
        </animate.div>
      </div>
    </ExampleLayout>
  );
}

export default Example;
