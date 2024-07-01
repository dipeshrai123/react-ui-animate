import React from 'react';
import {
  useMountedValue,
  AnimatedBlock,
  bInterpolate,
  useAnimatedValue,
} from 'react-ui-animate';

export const UseMountedValue: React.FC = () => {
  const x = useAnimatedValue(0);
  const [open, setOpen] = React.useState(true);
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
      <AnimatedBlock
        radius={x.value}
        style={{
          width: 100,
          height: 100,
          backgroundColor: '#3399ff',
          translateX: 100,
          rotate: x.value,
        }}
        onClick={() => (x.value = 45)}
      />
      {mountedValue(
        (animation, mounted) =>
          mounted && (
            <>
              <AnimatedBlock
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
              <AnimatedBlock
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
              <AnimatedBlock
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
