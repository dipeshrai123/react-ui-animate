import React from 'react';
import { useMountedValue, AnimatedBlock, bInterpolate } from 'react-ui-animate';

export const UseMountedValue: React.FC = () => {
  const [open, setOpen] = React.useState(false);
  const mountedValue = useMountedValue(open, {
    from: 0,
    enter: 1,
    exit: 0,
    config: {
      duration: 200,
    },
    enterConfig: { duration: 2000 },
  });

  return (
    <>
      {mountedValue(
        (animation, mounted) =>
          mounted && (
            <AnimatedBlock
              style={{
                width: bInterpolate(animation.value, 100, 500),
                height: 100,
                backgroundColor: bInterpolate(
                  animation.value,
                  'red',
                  '#3399ff'
                ),
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
    </>
  );
};
