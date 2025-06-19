import { useRef } from 'react';
import { useDrag, useValue, animate, withDecay } from 'react-ui-animate';

export const Decay = () => {
  const [translateX, setTranslateX] = useValue(0);
  const offsetX = useRef(0);
  const [animatedVelocityX, setAnimatedVelocityX] = useValue(0);

  const bind = useDrag(({ down, movementX, velocityX }) => {
    setAnimatedVelocityX(velocityX);

    setTranslateX(down ? movementX + offsetX.current : withDecay(velocityX));
  });

  return (
    <animate.div
      {...bind()}
      style={{
        width: 100,
        height: 100,
        backgroundColor: '#3399ff',
        translateX: translateX,
        skewX: animatedVelocityX.to([-10, 10], [-40, 40], {
          extrapolate: 'clamp',
        }),
      }}
    />
  );
};
