// box-shadow/text-shadow pattern: [keyword]? offsetX offsetY blur [spread]? color
// (both the 3-value and 4-value forms).
export function parseBoxShadow(
  shadow: string
): { keyword: string; values: Array<{ num: string; unit: string }>; color: string } | null {
  const shadowMatch = shadow.match(/^(\S+\s+)?(-?\d+(?:\.\d+)?)(px|rem|em|%|cm|mm|in|pt|pc|ch|vh|vw|vmin|vmax)?\s+(-?\d+(?:\.\d+)?)(px|rem|em|%|cm|mm|in|pt|pc|ch|vh|vw|vmin|vmax)?\s+(-?\d+(?:\.\d+)?)(px|rem|em|%|cm|mm|in|pt|pc|ch|vh|vw|vmin|vmax)?(?:\s+(-?\d+(?:\.\d+)?)(px|rem|em|%|cm|mm|in|pt|pc|ch|vh|vw|vmin|vmax)?)?\s+(.+)$/);
  if (shadowMatch) {
    const keyword = shadowMatch[1] || '';
    const values: Array<{ num: string; unit: string }> = [];

    if (shadowMatch[2]) values.push({ num: shadowMatch[2], unit: shadowMatch[3] || '' });
    if (shadowMatch[4]) values.push({ num: shadowMatch[4], unit: shadowMatch[5] || '' });
    if (shadowMatch[6]) values.push({ num: shadowMatch[6], unit: shadowMatch[7] || '' });
    if (shadowMatch[8]) values.push({ num: shadowMatch[8], unit: shadowMatch[9] || '' });

    const color = shadowMatch[10];
    return { keyword, values, color };
  }
  return null;
}

export function createZeroValueFromTarget(target: string): string {
  const parsed = parseBoxShadow(target);
  if (parsed) {
    const { keyword, values, color } = parsed;

    const zeroValues = values.map((v) => (v.unit ? `0${v.unit}` : '0'));

    const zeroColor = color.replace(/rgba?\([^)]+\)/gi, (match) => {
      if (match.toLowerCase().includes('rgba')) return 'rgba(0,0,0,0)';
      if (match.toLowerCase().includes('rgb')) return 'rgba(0,0,0,0)';
      return match;
    });

    return `${keyword}${zeroValues.join(' ')} ${zeroColor}`;
  }

  return '';
}
