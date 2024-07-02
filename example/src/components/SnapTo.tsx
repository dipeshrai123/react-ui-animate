import { useRef } from 'react';
import {
  AnimatedBlock,
  useDrag,
  useAnimatedValue,
  snapTo,
  AnimationConfigUtils,
} from 'react-ui-animate';

import '../index.css';

export function SnapTo() {
  const x = useAnimatedValue(0, { ...AnimationConfigUtils.ELASTIC });
  const y = useAnimatedValue(0, { ...AnimationConfigUtils.ELASTIC });
  const offsetX = useRef(0);
  const offsetY = useRef(0);

  const bind = useDrag(
    ({ movementX, movementY, velocityX, velocityY, down }) => {
      if (!down) {
        offsetX.current = movementX + offsetX.current;
        offsetY.current = movementY + offsetY.current;

        const snapX = snapTo(offsetX.current, velocityX, [0, 600]);
        const snapY = snapTo(offsetY.current, velocityY, [0, 600]);

        x.value = snapX;
        y.value = snapY;

        offsetX.current = snapX;
        offsetY.current = snapY;
      } else {
        x.value = movementX + offsetX.current;
        y.value = movementY + offsetY.current;
      }
    }
  );

  return (
    <AnimatedBlock
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
