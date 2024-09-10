import { FluidValue } from '@raidipesh78/re-motion';

import {
  useMount as useInternalMount,
  UseMountConfig as UseInternalMountConfig,
} from '../core/useMount';

export interface UseMountConfig extends UseInternalMountConfig {}

/**
 * `useMount` handles mounting and unmounting of a component which captures current state
 * passed as an argument (`state`) and exposes the shadow state which handles the mount and unmount
 * of a component.
 *
 * @param { boolean } state - Boolean indicating the component should mount or unmount.
 * @param { UseMountConfig } config - Animation configuration.
 */
export function useMount(state: boolean, config: UseMountConfig) {
  const mv = useInternalMount(state, config);
  return (
    cb: (value: { value: FluidValue }, mounted: boolean) => React.ReactNode
  ) => mv((a, m) => cb({ value: a }, m));
}
