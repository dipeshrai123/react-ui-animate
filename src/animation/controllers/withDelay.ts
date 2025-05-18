import { delay } from '@raidipesh78/re-motion';

export const withDelay =
  (ms: number, callback?: (result: any) => void) => () => ({
    controller: delay(ms),
    callback,
  });
