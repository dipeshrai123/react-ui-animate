import { FluidValue, loop } from '@raidipesh78/re-motion';

import { ControllerAnimation } from './types';

export const withLoop =
  (
    animations: (value: FluidValue) => ControllerAnimation,
    iterations: number
  ) =>
  (value: FluidValue) =>
    loop(animations(value), { iterations });
