import { useRef } from 'react';
import {
  animate,
  useValue,
  useDrag,
  clamp,
  withSpring,
  to,
} from 'react-ui-animate';

export default function Example() {
  const ref = useRef(null);
  const balloonRef = useRef<HTMLDivElement>(null);
  const offsetLeft = useRef(0);
  const [left, setLeft] = useValue(0);
  const [isDown, setIsDown] = useValue(0);
  const [balloonLeft, setBalloonLeft] = useValue(0);
  const [velocity, setVelocity] = useValue(0);

  useDrag(ref, ({ movement, down, velocity }) => {
    setIsDown(withSpring(down ? 1 : 0));
    setVelocity(velocity.x);

    const ballX = clamp(offsetLeft.current + movement.x, 0, 190);
    if (down) {
      setLeft(ballX);
      setBalloonLeft(withSpring(ballX));
    } else {
      offsetLeft.current = ballX;
    }

    if (balloonRef.current) {
      balloonRef.current.innerHTML = `${Number(
        to(ballX, [0, 190], [0, 100])
      ).toFixed(0)}%`;
    }
  });

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        marginTop: 100,
        width: '100%',
        height: '100%',
      }}
    >
      <div
        style={{
          width: 200,
          height: 100,
          position: 'relative',
        }}
      >
        <animate.div
          ref={balloonRef}
          style={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            border: '5px solid #b55ae6',
            position: 'absolute',
            left: balloonLeft,
            translateX: -20,
            top: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            translateY: isDown.to([0, 1], [80, 20]),
            scale: isDown,
            opacity: isDown,
            rotate: velocity.to([-2, 2], [30, -30]),
            color: '#666',
          }}
        />

        <div style={{ position: 'relative', height: 20, marginTop: 100 }}>
          <animate.div
            ref={ref}
            style={{
              width: 20,
              height: 20,
              borderRadius: '50%',
              border: '5px solid #3399ff',
              backgroundColor: '#fff',
              cursor: 'grab',
              position: 'absolute',
              top: 0,
              left: left,
              zIndex: 2,
              scale: isDown.to([0, 1], [1, 1.3]),
            }}
          />

          <div
            style={{
              width: 200,
              height: 4,
              backgroundColor: '#e1e1e1',
              position: 'absolute',
              bottom: 8,
              left: 0,
              userSelect: 'none',
            }}
          />
        </div>
      </div>
    </div>
  );
}
