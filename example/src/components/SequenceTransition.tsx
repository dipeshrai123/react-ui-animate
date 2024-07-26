import {
  animate,
  useAnimatedValue,
  withSpring,
  withTiming,
  withSequence,
  Easing,
  withDecay,
} from 'react-ui-animate';

export const SequenceTransition = () => {
  const x = useAnimatedValue(0);

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
          x.value = withTiming(0);
        }}
      >
        ANIMATE LEFT
      </button>

      <button
        onClick={() => {
          x.value = withSequence([
            withTiming(200, { duration: 5000, easing: Easing.elastic() }),
            withSpring(400),
            withDecay({ decay: true, velocity: 1 }),
          ]);
        }}
      >
        ANIMATE RIGHT
      </button>
    </>
  );
};
