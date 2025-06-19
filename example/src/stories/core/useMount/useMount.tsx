import React from 'react';
import { animate, __experimental } from 'react-ui-animate';

const { useMount, withSequence, withTiming, withSpring } = __experimental;

export const UseMount: React.FC = () => {
  const [open, setOpen] = React.useState(true);
  const mountedValue = useMount(open, {
    from: { width: 200, opacity: 0, translateX: 0, rotate: 0 },
    enter: withSequence([
      withTiming({ translateX: 100, opacity: 1, rotate: 0 }),
      withSpring({ width: 300 }),
    ]),
    exit: withSpring({
      translateX: 0,
    }),
  });

  // const mounted = useMount(open, { from: 0, enter: 1, exit: 0 });

  return (
    <>
      {/* {mounted(
        (a, m) =>
          m && (
            <animate.div
              style={{
                width: 100,
                height: 100,
                backgroundColor: 'teal',
                opacity: a as any,
              }}
            />
          )
      )} */}

      <button
        onClick={() => {
          setOpen((prev) => !prev);
        }}
      >
        ANIMATE ME
      </button>

      {mountedValue(({ width, opacity, translateX, rotate }, mounted) => {
        return (
          mounted && (
            <animate.div
              style={{
                width: width,
                opacity,
                translateX,
                height: 100,
                backgroundColor: 'teal',
                rotate,
              }}
            />
          )
        );
      })}
    </>
  );
};
