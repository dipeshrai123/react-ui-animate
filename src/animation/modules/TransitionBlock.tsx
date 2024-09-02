import * as React from 'react';

import { bin } from '../../gestures/helpers/math';
import { useValue, UseValueConfig } from '../hooks/useValue';

interface TransitionBlockProps {
  state: boolean;
  children: (animation: { value: any }) => React.ReactNode;
  config?: UseValueConfig;
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
  const amv = useValue(bin(state), config);

  return <>{children({ value: amv.value })}</>;
};
