import {
  useValue,
  withTiming,
  animate,
  AnimationConfig,
} from 'react-ui-animate';

export const DynamicAnimation = () => {
  const [x, setX] = useValue(0);

  return (
    <>
      <animate.div
        style={{
          width: 100,
          height: 100,
          backgroundColor: 'red',
          translateX: x,
        }}
      />

      <button
        onClick={() => {
          setX(withTiming(0, AnimationConfig.Timing.BOUNCE));
        }}
      >
        ANIMATE LEFT
      </button>

      <button
        onClick={() => {
          setX(100);
        }}
      >
        ANIMATE RIGHT
      </button>
    </>
  );
};
