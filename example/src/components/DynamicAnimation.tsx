import {
  AnimatedBlock,
  AnimationConfigUtils,
  useAnimatedValue,
} from 'react-ui-animate';

export const DynamicAnimation = () => {
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
          x.value = { toValue: 0, config: AnimationConfigUtils.BOUNCE };
        }}
      >
        ANIMATE LEFT
      </button>

      <button
        onClick={() => {
          x.value = 100;
        }}
      >
        ANIMATE RIGHT
      </button>
    </>
  );
};
