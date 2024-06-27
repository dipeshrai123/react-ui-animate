/**
 * isTransitionValue to check the value is TransitionValue or not
 * @param value - any
 * @returns - boolean
 */
export const isTransitionValue = (value: any) => {
  return (
    typeof value === 'object' &&
    Object.prototype.hasOwnProperty.call(value, '_subscribe')
  );
};
