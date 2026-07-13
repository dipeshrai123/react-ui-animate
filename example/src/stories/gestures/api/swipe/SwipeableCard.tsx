import { useRef, useState } from 'react';
import { animate, Gesture, useGesture, useValue, withSpring } from 'react-ui-animate';

const CARDS = ['🎴', '🃏', '🀄', '♠️'];

const Example = () => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [x, setX] = useValue(0);
  const [rotation, setRotation] = useValue(0);

  useGesture(
    cardRef,
    Gesture.Swipe()
      .axis('x')
      .onSwipe(({ direction }) => {
        const dx = direction === 'left' ? -600 : 600;
        setX(withSpring(dx, { stiffness: 200, damping: 25 }));
        setRotation(withSpring(direction === 'left' ? -30 : 30, { stiffness: 200, damping: 25 }));

        setTimeout(() => {
          setIndex((i) => (i + 1) % CARDS.length);
          setX(0);
          setRotation(0);
        }, 200);
      })
  );

  return (
    <div
      style={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f0f0f0',
        position: 'relative',
        overflow: 'hidden',
        gap: 16,
      }}
    >
      <animate.div
        ref={cardRef}
        style={{
          width: 260,
          height: 340,
          backgroundColor: 'white',
          borderRadius: 20,
          boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
          cursor: 'grab',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 96,
          translateX: x,
          rotate: rotation,
        }}
      >
        {CARDS[index]}
      </animate.div>
      <p style={{ color: '#666', fontSize: 14 }}>Swipe left or right to see the next card</p>
    </div>
  );
};

export default Example;
