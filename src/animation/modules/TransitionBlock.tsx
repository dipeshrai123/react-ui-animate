import * as React from 'react';
import { FluidValue } from '@raidipesh78/re-motion';

import { bin } from '../../gestures/helpers';
import { useValue, type UseValueConfig } from '../hooks';

interface TransitionBlockProps {
  state: boolean;
  children: (animation: { value: FluidValue }) => React.ReactNode;
  config?: UseValueConfig;
}

/**
 * TransitionBlock - Higher order component which animates on state change.
 * @prop { boolean } state - Boolean indicating the current state of animation, usually `false = 0 and true = 1`.
 * @prop { function } children - Child as a function with `AnimatedValue` on `.value` property.
 * @prop { UseValueConfig } config - Animation configuration.
 */
export const TransitionBlock = ({
  state,
  children,
  config,
}: TransitionBlockProps) => {
  const amv = useValue(bin(state), config);

  return <>{children({ value: amv.value })}</>;
};
