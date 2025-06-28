import React from 'react';
import {
  animate,
  useMount,
  withSequence,
  withTiming,
  withSpring,
} from 'react-ui-animate';

const Example: React.FC = () => {
  const [open, setOpen] = React.useState(true);

  const mountedValue = useMount(open, {
    from: { width: 200, opacity: 0, translateX: 0, rotate: 0 },
    enter: withSequence([
      withTiming({ translateX: 100, opacity: 1, rotate: 0 }),
      withSpring({ width: 300 }),
    ]),
    exit: withSpring({
      translateX: 0,
      width: 200,
    }),
  });

  return (
    <>
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
                borderRadius: 4,
              }}
            />
          )
        );
      })}

      <button
        className="mt"
        onClick={() => {
          setOpen((prev) => !prev);
        }}
      >
        ANIMATE ME
      </button>
    </>
  );
};

export default Example;
