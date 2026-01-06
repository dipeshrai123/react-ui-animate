import { useEffect, useRef, useState } from 'react';
import {
  animate,
  snapTo,
  useDrag,
  useValue,
  withSpring,
} from 'react-ui-animate';

const BOX_WIDTH = 100;
const BOX_HEIGHT = 140;
const OFFSET = 20;

const Example = () => {
  const ref = useRef<HTMLDivElement>(null);
  const offset = useRef<{ x: number; y: number }>({ x: OFFSET, y: OFFSET });
  const [pos, setPos] = useValue({ x: OFFSET, y: OFFSET });
  const [size, setSize] = useValue({ width: BOX_WIDTH, height: BOX_HEIGHT });
  const [expanded, setExpanded] = useState(false);

  useDrag(ref, ({ down, movement, velocity }) => {
    if (expanded) return;

    if (down) {
      setPos(
        withSpring({
          x: movement.x + offset.current.x,
          y: movement.y + offset.current.y,
        })
      );
    } else {
      const newX = movement.x + offset.current.x;
      const newY = movement.y + offset.current.y;

      const x = snapTo(newX, velocity.x, [
        OFFSET,
        window.innerWidth - BOX_WIDTH - OFFSET,
      ]);
      const y = snapTo(newY, velocity.y, [
        OFFSET,
        window.innerHeight - BOX_HEIGHT - OFFSET,
      ]);

      offset.current = { x, y };

      setPos(withSpring(offset.current));
    }
  });

  useEffect(() => {
    if (expanded) {
      setPos(
        withSpring({
          x: OFFSET,
          y: OFFSET,
        })
      );
      setSize(
        withSpring({
          width: window.innerWidth - OFFSET * 2,
          height: window.innerHeight - OFFSET * 2,
        })
      );
    } else {
      setPos(withSpring(offset.current));
      setSize(
        withSpring({
          width: BOX_WIDTH,
          height: BOX_HEIGHT,
        })
      );
    }
  }, [expanded]);

  return (
    <animate.div
      ref={ref}
      onClick={() => setExpanded((p) => !p)}
      style={{
        left: 0,
        top: 0,
        width: size.width,
        height: size.height,
        backgroundColor: 'teal',
        borderRadius: 4,
        boxShadow: '0px 4px 8px rgba(0,0,0,0.2)',
        translateX: pos.x,
        translateY: pos.y,
        cursor: 'pointer',
        position: 'fixed',
      }}
    >
      <span style={{ color: 'white' }}>
        {expanded ? <>Click on me to collapse!</> : <>Click on me to expand!</>}
      </span>
    </animate.div>
  );
};

export default Example;
