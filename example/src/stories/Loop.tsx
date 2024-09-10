import {
  animate,
  useValue,
  withSequence,
  withSpring,
  withLoop,
  withTiming,
} from 'react-ui-animate';

export function Loop() {
  const translateX = useValue(0);

  const runAnimation = () => {
    // translateX.value = withLoop(
    //   withSequence([withSpring(100), withSpring(0)]),
    //   5
    // );

    // translateX.value = withLoop(withSpring(100), 5);

    translateX.value = withSequence([
      withSpring(100),
      withSpring(0),
      withLoop(withSequence([withTiming(100), withSpring(50)]), 5),
    ]);
  };

  return (
    <animate.div
      onClick={runAnimation}
      style={{
        width: 100,
        height: 100,
        backgroundColor: '#3399ff',
        translateX: translateX.value,
      }}
    />
  );
}
