import { useRef, useState } from 'react';
import { animate, Gesture, useGesture, useValue, withSpring } from 'react-ui-animate';
import { ExampleLayout, theme } from '../../../animations/shared';

const OFFSETS = {
  up: { x: 0, y: -220 },
  down: { x: 0, y: 220 },
  left: { x: -220, y: 0 },
  right: { x: 220, y: 0 },
};

function Example() {
  const boxRef = useRef<HTMLDivElement>(null);
  const [x, setX] = useValue(0);
  const [y, setY] = useValue(0);
  const [lastDirection, setLastDirection] = useState<string | null>(null);

  useGesture(
    boxRef,
    Gesture.Swipe().onSwipe(({ direction }) => {
      setLastDirection(direction);
      const { x: dx, y: dy } = OFFSETS[direction];
      setX(withSpring(dx, { stiffness: 300, damping: 20 }));
      setY(withSpring(dy, { stiffness: 300, damping: 20 }));
      setTimeout(() => {
        setX(withSpring(0, { stiffness: 300, damping: 30 }));
        setY(withSpring(0, { stiffness: 300, damping: 30 }));
      }, 250);
    })
  );

  return (
    <ExampleLayout
      tag="Swipe"
      title="Gesture.Swipe()"
      description="A fling/flick gesture resolved once, at release, when the dominant-axis distance and velocity both clear a threshold. Unlike Pan, there's no streaming onChange — only a single onSwipe({ direction }) callback. A slow or short drag fires nothing."
      onRestart={() => {
        setX(0);
        setY(0);
        setLastDirection(null);
      }}
    >
      <div
        style={{
          width: '100%',
          height: 320,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          border: `1px solid ${theme.color.border}`,
          borderRadius: theme.radius.md,
          backgroundColor: theme.color.surface,
        }}
      >
        <animate.div
          ref={boxRef}
          style={{
            width: 140,
            height: 140,
            borderRadius: 20,
            backgroundColor: '#ff6b35',
            boxShadow: '0 10px 30px rgba(255, 107, 53, 0.35)',
            cursor: 'grab',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 600,
            fontSize: 14,
            textAlign: 'center',
            translateX: x,
            translateY: y,
          }}
        >
          Flick me
        </animate.div>
        <p style={{ color: theme.color.textFaint, fontSize: 14 }}>
          {lastDirection ? `Last swipe: ${lastDirection}` : 'Flick the box in any direction'}
        </p>
      </div>
    </ExampleLayout>
  );
}

export default Example;
