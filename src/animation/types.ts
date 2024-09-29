import { FluidValue, spring } from '@raidipesh78/re-motion';

export type EndCallbackResult = { finished: boolean; value?: number | string };

export type EndCallback = (result: EndCallbackResult) => void;

export type Controller = ReturnType<typeof spring>;

export type ToValue = (animation: FluidValue) => {
  controller: Controller;
  callback?: EndCallback;
};
