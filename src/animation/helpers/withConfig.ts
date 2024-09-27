import { FluidValue, spring } from '@raidipesh78/re-motion';

import type { UseValueConfig } from '../hooks';

type CallbackResult = { finished: boolean; value: number };
type ControllerAnimation = ReturnType<typeof spring>;

export interface WithConfig
  extends Pick<UseValueConfig, 'onRest' | 'onStart' | 'onChange'> {}

export const withConfig = ({
  value,
  animationController,
  config,
}: {
  value: FluidValue;
  animationController: ControllerAnimation;
  config?: UseValueConfig;
}) => {
  if (config?.onStart) {
    config?.onStart?.(value.get());
  }

  if (config?.onChange) {
    value.addListener((value) => config?.onChange?.(value));
  }

  return {
    controller: animationController,
    callback: (result: CallbackResult) =>
      result.finished && config?.onRest?.(result.value),
  };
};
