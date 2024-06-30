import * as React from 'react';
import { bin } from '../../../gestures/helpers/math';
import {
  useAnimatedValue,
  UseAnimatedValueConfig,
  ValueType,
} from '../useAnimatedValue';

interface TransitionBlockProps {
  state: boolean;
  children: (animation: { value: ValueType }) => React.ReactNode;
  config?: UseAnimatedValueConfig;
}

/**
 * TransitionBlock - Higher order component which animates on state change.
 * @prop { boolean } state - Boolean indicating the current state of animation, usually `false = 0 and true = 1`.
 * @prop { function } children - Child as a function with `AnimatedValue` on `.value` property.
 * @prop { UseAnimatedValueConfig } config - Animation configuration.
 */
export const TransitionBlock = ({
  state,
  children,
  config,
}: TransitionBlockProps) => {
  const amv = useAnimatedValue(bin(state), config);

  return <>{children({ value: amv.value })}</>;
};
