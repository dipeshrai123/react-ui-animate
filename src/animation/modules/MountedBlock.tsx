import * as React from 'react';
import type { FluidValueConfig, Length } from '@raidipesh78/re-motion';

import { useMountedValue } from '../useMountedValue';
import { ValueType } from '../useAnimatedValue';

interface MountedValueConfig extends FluidValueConfig {}

type AssignValue = {
  toValue?: Length;
  config?: MountedValueConfig;
};

interface MountedBlockProps {
  state: boolean;
  children: (animation: { value: ValueType }) => React.ReactNode;
  from?: number;
  enter?:
    | number
    | AssignValue
    | ((update: (next: AssignValue) => Promise<any>) => void);
  exit?:
    | number
    | AssignValue
    | ((update: (next: AssignValue) => Promise<any>) => void);
  config?: MountedValueConfig;
}

/**
 * MountedBlock - Higher order component which handles mounting and unmounting of a component.
 * @param { boolean } state - Boolean indicating the component should mount or unmount.
 * @param { function } children - Child as a function with `AnimatedValue` on `.value` property.
 * @param { number } } from - Number that dictates the beginning state for animation.
 * @param { number | { toValue: number, config: MountedValueConfig } } enter - Number that dictates the entry state for animation.
 * @param { number | { toValue: number, config: MountedValueConfig } } exit - Number that dictates the exit state for animation.
 * @param { MountedValueConfig } config - Animation configuration for overall animation.
 */
export const MountedBlock = ({
  state,
  children,
  from = 0,
  enter = 1,
  exit = 0,
  config,
}: MountedBlockProps) => {
  const open = useMountedValue(state, {
    from,
    enter,
    exit,
    config,
  });

  return (
    <>
      {open(
        (animation, mounted) =>
          mounted && children({ value: animation.value as any })
      )}
    </>
  );
};
