import { useValue, withTiming, animate, withDecay } from 'react-ui-animate';

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
          setX(withTiming(0));
        }}
      >
        ANIMATE LEFT
      </button>

      <button
        onClick={() => {
          setX(withDecay(1));
        }}
      >
        ANIMATE RIGHT
      </button>
    </>
  );
};
