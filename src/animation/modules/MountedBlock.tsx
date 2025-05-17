import { ReactNode } from 'react';
import { MotionValue } from '@raidipesh78/re-motion';

import { useMount, type UseMountConfig } from '../hooks';
import { type Primitive } from '../types';

interface MountedBlockProps extends Partial<UseMountConfig> {
  state: boolean;
  children: (animation: MotionValue<Primitive>) => ReactNode;
}

export const MountedBlock = ({
  state,
  children,
  from,
  enter,
  exit,
}: MountedBlockProps) => {
  const open = useMount(state, { from, enter, exit });

  return <>{open((animation, mounted) => mounted && children(animation))}</>;
};
