import { useEffect } from 'react';
import {
  AnimatedBlock,
  useAnimatedValue,
  useMouseMove,
} from 'react-ui-animate';

export default function App() {
  const x = useAnimatedValue(0);
  const rotateZ = useAnimatedValue(0, {
    onRest: function ({ finished, value }: any) {
      if (finished) {
        if (value === 0) {
          rotateZ.value = { toValue: 360, config: { duration: 1000 } };
        } else if (value === 360) {
          rotateZ.value = { toValue: 0, config: { duration: 0 } };
        }
      }
    },
  });

  useMouseMove(({ mouseX }) => {
    x.value = mouseX;
  });

  useEffect(() => {
    rotateZ.value = { toValue: 360, config: { duration: 1000 } };
  }, [rotateZ]);

  return (
    <AnimatedBlock
      style={{
        translateX: x.value,
        width: 100,
      }}
    >
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
