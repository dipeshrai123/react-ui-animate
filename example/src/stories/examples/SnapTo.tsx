import { useRef } from 'react';
import {
  animate,
  useDrag,
  useValue,
  snapTo,
  withSpring,
} from 'react-ui-animate';

import '../../index.css';

export function SnapTo() {
  const [{ x, y }, setXY] = useValue({ x: 0, y: 0 });
  const offset = useRef({ x: 0, y: 0 });

  const bind = useDrag(
    ({ movementX, movementY, velocityX, velocityY, down }) => {
      if (!down) {
        offset.current = {
          x: movementX + offset.current.x,
          y: movementY + offset.current.y,
        };

        const snapX = snapTo(offset.current.x, velocityX, [0, 600]);
        const snapY = snapTo(offset.current.y, velocityY, [0, 600]);

        setXY({ x: withSpring(snapX), y: withSpring(snapY) });

        offset.current = { x: snapX, y: snapY };
      } else {
        setXY({
          x: movementX + offset.current.x,
          y: movementY + offset.current.y,
        });
      }
    }
  );

  return (
    <animate.div
      {...bind()}
      style={{
        backgroundColor: '#3399ff',
        width: 200,
        height: 200,
        position: 'fixed',
        left: x,
        top: y,
        boxShadow: '0px 4px 6px rgba(0,0,0,0.2)',
        borderRadius: 10,
        cursor: 'grab',
      }}
    />
  );
}
