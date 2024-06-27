import {
  _getTemplateString,
  getProcessedColor,
} from '../../interpolation/Interpolation';

export function canInterpolate(
  previousValue: number | string,
  newValue: number | string
) {
  if (typeof previousValue !== typeof newValue) return false;
  if (typeof newValue === 'number') return true;

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
