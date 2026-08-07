import { GRADIENT_RE, TOKEN_RE, TRANSFORM_KEYWORDS } from './utils';

export function isTransform(str: string): boolean {
  return TRANSFORM_KEYWORDS.some((keyword) => str.toLowerCase().includes(keyword));
}

export function hasDifferentTransformFormats(fromStr: string, toStr: string): boolean {
  if (!isTransform(fromStr) || !isTransform(toStr)) return false;

  const fromParts = fromStr.split(TOKEN_RE).filter((s) => s !== '');
  const toParts = toStr.split(TOKEN_RE).filter((s) => s !== '');
  if (fromParts.length !== toParts.length) return true;

  const fromHasMatrix = fromStr.toLowerCase().includes('matrix');
  const toHasMatrix = toStr.toLowerCase().includes('matrix');
  const fromHasIndividual = ['translate', 'rotate', 'scale', 'skew'].some((k) =>
    fromStr.toLowerCase().includes(k)
  );
  const toHasIndividual = ['translate', 'rotate', 'scale', 'skew'].some((k) =>
    toStr.toLowerCase().includes(k)
  );

  return (fromHasMatrix && toHasIndividual) || (toHasMatrix && fromHasIndividual);
}

export function canSwitchFunctionNames(fromStr: string, toStr: string): boolean {
  const fromGradient = fromStr.match(GRADIENT_RE);
  const toGradient = toStr.match(GRADIENT_RE);
  if (fromGradient && toGradient) return true;
  return hasDifferentTransformFormats(fromStr, toStr);
}
