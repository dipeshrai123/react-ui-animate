import { FluidValue } from '../controllers/FluidValue';
import { isDefined } from './isDefined';

/**
 * Checks if the given value is of type FluidValue.
 * A value is considered a FluidValue if it is defined,
 * an object, and contains the '_subscribe' property.
 *
 * @param value - The value to check.
 * @returns - True if the value is a FluidValue, false otherwise.
 */
export const isFluidValue = (value: unknown): value is FluidValue => {
  return isDefined(value) && typeof value === 'object' && '_subscribe' in value;
};
