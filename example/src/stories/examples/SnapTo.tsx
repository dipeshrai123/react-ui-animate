import { useRef } from 'react';
import {
  animate,
  useDrag,
  useValue,
  snapTo,
  withSpring,
} from 'react-ui-animate';

import '../../index.css';

const SNAP_COORDINATES = [
  { x: 0, y: 0 },
  { x: 200, y: 0 },
  { x: 400, y: 0 },
  { x: 600, y: 0 },
  { x: 0, y: 200 },
  { x: 200, y: 200 },
  { x: 400, y: 200 },
  { x: 600, y: 200 },
];

export function SnapTo() {
  const [{ x, y }, setXY] = useValue({ x: 0, y: 0 });
  const offset = useRef({ x: 0, y: 0 });
  const ref = useRef(null);

  useDrag(ref, ({ movement, velocity, down }) => {
    if (!down) {
      offset.current = {
        x: movement.x + offset.current.x,
        y: movement.y + offset.current.y,
      };

      const snapX = snapTo(offset.current.x, velocity.x, [0, 200, 400, 600]);
      const snapY = snapTo(offset.current.y, velocity.y, [0, 200, 400, 600]);

      setXY(withSpring({ x: snapX, y: snapY }));

      offset.current = { x: snapX, y: snapY };
    } else {
      setXY({
        x: movement.x + offset.current.x,
        y: movement.y + offset.current.y,
      });
    }
  });

  return (
    <>
      <animate.div
        ref={ref}
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

      {SNAP_COORDINATES.map((coord, index) => (
        <div
          key={index}
          style={{
            position: 'absolute',
            left: coord.x,
            top: coord.y,
            width: 200,
            height: 200,
            border: '1px dashed #ff0000',
            borderRadius: 10,
            zIndex: -1,
          }}
        />
      ))}
    </>
  );
}
