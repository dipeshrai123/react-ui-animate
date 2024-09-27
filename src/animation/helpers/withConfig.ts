import { FluidValue, spring } from '@raidipesh78/re-motion';

type ControllerAnimation = ReturnType<typeof spring>;
type CallbackResult = { finished: boolean; value: number };

export interface WithConfig {
  onStart: (value: number | string) => void;
  onChange: (value: number | string) => void;
  onRest: (value: number | string) => void;
}

export interface WithConfigReturn {
  controller: ControllerAnimation;
  callback: (result: CallbackResult) => void;
}

export const withConfig = ({
  value,
  animationController,
  config,
}: {
  value: FluidValue;
  animationController: ControllerAnimation;
  config?: WithConfig;
}): WithConfigReturn => {
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
