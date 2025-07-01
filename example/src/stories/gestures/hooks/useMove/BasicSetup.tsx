import { animate, useValue, useMove } from 'react-ui-animate';

const Example = () => {
  const [pos, setPos] = useValue({ x: 0, y: 0 });

  useMove(window, function ({ event }) {
    setPos({ x: event.clientX, y: event.clientY });
  });

  return (
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
  );
};

export default Example;
