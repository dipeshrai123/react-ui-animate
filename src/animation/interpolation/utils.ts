export const SWITCH_THRESHOLD = 0.01;

export const OPTIONAL_KEYWORDS = ['inset', 'normal', 'italic', 'bold', 'thin', 'medium', 'thick'];
export const TRANSFORM_KEYWORDS = ['translate', 'rotate', 'scale', 'skew', 'matrix', 'perspective'];

export const GRADIENT_RE = /^\s*(linear|radial|conic)-gradient\s*\(/i;
export const TOKEN_RE = /(\s+|[(),])/g;

export function formatNumber(val: number): string {
  const s = val.toFixed(3);
  return s.replace(/\.?0+$/, '');
}

export function hasListComma(str: string): boolean {
  if (!str.includes(',')) return false;
  if (!str.includes('(') && !str.includes(')')) return true;
  if (/\)\s*,/.test(str)) return true;

  let parenDepth = 0;
  for (let i = 0; i < str.length; i++) {
    if (str[i] === '(') parenDepth++;
    else if (str[i] === ')') parenDepth--;
    else if (str[i] === ',' && parenDepth === 0) return true;
  }
  return false;
}

export function splitByListCommas(str: string): string[] {
  if (!str.includes(',')) return [str];

  const result: string[] = [];
  let current = '';
  let parenDepth = 0;

  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (char === '(') {
      parenDepth++;
      current += char;
    } else if (char === ')') {
      parenDepth--;
      current += char;
    } else if (char === ',' && parenDepth === 0) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  if (current.trim()) {
    result.push(current.trim());
  }

  return result.length > 0 ? result : [str];
}
