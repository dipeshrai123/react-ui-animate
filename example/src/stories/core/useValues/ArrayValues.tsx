import {
  animate,
  withSpring,
  withTiming,
  AnimationConfig,
  withSequence,
  useValues,
} from 'react-ui-animate';

export const ArrayValues = () => {
  const translateX = useValues([0, 100, 200]);

  const animateLeft = () => {
    translateX.value = [
      withSpring(0),
      withTiming(0),
      withSequence([
        withSpring(200),
        withTiming(100, { duration: 3000 }),
        withSpring(0, AnimationConfig.Spring.WOBBLE),
      ]),
    ];
  };

  const animateRight = () => {
    translateX.value = [withSpring(100), withSpring(200), withSpring(300)];
  };

  return (
    <>
      <button onClick={animateLeft}>ANIMATE LEFT</button>
      <button onClick={animateRight}>ANIMATE RIGHT</button>
      {translateX.value.map((t, i) => (
        <animate.div
          key={i}
          style={{
            width: 100,
            height: 100,
            backgroundColor: '#3399ff',
            translateX: t,
          }}
        />
      ))}
    </>
  );
};
