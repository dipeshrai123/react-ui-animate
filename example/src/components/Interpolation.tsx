import { AnimatedBlock, interpolate, useAnimatedValue } from 'react-ui-animate';

export const Interpolation = () => {
  const x = useAnimatedValue(0);

  return (
    <>
      <AnimatedBlock
        style={{
          width: 100,
          height: 100,
          backgroundColor: interpolate(x.value, [0, 500], ['red', 'blue']),
          translateX: x.value,
        }}
      />

      <button onClick={() => (x.value = 100)}>ANIMATE ME</button>
    </>
  );
};
