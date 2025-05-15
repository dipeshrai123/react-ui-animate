import { useRef } from 'react';
import { useDrag, useValue, animate, withDecay } from 'react-ui-animate';

export const Decay = () => {
  const translateX = useValue<number>(0);
  const offsetX = useRef(0);
  const animatedVelocityX = useValue<number>(0);

  const bind = useDrag(({ down, movementX, velocityX }) => {
    animatedVelocityX.value = velocityX;

    translateX.value = down
      ? movementX + offsetX.current
      : withDecay({
          velocity: velocityX,
          onChange: (v) => (offsetX.current = v as number),
        });
  });

  return (
    <animate.div
      {...bind()}
      style={{
        width: 100,
        height: 100,
        backgroundColor: '#3399ff',
        translateX: translateX.value,
        skewX: animatedVelocityX.value.to([-10, 10], [-40, 40]),
      }}
    />
  );
};
