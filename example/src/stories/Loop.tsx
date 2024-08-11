import { animate, useAnimatedValue, useMouseMove } from 'react-ui-animate';

export function Loop() {
  // const x = useAnimatedValue(0);
  // const y = useAnimatedValue(0);
  const rotateZ = useAnimatedValue(0, {
    loop: 5,
  });

  // useMouseMove(({ mouseX, mouseY }) => {
  //   x.value = mouseX - 50;
  //   y.value = mouseY - 50;
  // });

  return (
    <animate.div
      // style={{
      //   translateX: x.value,
      //   translateY: y.value,
      // }}
      onClick={() => (rotateZ.value = 100)}
    >
      <animate.div
        style={{
          width: 100,
          height: 100,
          backgroundColor: '#3399ff',
          rotateZ: rotateZ.value,
        }}
      />
    </animate.div>
  );
}
