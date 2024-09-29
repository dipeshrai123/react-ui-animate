import { withSpring } from './withSpring';
import { AnimationConfig } from '../helpers';

interface WithEaseConfig {
  onStart?: (value: number | string) => void;
  onChange?: (value: number | string) => void;
  onRest?: (value: number | string) => void;
}

export const withEase = (
  toValue: number,
  config?: WithEaseConfig,
  callback?: (result: any) => void
) =>
  withSpring(toValue, { ...AnimationConfig.Spring.EASE, ...config }, callback);
