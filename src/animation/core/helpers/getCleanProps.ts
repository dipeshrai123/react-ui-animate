import { isFluidValue } from './isFluidValue';

/**
 * Filters out properties with fluid values from a given props object.
 * This function removes any properties that are considered fluid values,
 * typically those that subscribe to updates and therefore should not be
 * included in a static props object.
 *
 * @param props - The original props object, which may include fluid values.
 * @returns A new props object with fluid values removed.
 */
export const getCleanProps = ({ style, ...props }: any) => {
  return Object.fromEntries(
    Object.entries(props).filter(([_, value]) => !isFluidValue(value))
  ) as any;
};
