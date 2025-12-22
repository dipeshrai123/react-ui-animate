import {
  animate,
  useValue,
  withTiming,
  withLoop,
  withSequence,
} from 'react-ui-animate';

const Example = () => {
  const [translateX, setTranslateX] = useValue(0);

  const handleClick = () => {
    setTranslateX(
      withSequence([
        withTiming(-20, { duration: 50 }),
        withLoop(
          withSequence([
            withTiming(20, {
              duration: 100,
            }),
            withTiming(-20, {
              duration: 100,
            }),
          ]),
          5
        ),
        withTiming(0, { duration: 50 }),
      ])
    );
  };

  return (
    <>
      <animate.div
        onClick={handleClick}
        style={{
          width: 100,
          height: 100,
          backgroundColor: 'teal',
          borderRadius: 4,
          rotate: translateX,
        }}
      />
    </>
  );
};

export default Example;
