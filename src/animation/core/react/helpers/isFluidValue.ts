/**
 * isFluidValue to check the value is FluidValue or not
 * @param value - any
 * @returns - boolean
 */
export const isFluidValue = (value: any) => {
  return (
    typeof value === 'object' &&
    Object.prototype.hasOwnProperty.call(value, '_subscribe')
  );
};
