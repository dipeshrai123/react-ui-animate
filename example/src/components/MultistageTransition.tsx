import { AnimatedBlock, useAnimatedValue } from 'react-ui-animate';

export const MultistageTransition = () => {
  const x = useAnimatedValue(0);

  return (
    <>
      <AnimatedBlock
        style={{
          width: 100,
          height: 100,
          backgroundColor: 'red',
          translateX: x.value,
        }}
      />

      <button
        onClick={() => {
          x.value = 0;
        }}
      >
        ANIMATE LEFT
      </button>

      <button
        onClick={() => {
          x.value = 0;
        }}
      >
        ANIMATE RIGHT
      </button>
    </>
  );
};
