import * as React from 'react';

import { useMount, type UseMountConfig } from '../hooks';
import { FluidValue } from '@raidipesh78/re-motion';

interface MountedBlockProps extends Partial<UseMountConfig> {
  state: boolean;
  children: (animation: { value: FluidValue }) => React.ReactNode;
}

export const MountedBlock = ({
  state,
  children,
  from = 0,
  enter = 1,
  exit = 0,
}: MountedBlockProps) => {
  const open = useMount(state, { from, enter, exit });

  return (
    <>
      {open(
        (animation, mounted) =>
          mounted && children({ value: animation.value as any })
      )}
    </>
  );
};
