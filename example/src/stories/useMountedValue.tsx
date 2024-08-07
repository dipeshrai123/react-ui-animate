import React from 'react';
import { useMountedValue, animate, bInterpolate } from 'react-ui-animate';

export const UseMountedValue: React.FC = () => {
  const [open, setOpen] = React.useState(true);
  const mountedValue = useMountedValue(open, {
    from: 0,
    enter: 1,
    exit: 0,
  });

  return (
    <>
      <button
        onClick={() => {
          setOpen((prev) => !prev);
        }}
      >
        ANIMATE ME
      </button>

      {mountedValue(
        (animation, mounted) =>
          mounted && (
            <>
              <animate.div
                style={{
                  width: bInterpolate(animation.value, 100, 300),
                  height: bInterpolate(animation.value, 100, 200),
                  backgroundColor: bInterpolate(
                    animation.value,
                    'red',
                    '#3399ff'
                  ),
                  translateX: 45,
                }}
              />
              <animate.div
                style={{
                  width: bInterpolate(animation.value, 100, 400),
                  height: bInterpolate(animation.value, 100, 50),
                  border: '1px solid black',
                  backgroundColor: bInterpolate(
                    animation.value,
                    'red',
                    '#3399ff'
                  ),
                  translateX: 45,
                }}
              />
              <animate.div
                style={{
                  width: bInterpolate(animation.value, 100, 500),
                  height: 100,
                  backgroundColor: bInterpolate(
                    animation.value,
                    'red',
                    '#3399ff'
                  ),
                  translateX: 45,
                }}
              />
            </>
          )
      )}
    </>
  );
};
