import { useRef } from 'react';
import { animate, useValue, useMove } from 'react-ui-animate';

const Example = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useValue({ x: 0, y: 0 });

  useMove(ref, function ({ event }) {
    setPos({ x: event.clientX, y: event.clientY });
  });

  return (
    <>
      <animate.div
        style={{
          width: 100,
          height: 100,
          backgroundColor: 'teal',
          borderRadius: 4,
          translateX: pos.x,
          translateY: pos.y,
          position: 'fixed',
          top: 0,
          left: 0,
          pointerEvents: 'none',
        }}
      />

      <div
        ref={ref}
        style={{
          width: 500,
          height: 500,
          backgroundColor: '#f1f1f1',
          borderRadius: 4,
          border: '1px solid #e1e1e1',
        }}
      />
    </>
  );
};

export default Example;
