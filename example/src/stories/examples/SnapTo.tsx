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
  const x = useValue<number>(0);
  const y = useValue<number>(0);
  const offsetX = useRef(0);
  const offsetY = useRef(0);

  const bind = useDrag(
    ({ movementX, movementY, velocityX, velocityY, down }) => {
      if (!down) {
        offsetX.current = movementX + offsetX.current;
        offsetY.current = movementY + offsetY.current;

        const snapX = snapTo(offsetX.current, velocityX, [0, 600]);
        const snapY = snapTo(offsetY.current, velocityY, [0, 600]);

        x.value = withSpring(snapX);
        y.value = withSpring(snapY);

        offsetX.current = snapX;
        offsetY.current = snapY;
      } else {
        x.value = movementX + offsetX.current;
        y.value = movementY + offsetY.current;
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
        left: x.value,
        top: y.value,
        boxShadow: '0px 4px 6px rgba(0,0,0,0.2)',
        borderRadius: 10,
        cursor: 'grab',
      }}
    />
  );
}
