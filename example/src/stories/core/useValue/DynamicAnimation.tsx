import {
  animate,
  AnimationConfig,
  useValue,
  withTiming,
} from 'react-ui-animate';

export const DynamicAnimation = () => {
  const x = useValue(0);

  return (
    <>
      <animate.div
        style={{
          width: 100,
          height: 100,
          backgroundColor: 'red',
          translateX: x.value,
        }}
      />

      <button
        onClick={() => {
          x.value = withTiming(0, AnimationConfig.Timing.BOUNCE);
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
