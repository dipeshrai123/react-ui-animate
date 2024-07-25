import { useRef } from 'react';
import {
  useDrag,
  useAnimatedValue,
  AnimatedBlock,
  interpolate,
} from 'react-ui-animate';

export const Decay = () => {
  const translateX = useAnimatedValue(0);
  const offsetX = useRef(0);
  const animatedVelocityX = useAnimatedValue(0);

  const bind = useDrag(({ down, movementX, velocityX }) => {
    animatedVelocityX.value = velocityX;

    translateX.value = down
      ? movementX + offsetX.current
      : {
          config: {
            decay: true,
            velocity: velocityX,
            onChange: (v: number) => (offsetX.current = v),
          },
        };
  });

  return (
    <AnimatedBlock
      {...bind()}
      style={{
        width: 100,
        height: 100,
        backgroundColor: '#3399ff',
        translateX: translateX.value,
        skewX: interpolate(animatedVelocityX.value, [-10, 10], [-40, 40]),
      }}
    />
  );
};
