import {
  _getTemplateString,
  getProcessedColor,
} from '../interpolation/Interpolation';

/**
 * Determines if two values can be interpolated.
 * This function checks if two values, either numbers or strings,
 * can be interpolated by ensuring they are of the same type and, in the case of strings,
 * that they are compatible for interpolation based on processed color values.
 *
 * @param previousValue - The previous value to compare. Can be a number or a string.
 * @param newValue - The new value to compare. Can be a number or a string.
 * @returns True if interpolation is possible, false otherwise.
 */
export function canInterpolate(
  previousValue: number | string,
  newValue: number | string
): boolean {
  if (typeof previousValue !== typeof newValue) {
    return false;
  }

  if (typeof newValue === 'number') {
    return true;
  }

  if (typeof previousValue === 'string') {
    const processedPreviousValue = getProcessedColor(previousValue);
    const processedNewValue = getProcessedColor(newValue);

    return (
      processedPreviousValue !== processedNewValue &&
      _getTemplateString(processedPreviousValue) ===
        _getTemplateString(processedNewValue)
    );
  }

  return false;
}
