import * as React from 'react';
import { FluidValue } from '@raidipesh78/re-motion';

import { bin } from '../../gestures/helpers';
import { useValue } from '../hooks';

interface TransitionBlockProps {
  state: boolean;
  children: (animation: { value: FluidValue }) => React.ReactNode;
}

export const TransitionBlock = ({ state, children }: TransitionBlockProps) => {
  const amv = useValue(bin(state));

  return <>{children({ value: amv.value })}</>;
};
