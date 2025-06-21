import { useRef } from 'react';
import { useScroll, useValue, to, animate, withSpring } from 'react-ui-animate';

export const Scroll = () => {
  const [x, setX] = useValue(100);
  const [color, setColor] = useValue('yellow');
  const [position, setPosition] = useValue('fixed');
  const ref = useRef(null);
  useScroll(ref, function ({ offset }) {
    setX(
      withSpring(
        to(offset.y, [0, 200], [100, 300], {
          extrapolate: 'clamp',
        })
      )
    );

    if (offset.y > 100) {
      setPosition('absolute');
      setColor('red');
    } else {
      setPosition('fixed');
      setColor('yellow');
    }
  });

  return (
    <>
      <div
        ref={ref}
        style={{
          width: 500,
          height: 500,
          overflowY: 'auto',
          backgroundColor: '#3399ff',
          position: 'relative',
        }}
      >
        <animate.div
          onClick={() => setColor('red')}
          style={{
            width: 100,
            height: 100,
            backgroundColor: color,
            top: 100,
            left: x,
            position,
          }}
        />
        <div style={{ height: 2000 }} />
      </div>
    </>
  );
};
