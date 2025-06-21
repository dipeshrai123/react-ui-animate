import { useRef } from 'react';
import { animate, useValue, useWheel, withSpring } from 'react-ui-animate';

export const Wheel = () => {
  const ref = useRef(null);
  const [progress, setProgress] = useValue(0);

  useWheel(ref, function ({ velocity }) {
    setProgress(withSpring(velocity.y));
  });

  return (
    <>
      <animate.div
        ref={ref}
        style={{
          width: 500,
          height: 500,
          overflowY: 'auto',
          backgroundColor: '#3399ff',
          borderRadius: progress.to([-5, 0, 5], [100, 0, 100]),
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 250,
            left: 250,
            transform: 'translate(-50%, -50%)',
            color: 'white',
          }}
        >
          WHEEL SCROLL ME
        </div>
        <div style={{ height: 2000 }} />
      </animate.div>
    </>
  );
};
