import { useEffect } from 'react';
import {
  AnimatedBlock,
  useAnimatedValue,
  useMouseMove,
  fluid,
} from 'react-ui-animate';

export function Loop() {
  const x = useAnimatedValue(0);
  const rotateZ = useAnimatedValue(0, {
    onRest: function ({ finished, value }: any) {
      if (finished) {
        if (value === 0) {
          rotateZ.value = 360;
        } else if (value === 360) {
          rotateZ.value = 0;
        }
      }
    },
  });

  useMouseMove(({ mouseX }) => {
    x.value = mouseX;
  });

  useEffect(() => {
    rotateZ.value = 360;
  }, [rotateZ]);

  return (
    <AnimatedBlock
      style={{
        translateX: rotateZ.value,
      }}
    >
      <fluid.div />
      <AnimatedBlock
        style={{
          width: 100,
          height: 100,
          backgroundColor: '#3399ff',
          rotateZ: rotateZ.value,
        }}
      />
    </AnimatedBlock>
  );
}
