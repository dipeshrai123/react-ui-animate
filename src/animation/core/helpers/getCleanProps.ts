import { isFluidValue } from './isFluidValue';

/**
 * Function to get clean props object without any subscribers
 */
export const getCleanProps = ({ style, ...props }: any) => {
  return Object.fromEntries(
    Object.entries(props).filter(([_, value]) => !isFluidValue(value))
  ) as any;
};
