import * as React from "react";
import { FluidValue, TransitionValueConfig } from "@raidipesh78/re-motion";
import { useMountedValue } from "../useMountedValue";

interface MountedValueConfig extends TransitionValueConfig {}

interface MountedBlockProps {
  state: boolean;
  children: (animation: { value: FluidValue }) => React.ReactNode;
  from?: number;
  enter?: number;
  exit?: number;
  config?: MountedValueConfig;
  enterConfig?: MountedValueConfig;
  exitConfig?: MountedValueConfig;
}

/**
 * MountedBlock - Higher order component which handles mounting and unmounting of a component.
 * @prop { boolean } state - Boolean indicating the component should mount or unmount.
 * @prop { function } children - Child as a function with `AnimatedValue` on `.value` property.
 * @prop { number } from - Number that dictates the beginning state for animation.
 * @prop { number } enter - Number that dictates the entry state for animation.
 * @prop { number } exit - Number that dictates the exit state for animation.
 * @prop { MountedValueConfig } config - Animation configuration for overall animation.
 * @prop { MountedValueConfig } enterConfig - Animation configuration for the entering state of animation.
 * @prop { MountedValueConfig } exitConfig - Animation configuration for the entering state of animation.
 */
export const MountedBlock = ({
  state,
  children,
  from = 0,
  enter = 1,
  exit = 0,
  config,
  enterConfig,
  exitConfig,
}: MountedBlockProps) => {
  const open = useMountedValue(state, {
    from,
    enter,
    exit,
    config,
    enterConfig,
    exitConfig,
  });

  return <>{open((animation, mounted) => mounted && children(animation))}</>;
};
