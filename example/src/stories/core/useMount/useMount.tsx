import React from 'react';
import {
  animate,
  useMount,
  withDecay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-ui-animate';

export const UseMount: React.FC = () => {
  const [open, setOpen] = React.useState(true);
  // const mountedValue = useMount(open, {
  //   from: { width: 200, opacity: 0, translateX: 0 },
  //   enter: {
  //     width: 300,
  //     opacity: 1,
  //     translateX: withTiming(200, { duration: 5000 }),
  //   },
  //   exit: {
  //     width: 100,
  //     opacity: 1,
  //     translateX: withSequence([
  //       withTiming(0, { duration: 2000 }),
  //       withDecay({ velocity: 1 }),
  //       withSpring(100),
  //     ]),
  //   },
  // });

  const mounted = useMount(open, { from: 0, enter: 1, exit: 0 });

  return (
    <>
      {mounted(
        (a, m) =>
          m && (
            <animate.div
              style={{
                width: 100,
                height: 100,
                backgroundColor: 'teal',
                opacity: a,
              }}
            />
          )
      )}

      <button
        onClick={() => {
          setOpen((prev) => !prev);
        }}
      >
        ANIMATE ME
      </button>

      {/* {mountedValue(({ width, opacity, translateX }, mounted) => {
        return (
          mounted && (
            <animate.div
              style={{
                width: width,
                opacity,
                translateX,
                height: 100,
                backgroundColor: 'teal',
              }}
            />
          )
        );
      })} */}
    </>
  );
};
