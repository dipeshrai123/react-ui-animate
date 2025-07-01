import React from 'react';
import {
  animate,
  withSequence,
  withTiming,
  withSpring,
  Mount,
} from 'react-ui-animate';

const Example: React.FC = () => {
  const [open, setOpen] = React.useState(true);

  return (
    <>
      <Mount
        state={open}
        from={{ width: 200, opacity: 0, translateX: 0, rotate: 0 }}
        enter={withSequence([
          withTiming({ translateX: 100, opacity: 1, rotate: 0 }),
          withSpring({ width: 300 }),
        ])}
        exit={withSpring({
          translateX: 0,
          width: 200,
        })}
      >
        {({ width, opacity, translateX, rotate }) => (
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
        )}
      </Mount>

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
