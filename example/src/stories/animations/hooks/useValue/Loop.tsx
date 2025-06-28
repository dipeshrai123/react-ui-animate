import {
  animate,
  useValue,
  withDecay,
  withLoop,
  withSequence,
  withTiming,
} from 'react-ui-animate';

export function Loop() {
  const [translateX, setTranslateX] = useValue(0);

  const runAnimation = () => {
    setTranslateX(
      withLoop(withSequence([withTiming(50), withTiming(0)]), 2, {
        onComplete: () => {
          setTranslateX(withDecay(1));
        },
      })
    );
  };

  return (
    <>
      <button onClick={runAnimation}>ANIMATE</button>
      <animate.div
        style={{
          width: 100,
          height: 100,
          backgroundColor: '#3399ff',
          translateX,
        }}
      />
    </>
  );
}
