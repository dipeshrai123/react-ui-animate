import { animate, __experimental } from 'react-ui-animate';

const { useValue, withSpring, withLoop } = __experimental;

export function Loop() {
  const [translateX, setTranslateX] = useValue(0);

  const runAnimation = () => {
    // Basic Loop
    setTranslateX(withLoop(withSpring(100), 5));

    // Loop with sequence
    // translateX.value = withLoop(
    //   withSequence([withSpring(100), withSpring(0)]),
    //   5
    // );

    // Loop and Sequence nested
    // translateX.value = withSequence([
    //   withSpring(100),
    //   withSpring(0),
    //   withLoop(withSequence([withTiming(100), withSpring(50)]), 5),
    // ]);
  };

  return (
    <animate.div
      onClick={runAnimation}
      style={{
        width: 100,
        height: 100,
        backgroundColor: '#3399ff',
        translateX,
      }}
    />
  );
}
