import { ReactNode } from 'react';
import type { MotionValue } from '@raidipesh78/re-motion';

import type { Primitive } from '../types';
import {
  useMount,
  type ConfigMulti,
  type ConfigSingle,
} from '../hooks/useMount';

interface MountPropsSingle<T extends Primitive>
  extends Partial<ConfigSingle<T>> {
  state: boolean;
  children: (animation: MotionValue<T>) => ReactNode;
}

interface MountPropsMulti<I extends Record<string, Primitive>>
  extends ConfigMulti<I> {
  state: boolean;
  children: (animation: { [K in keyof I]: MotionValue<I[K]> }) => ReactNode;
}

export function Mount<T extends Primitive = number>(
  props: MountPropsSingle<T>
): ReactNode;

export function Mount<I extends Record<string, Primitive>>(
  props: MountPropsMulti<I>
): ReactNode;

export function Mount({
  state,
  children,
  ...config
}: MountPropsSingle<any> | MountPropsMulti<any>) {
  const open = useMount(state, config);
  return (
    <>{open((animation, mounted) => mounted && children(animation as any))}</>
  );
}
