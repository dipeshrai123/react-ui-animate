export function getToValue(value: unknown) {
  return typeof value === 'number' ? { toValue: value } : value;
}
