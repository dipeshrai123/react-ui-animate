import { useValue, withTiming, animate } from 'react-ui-animate';

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
          setX(withTiming(0, { onChange: (v) => console.log(v) }));
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
