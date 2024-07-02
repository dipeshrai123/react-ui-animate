import React from 'react';
import { MountedBlock, AnimatedBlock, bInterpolate } from 'react-ui-animate';

export const Mounted: React.FC = () => {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <MountedBlock state={open}>
        {(animation) => (
          <AnimatedBlock
            style={{
              width: 100,
              height: 100,
              backgroundColor: '#3399ff',
              translateX: bInterpolate(animation.value, 0, 500),
            }}
          />
        )}
      </MountedBlock>

      <button onClick={() => setOpen((prev) => !prev)}>ANIMATE ME</button>
    </>
  );
};
