import * as React from 'react';
import { TransitionValue } from '@raidipesh78/re-motion';
import { useMountedValue, UseMountedValueConfig } from '../useMountedValue';

interface MountedBlockProps {
  state: boolean;
  children: (animation: { value: TransitionValue }) => React.ReactNode;
  config: UseMountedValueConfig;
}

/**
 * MountedBlock - Higher order component which handles mounting and unmounting of a component.
 * @prop { boolean } state - Boolean indicating the component should mount or unmount.
 * @prop { function } children - Child as a function with `AnimatedValue` on `.value` property.
 * @prop { UseMountedValueConfig } config - `useAnimatedValue()` hooks configuration.
 */
export const MountedBlock = ({
  state,
  children,
  config,
}: MountedBlockProps) => {
  const open = useMountedValue(state, config);

  return <>{open((animation, mounted) => mounted && children(animation))}</>;
};
