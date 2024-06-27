import {
  _getTemplateString,
  getProcessedColor,
} from '../../interpolation/Interpolation';

/**
 * Determines if two values can be interpolated.
 * @param previousValue - The previous value to compare.
 * @param newValue - The new value to compare.
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
