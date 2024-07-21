import {
  AnimatedBlock,
  useAnimatedValue,
  useMouseMove,
} from 'react-ui-animate';

export function Loop() {
  const x = useAnimatedValue(0);
  const y = useAnimatedValue(0);
  const rotateZ = useAnimatedValue(0, {
    onRest: function (value) {
      if (value === 0) {
        rotateZ.value = { toValue: 360, config: { duration: 2000 } };
      } else if (value === 360) {
        rotateZ.value = { toValue: 0, config: { immediate: true } };
      }
    },
  });

  useMouseMove(({ mouseX, mouseY }) => {
    x.value = mouseX - 50;
    y.value = mouseY - 50;
  });

  return (
    <AnimatedBlock
      style={{
        translateX: x.value,
        translateY: y.value,
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
