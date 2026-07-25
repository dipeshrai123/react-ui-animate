import { useRef } from 'react';
import { animate, useDrag } from 'react-ui-animate';

import '../../../index.css';

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

function Example() {
  const ref = useRef(null);
  const { x, y } = useDrag(ref, {
    snapPoints: { x: [0, 200, 400, 600], y: [0, 200] },
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

export default Example;
