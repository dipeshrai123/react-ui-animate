import React from 'react';
import {
  MountedBlock,
  AnimatedBlock,
  bInterpolate,
  withSequence,
  withSpring,
  interpolate,
  withEase,
} from 'react-ui-animate';

export const Mounted: React.FC = () => {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <MountedBlock
        state={open}
        enter={withSequence([withSpring(0.5), withEase(1)])}
      >
        {(animation) => (
          <AnimatedBlock
            style={{
              width: 100,
              height: 100,
              backgroundColor: '#3399ff',
              translateX: bInterpolate(animation.value, 0, 500),
              borderRadius: interpolate(
                animation.value,
                [0.5, 1],
                ['0%', '100%'],
                { extrapolateLeft: 'clamp' }
              ),
            }}
          />
        )}
      </MountedBlock>

      <button onClick={() => setOpen((prev) => !prev)}>ANIMATE ME</button>
    </>
  );
};
