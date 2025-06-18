export function filterCallbackOptions(
  options: Record<string, any> = {},
  attach: boolean
) {
  if (attach) return options;
  const { onStart, onChange, onComplete, ...rest } = options;
  return rest;
}
