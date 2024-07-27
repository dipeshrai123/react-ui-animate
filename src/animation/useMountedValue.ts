import { FluidValue } from '@raidipesh78/re-motion';

import { useMount, UseMountConfig } from './core/useMount';

export interface UseMountedValueConfig extends UseMountConfig {}

/**
 * `useMountedValue` handles mounting and unmounting of a component which captures current state
 * passed as an argument (`state`) and exposes the shadow state which handles the mount and unmount
 * of a component.
 *
 * @param { boolean } state - Boolean indicating the component should mount or unmount.
 * @param { UseAnimatedValueConfig } config - Animation configuration.
 */
export function useMountedValue(state: boolean, config: UseMountedValueConfig) {
  const mv = useMount(state, config);
  return (
    cb: (value: { value: FluidValue }, mounted: boolean) => React.ReactNode
  ) => mv((a, m) => cb({ value: a }, m));
}
