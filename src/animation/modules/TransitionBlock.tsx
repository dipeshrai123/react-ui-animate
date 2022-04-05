import * as React from 'react';
import { TransitionValue } from '@raidipesh78/re-motion';
import { bin } from '../../gestures/math';
import { useAnimatedValue, UseAnimatedValueConfig } from '../useAnimatedValue';

interface TransitionBlockProps {
  state: boolean;
  children: (animation: { value: TransitionValue }) => React.ReactNode;
  config?: UseAnimatedValueConfig;
}

/**
 * TransitionBlock - Higher order component which animates on state change.
 * @prop { boolean } state - Boolean indicating the current state of animation, usually `false = 0 and true = 1`.
 * @prop { function } children - Child as a function with `AnimatedValue` on `.value` property.
 * @prop { UseAnimatedValueConfig } config - Animation config.
 */
export const TransitionBlock = ({
  state,
  children,
  config,
}: TransitionBlockProps) => {
  const amv = useAnimatedValue(bin(state), config);

  return <>{children(amv)}</>;
};
