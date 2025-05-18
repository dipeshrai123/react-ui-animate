import { withSpring } from './withSpring';
import { AnimationConfig } from '../helpers';

import type { WithCallbacks } from '../types';

interface WithEaseConfig extends WithCallbacks {}

export const withEase = (
  toValue: number,
  config?: WithEaseConfig,
  callback?: (result: any) => void
) =>
  withSpring(toValue, { ...AnimationConfig.Spring.EASE, ...config }, callback);
