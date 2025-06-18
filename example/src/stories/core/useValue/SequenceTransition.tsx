import { animate, Easing, __experimental } from 'react-ui-animate';

const { useValue, withSpring, withTiming, withDecay, withSequence } =
  __experimental;

export const SequenceTransition = () => {
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
          setX(withTiming(0));
        }}
      >
        ANIMATE LEFT
      </button>

      <button
        onClick={() => {
          setX(
            withSequence([
              withTiming(200, { duration: 5000, easing: Easing.elastic() }),
              withSpring(400),
              withDecay(1),
            ])
          );
        }}
      >
        ANIMATE RIGHT
      </button>
    </>
  );
};
