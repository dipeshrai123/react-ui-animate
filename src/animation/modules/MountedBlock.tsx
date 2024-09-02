import * as React from 'react';

import { useMount } from '../hooks/useMount';

import type { UseValueConfig } from '../hooks/useValue';
import type { UpdateValue } from '../core/FluidController';

interface MountedBlockProps {
  state: boolean;
  children: (animation: { value: any }) => React.ReactNode;
  from?: number;
  enter?: number | UpdateValue;
  exit?: number | UpdateValue;
  config?: UseValueConfig;
}

/**
 * MountedBlock - Higher order component which handles mounting and unmounting of a component.
 * @param { boolean } state - Boolean indicating the component should mount or unmount.
 * @param { function } children - Child as a function with `AnimatedValue` on `.value` property.
 * @param { number } } from - Number that dictates the beginning state for animation.
 * @param { number } enter - Number that dictates the entry state for animation.
 * @param { number } exit - Number that dictates the exit state for animation.
 * @param { UseValueConfig } config - Animation configuration for overall animation.
 */
export const MountedBlock = ({
  state,
  children,
  from = 0,
  enter = 1,
  exit = 0,
  config,
}: MountedBlockProps) => {
  const open = useMount(state, {
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
