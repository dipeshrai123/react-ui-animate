import { FluidValue, sequence } from '@raidipesh78/re-motion';

import { ControllerAnimation } from './types';

export const withSequence =
  (animations: Array<(value: FluidValue) => ControllerAnimation>) =>
  (value: FluidValue) =>
    sequence(animations.map((a) => a(value)));
