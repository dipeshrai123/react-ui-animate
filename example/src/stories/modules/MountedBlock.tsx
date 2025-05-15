import React from 'react';
import { MountedBlock, animate } from 'react-ui-animate';

export const Mounted: React.FC = () => {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <MountedBlock state={open}>
        {(animation) => (
          <animate.div
            style={{
              width: 100,
              height: 100,
              backgroundColor: '#3399ff',
              translateX: animation.value.to([0, 1], [0, 500]),
              borderRadius: animation.value.to([0.5, 1], ['0%', '100%']),
            }}
          />
        )}
      </MountedBlock>

      <button onClick={() => setOpen((prev) => !prev)}>ANIMATE ME</button>
    </>
  );
};
