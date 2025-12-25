import type { ExtrapolateConfig, ExtrapolateType } from '../types';

// ============================================================================
// Constants
// ============================================================================

const SWITCH_THRESHOLD = 0.01; // Threshold for switching between incompatible tokens

const OPTIONAL_KEYWORDS = ['inset', 'normal', 'italic', 'bold', 'thin', 'medium', 'thick'];
const TRANSFORM_KEYWORDS = ['translate', 'rotate', 'scale', 'skew', 'matrix', 'perspective'];

// Named CSS colors mapping - reduced to most commonly used colors
// Users can use hex/rgb/hsl for other colors
const namedColors: Record<string, string> = {
  // Basic colors
  transparent: '#00000000',
  black: '#000000ff',
  white: '#ffffffff',
  red: '#ff0000ff',
  green: '#008000ff',
  blue: '#0000ffff',
  yellow: '#ffff00ff',
  cyan: '#00ffffff',
  magenta: '#ff00ffff',
  // Common grays
  gray: '#808080ff',
  grey: '#808080ff',
  darkgray: '#a9a9a9ff',
  darkgrey: '#a9a9a9ff',
  lightgray: '#d3d3d3ff',
  lightgrey: '#d3d3d3ff',
  dimgray: '#696969ff',
  dimgrey: '#696969ff',
  slategray: '#708090ff',
  slategrey: '#708090ff',
  darkslategray: '#2f4f4fff',
  darkslategrey: '#2f4f4fff',
  // Common colors
  orange: '#ffa500ff',
  purple: '#800080ff',
  pink: '#ffc0cbff',
  brown: '#a52a2aff',
  navy: '#000080ff',
  teal: '#008080ff',
  silver: '#c0c0c0ff',
  gold: '#ffd700ff',
  // Aliases
  aqua: '#00ffffff',
  fuchsia: '#ff00ffff',
  lime: '#00ff00ff',
  maroon: '#800000ff',
  olive: '#808000ff',
  rebeccapurple: '#663399ff',
};

// Regex patterns
const numberRE = /-?\d+(\.\d+)?/g;
const HEX_RE = /^#(?:[0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const RGB_RE =
  /^rgba?\(\s*-?\d+(\.\d+)?%?(?:\s*,\s*-?\d+(\.\d+)?%?){2}(?:\s*,\s*(0|1|0?\.\d+))?\s*\)$/i;
const HSL_RE = /^hsl\(\s*\d+(\.\d+)?(?:\s*,\s*\d+(\.\d+)?%){2}\s*\)$/i;
const HSLA_RE =
  /^hsla\(\s*\d+(\.\d+)?(?:\s*,\s*\d+(\.\d+)?%){2}\s*,\s*(0|1|0?\.\d+)\s*\)$/i;
const GRADIENT_RE = /^\s*(linear|radial|conic)-gradient\s*\(/i;
const SIMPLE_FUNC_RE = /^([a-zA-Z$_][\w$]*)\((-?\d*\.?\d+)([a-zA-Z%]*)\)$/;
const NUM_UNIT_RE = /^(-?\d+(\.\d+)?)([a-zA-Z%]*)$/;
const TOKEN_RE = /(\s+|[(),])/g;

// ============================================================================
// Color Utilities
// ============================================================================

export function isCssColorLiteral(s: string): boolean {
  const c = s.trim().toLowerCase();

  if (HEX_RE.test(c) || namedColors[c] !== undefined) {
    return true;
  }

  if (RGB_RE.test(c)) {
    const percentage = c.includes('%');
    const nums = [...c.matchAll(numberRE)].map((m) => +m[0]);
    const [r, g, b, a = 1] = nums;

    if (percentage) {
      return r >= 0 && r <= 100 && g >= 0 && g <= 100 && b >= 0 && b <= 100 && a >= 0 && a <= 1;
    } else {
      return r >= 0 && r <= 255 && g >= 0 && g <= 255 && b >= 0 && b <= 255 && a >= 0 && a <= 1;
    }
  }

  if (HSL_RE.test(c)) {
    const nums = [...c.matchAll(numberRE)].map((m) => +m[0]);
    const [h, s, l] = nums;
    return h >= 0 && h <= 360 && s >= 0 && s <= 100 && l >= 0 && l <= 100;
  }

  if (HSLA_RE.test(c)) {
    const nums = [...c.matchAll(numberRE)].map((m) => +m[0]);
    const [h, s, l, a] = nums;
    return (
      h >= 0 && h <= 360 && s >= 0 && s <= 100 && l >= 0 && l <= 100 && a >= 0 && a <= 1
    );
  }

  return false;
}

export function parseCssColor(c: string): [number, number, number, number] {
  let color = c.trim().toLowerCase();
  if (namedColors[color]) color = namedColors[color];

  if (HEX_RE.test(color)) {
    let hex = color.slice(1);
    if (hex.length === 3)
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    else if (hex.length === 4)
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
    const hasA = hex.length === 8;
    const v = parseInt(hex, 16);
    const r = (v >> (hasA ? 24 : 16)) & 0xff;
    const g = (v >> (hasA ? 16 : 8)) & 0xff;
    const b = (v >> (hasA ? 8 : 0)) & 0xff;
    const a = hasA ? (v & 0xff) / 255 : 1;
    return [r, g, b, a];
  }

  if (RGB_RE.test(color)) {
    const percentage = color.includes('%');
    const nums = [...color.matchAll(numberRE)].map((m) => +m[0]);
    let [r, g, b, a = 1] = nums;

    if (percentage) {
      r = Math.round((r / 100) * 255);
      g = Math.round((g / 100) * 255);
      b = Math.round((b / 100) * 255);
    }

    return [r, g, b, a];
  }

  const hslaMatch = color.match(
    /hsla?\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)%\s*,\s*(\d+(?:\.\d+)?)%\s*(?:,\s*(\d+(?:\.\d+)?))?\s*\)/i
  );

  if (hslaMatch) {
    const h = parseFloat(hslaMatch[1]) % 360;
    const s = parseFloat(hslaMatch[2]) / 100;
    const l = parseFloat(hslaMatch[3]) / 100;
    const a = hslaMatch[4] !== undefined ? parseFloat(hslaMatch[4]) : 1;

    const [r, g, b] = hslToRgb(h, s, l);
    return [r, g, b, a];
  }

  throw new Error(`Unrecognized CSS color: ${c}`);
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const C = (1 - Math.abs(2 * l - 1)) * s;
  const X = C * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - C / 2;

  let r = 0,
    g = 0,
    b = 0;

  if (h >= 0 && h < 60) [r, g, b] = [C, X, 0];
  else if (h >= 60 && h < 120) [r, g, b] = [X, C, 0];
  else if (h >= 120 && h < 180) [r, g, b] = [0, C, X];
  else if (h >= 180 && h < 240) [r, g, b] = [0, X, C];
  else if (h >= 240 && h < 300) [r, g, b] = [X, 0, C];
  else if (h >= 300 && h < 360) [r, g, b] = [C, 0, X];

  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255),
  ];
}

export function replaceCssColorsWithRgba(input: string): string {
  const hex = `#(?:[0-9A-Fa-f]{3,4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})\\b`;
  const rgbFunc = `rgba?\\([^)]*\\)`;
  const hslFunc = `hsla?\\([^)]*\\)`;
  const named = Object.keys(namedColors)
    .map((n) => n.replace(/[-\\^$*+?.()|[\]{}]/g, '\\$&'))
    .join('|');
  const colorRe = new RegExp(
    `(${hex}|${rgbFunc}|${hslFunc}|\\b(?:${named})\\b)`,
    'gi'
  );

  return input.replace(colorRe, (match) => {
    try {
      const [r, g, b, a] = parseCssColor(match);
      const R = Math.round(r);
      const G = Math.round(g);
      const B = Math.round(b);
      const A = parseFloat(a.toFixed(3)).toString();
      return `rgba(${R},${G},${B},${A})`;
    } catch {
      return match;
    }
  });
}

// ============================================================================
// Interpolation Helpers
// ============================================================================

function formatNumber(val: number): string {
  let s = val.toFixed(3);
  return s.replace(/\.?0+$/, '');
}

function hasListComma(str: string): boolean {
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

function splitByListCommas(str: string): string[] {
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

function extractGradientContent(str: string): { type: string; content: string } | null {
  const match = str.match(GRADIENT_RE);
  if (!match) return null;

  const type = match[1].toLowerCase();
  const startIdx = match[0].length;
  let depth = 1;
  let endIdx = startIdx;

  for (let i = startIdx; i < str.length && depth > 0; i++) {
    if (str[i] === '(') depth++;
    else if (str[i] === ')') depth--;
    if (depth === 0) {
      endIdx = i;
      break;
    }
  }

  if (depth !== 0) return null;
  return { type, content: str.substring(startIdx, endIdx) };
}

function parseGradientParams(content: string): { firstParam: string; colorStops: string } {
  let parenDepth = 0;
  let firstCommaIdx = -1;

  for (let i = 0; i < content.length; i++) {
    if (content[i] === '(') parenDepth++;
    else if (content[i] === ')') parenDepth--;
    else if (content[i] === ',' && parenDepth === 0) {
      firstCommaIdx = i;
      break;
    }
  }

  if (firstCommaIdx === -1) {
    return { firstParam: '', colorStops: content.trim() };
  }

  return {
    firstParam: content.substring(0, firstCommaIdx).trim(),
    colorStops: content.substring(firstCommaIdx + 1).trim(),
  };
}

function isTransform(str: string): boolean {
  return TRANSFORM_KEYWORDS.some((keyword) => str.toLowerCase().includes(keyword));
}

function hasDifferentTransformFormats(fromStr: string, toStr: string): boolean {
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

function canSwitchFunctionNames(fromStr: string, toStr: string): boolean {
  const fromGradient = fromStr.match(GRADIENT_RE);
  const toGradient = toStr.match(GRADIENT_RE);
  if (fromGradient && toGradient) return true;
  return hasDifferentTransformFormats(fromStr, toStr);
}

// ============================================================================
// Special Case Interpolators
// ============================================================================

function interpolateCommaSeparatedList(fromStr: string, toStr: string, p: number): string {
  const fromList = splitByListCommas(fromStr);
  const toList = splitByListCommas(toStr);
  const maxLen = Math.max(fromList.length, toList.length);
  const result: string[] = [];

  for (let i = 0; i < maxLen; i++) {
    const fromItem = fromList[i] || fromList[fromList.length - 1] || fromList[0];
    const toItem = toList[i] || toList[toList.length - 1] || toList[0];
    result.push(interpolateString(fromItem, toItem, p));
  }

  return result.join(', ');
}

function convertRgbToRgba(str: string): string {
  // Convert rgb() to rgba() format for gradient color stops
  return str.replace(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/g, 'rgba($1,$2,$3,1.000)');
}

function interpolateGradients(
  fromGradient: { type: string; content: string },
  toGradient: { type: string; content: string },
  p: number
): string {
  const gradientType = p < SWITCH_THRESHOLD ? fromGradient.type : toGradient.type;
  const fromParams = parseGradientParams(fromGradient.content);
  const toParams = parseGradientParams(toGradient.content);

  let firstParam: string;
  if (fromGradient.type === toGradient.type) {
    if (fromParams.firstParam && toParams.firstParam) {
      try {
        firstParam = interpolateString(fromParams.firstParam, toParams.firstParam, p);
      } catch {
        firstParam = p < SWITCH_THRESHOLD ? fromParams.firstParam : toParams.firstParam;
      }
    } else {
      firstParam = p < SWITCH_THRESHOLD ? fromParams.firstParam : toParams.firstParam;
    }
  } else {
    firstParam = p < SWITCH_THRESHOLD ? fromParams.firstParam : toParams.firstParam;
  }

  const colorStops = interpolateString(fromParams.colorStops, toParams.colorStops, p);
  // Convert any rgb() colors to rgba() format in gradients to ensure consistency
  const normalizedColorStops = convertRgbToRgba(colorStops);
  const content = firstParam ? `${firstParam}, ${normalizedColorStops}` : normalizedColorStops;
  return `${gradientType}-gradient(${content})`;
}

function interpolateWithFunctionNameSwitch(fromStr: string, toStr: string, p: number): string {
  const fromGradient = extractGradientContent(fromStr);
  const toGradient = extractGradientContent(toStr);

  if (fromGradient && toGradient) {
    return interpolateGradients(fromGradient, toGradient, p);
  }

  if (fromGradient || toGradient) {
    return p < SWITCH_THRESHOLD ? fromStr : toStr;
  }

  if (hasDifferentTransformFormats(fromStr, toStr)) {
    return p < SWITCH_THRESHOLD ? fromStr : toStr;
  }

  return p < SWITCH_THRESHOLD ? fromStr : toStr;
}

// ============================================================================
// Main Interpolation Function
// ============================================================================

function parseBoxShadow(shadow: string): { keyword: string; values: Array<{ num: string; unit: string }>; color: string } | null {
  // Match box-shadow/text-shadow pattern: [keyword]? offsetX offsetY blur [spread]? color
  // Handles both 3-value (offsetX offsetY blur color) and 4-value (offsetX offsetY blur spread color) formats
  const shadowMatch = shadow.match(/^(\S+\s+)?(-?\d+(?:\.\d+)?)(px|rem|em|%|cm|mm|in|pt|pc|ch|vh|vw|vmin|vmax)?\s+(-?\d+(?:\.\d+)?)(px|rem|em|%|cm|mm|in|pt|pc|ch|vh|vw|vmin|vmax)?\s+(-?\d+(?:\.\d+)?)(px|rem|em|%|cm|mm|in|pt|pc|ch|vh|vw|vmin|vmax)?(?:\s+(-?\d+(?:\.\d+)?)(px|rem|em|%|cm|mm|in|pt|pc|ch|vh|vw|vmin|vmax)?)?\s+(.+)$/);
  if (shadowMatch) {
    const keyword = shadowMatch[1] || '';
    const values: Array<{ num: string; unit: string }> = [];
    
    // offsetX
    if (shadowMatch[2]) {
      values.push({ num: shadowMatch[2], unit: shadowMatch[3] || '' });
    }
    // offsetY
    if (shadowMatch[4]) {
      values.push({ num: shadowMatch[4], unit: shadowMatch[5] || '' });
    }
    // blur
    if (shadowMatch[6]) {
      values.push({ num: shadowMatch[6], unit: shadowMatch[7] || '' });
    }
    // spread (optional)
    if (shadowMatch[8]) {
      values.push({ num: shadowMatch[8], unit: shadowMatch[9] || '' });
    }
    
    const color = shadowMatch[10];
    return { keyword, values, color };
  }
  return null;
}

function createZeroValueFromTarget(target: string): string {
  // Try to create a zero-value version of the target structure
  // For box-shadow/text-shadow: "0 4px 12px rgba(0,0,0,0.3)" -> "0 0px 0px rgba(0,0,0,0)"
  // Must preserve the exact unit structure (including no unit for first value)
  
  const parsed = parseBoxShadow(target);
  if (parsed) {
    const { keyword, values, color } = parsed;
    
    // Create zero-value version preserving exact unit structure
    const zeroValues = values.map(v => {
      // Use "0" (no unit) if original had no unit, otherwise use "0" + unit
      return v.unit ? `0${v.unit}` : '0';
    });
    
    // Create zero-value version with transparent color
    const zeroColor = color.replace(/rgba?\([^)]+\)/gi, (match) => {
      if (match.toLowerCase().includes('rgba')) {
        return 'rgba(0,0,0,0)';
      } else if (match.toLowerCase().includes('rgb')) {
        return 'rgba(0,0,0,0)';
      }
      return match;
    });
    
    return `${keyword}${zeroValues.join(' ')} ${zeroColor}`;
  }
  
  // If we can't create a zero version, return empty string
  return '';
}

function interpolateString(fromStr: string, toStr: string, p: number): string {
  // Handle empty string interpolation - create a zero-value version
  if (!fromStr || fromStr.trim() === '') {
    const zeroFrom = createZeroValueFromTarget(toStr);
    if (zeroFrom) {
      return interpolateString(zeroFrom, toStr, p);
    }
    
    // For other empty string cases, just return the target when p >= threshold
    if (p >= SWITCH_THRESHOLD) {
      return toStr;
    }
    return fromStr || '';
  }
  
  // Handle reverse case: animating from a value back to empty string
  if (!toStr || toStr.trim() === '') {
    // When animating back to empty, interpolate to zero version first, then to empty
    const zeroTo = createZeroValueFromTarget(fromStr);
    if (zeroTo) {
      // Interpolate from current value to zero version
      const zeroResult = interpolateString(fromStr, zeroTo, Math.min(p * 2, 1));
      // Once past halfway, start fading to empty
      if (p >= 0.5) {
        const emptyProgress = (p - 0.5) * 2; // 0 to 1 from 0.5 to 1.0
        // Fade the zero version to empty by checking if values are close to zero
        const zeroMatch = zeroResult.match(/^(\S+\s+)?(-?\d+(?:\.\d+)?)(px|rem|em|%|cm|mm|in|pt|pc|ch|vh|vw|vmin|vmax)?\s+(-?\d+(?:\.\d+)?)(px|rem|em|%|cm|mm|in|pt|pc|ch|vh|vw|vmin|vmax)?\s+(-?\d+(?:\.\d+)?)(px|rem|em|%|cm|mm|in|pt|pc|ch|vh|vw|vmin|vmax)?\s+(.+)$/);
        if (zeroMatch) {
          const x = Math.abs(parseFloat(zeroMatch[2]));
          const y = Math.abs(parseFloat(zeroMatch[4]));
          const z = Math.abs(parseFloat(zeroMatch[6]));
          const colorMatch = zeroMatch[8].match(/rgba?\((\d+),\s*(\d+),\s*(\d+),\s*([-\d.]+)\)/);
          const alpha = colorMatch ? Math.abs(parseFloat(colorMatch[4])) : 0;
          
          // If all values are close to zero and progress is high, return empty
          if (x < 0.01 && y < 0.01 && z < 0.01 && alpha < 0.01 && emptyProgress > 0.9) {
            return '';
          }
        }
        return zeroResult;
      }
      return zeroResult;
    }
    
    // For other empty string cases, just return the from value when p < threshold
    if (p < SWITCH_THRESHOLD) {
      return fromStr;
    }
    return toStr || '';
  }
  
  // Simple function interpolation (e.g., translateX(0px) -> translateX(100px))
  const m1 = fromStr.match(SIMPLE_FUNC_RE);
  const m2 = toStr.match(SIMPLE_FUNC_RE);
  if (m1 && m2 && m1[1] === m2[1] && m1[3] === m2[3]) {
    const val = parseFloat(m1[2]) + (parseFloat(m2[2]) - parseFloat(m1[2])) * p;
    return `${m1[1]}(${formatNumber(val)}${m1[3]})`;
  }

  // Color interpolation
  if (isCssColorLiteral(fromStr) && isCssColorLiteral(toStr)) {
    const [r1, g1, b1, a1] = parseCssColor(fromStr);
    const [r2, g2, b2, a2] = parseCssColor(toStr);
    const R = Math.round(r1 + (r2 - r1) * p);
    const G = Math.round(g1 + (g2 - g1) * p);
    const B = Math.round(b1 + (b2 - b1) * p);
    const A = a1 + (a2 - a1) * p;
    // Format alpha to remove trailing zeros (e.g., 0.250 -> 0.25, 0.5 -> 0.5)
    const formattedAlpha = formatNumber(A);
    return A < 1 ? `rgba(${R},${G},${B},${formattedAlpha})` : `rgb(${R},${G},${B})`;
  }

  // Gradient interpolation
  const fromGradient = fromStr.trim().match(GRADIENT_RE);
  const toGradient = toStr.trim().match(GRADIENT_RE);
  if (fromGradient || toGradient) {
    return interpolateWithFunctionNameSwitch(fromStr.trim(), toStr.trim(), p);
  }

  // Transform format differences
  if (hasDifferentTransformFormats(fromStr, toStr)) {
    return interpolateWithFunctionNameSwitch(fromStr, toStr, p);
  }

  // Comma-separated lists (multiple shadows, etc.)
  if ((fromStr.includes(',') || toStr.includes(',')) && (hasListComma(fromStr) || hasListComma(toStr))) {
    return interpolateCommaSeparatedList(fromStr, toStr, p);
  }

  // Optional leading keywords (e.g., "inset" in box-shadow)
  const fromWords = fromStr.trim().split(/\s+/);
  const toWords = toStr.trim().split(/\s+/);
  const fromFirstWord = fromWords[0]?.toLowerCase();
  const toFirstWord = toWords[0]?.toLowerCase();
  const fromHasKeyword = fromFirstWord && OPTIONAL_KEYWORDS.includes(fromFirstWord);
  const toHasKeyword = toFirstWord && OPTIONAL_KEYWORDS.includes(toFirstWord);

  if (fromHasKeyword || toHasKeyword) {
    const keyword = p < SWITCH_THRESHOLD
      ? (fromHasKeyword ? fromFirstWord : '')
      : (toHasKeyword ? toFirstWord : '');
    const fromRest = fromHasKeyword ? fromWords.slice(1).join(' ') : fromStr;
    const toRest = toHasKeyword ? toWords.slice(1).join(' ') : toStr;
    const rest = interpolateString(fromRest, toRest, p);
    return keyword ? `${keyword} ${rest}` : rest;
  }

  // Special handling for box-shadow/text-shadow with different number of values
  // box-shadow can be: offsetX offsetY blur color (3 values) or offsetX offsetY blur spread color (4 values)
  const fromShadow = parseBoxShadow(fromStr);
  const toShadow = parseBoxShadow(toStr);
  if (fromShadow && toShadow) {
    // Normalize both to the same number of values (use the maximum)
    const maxValues = Math.max(fromShadow.values.length, toShadow.values.length);
    
    const normalizeShadow = (shadow: ReturnType<typeof parseBoxShadow>, targetLength: number) => {
      if (!shadow) return null;
      const { keyword, values, color } = shadow;
      // If we need to add values, add spread: 0 if missing (only if target is 4 and we have 3)
      if (values.length === 3 && targetLength === 4) {
        // Determine unit for spread (use same as blur, or default to px)
        const blurUnit = values[2].unit || 'px';
        return { keyword, values: [...values, { num: '0', unit: blurUnit }], color };
      }
      return { keyword, values, color };
    };

    const normalizedFrom = normalizeShadow(fromShadow, maxValues);
    const normalizedTo = normalizeShadow(toShadow, maxValues);
    
    if (normalizedFrom && normalizedTo) {
      // Interpolate each value
      const interpolatedValues = normalizedFrom.values.map((fromVal, i) => {
        const toVal = normalizedTo.values[i];
        if (!toVal) return fromVal;
        
        // If units match, interpolate the numbers
        if (fromVal.unit === toVal.unit) {
          const fromNum = parseFloat(fromVal.num);
          const toNum = parseFloat(toVal.num);
          const interpolated = fromNum + (toNum - fromNum) * p;
          return { num: formatNumber(interpolated), unit: fromVal.unit };
        }
        // If units don't match, switch at threshold
        return p < SWITCH_THRESHOLD ? fromVal : toVal;
      });
      
      // Interpolate color
      let interpolatedColor = normalizedFrom.color;
      if (normalizedFrom.color !== normalizedTo.color) {
        try {
          interpolatedColor = interpolateString(normalizedFrom.color, normalizedTo.color, p);
        } catch {
          interpolatedColor = p < SWITCH_THRESHOLD ? normalizedFrom.color : normalizedTo.color;
        }
      }
      
      // Build the result - only include spread if both had it or we normalized to 4
      const keyword = p < SWITCH_THRESHOLD 
        ? (normalizedFrom.keyword || normalizedTo.keyword)
        : (normalizedTo.keyword || normalizedFrom.keyword);
      
      // If both original shadows had 3 values, output 3 values (remove spread if it was added)
      // If one had 3 and one had 4, output 4 values (with the interpolated spread)
      const shouldIncludeSpread = maxValues === 4;
      const valuesToOutput = shouldIncludeSpread 
        ? interpolatedValues 
        : interpolatedValues.slice(0, 3);
      
      const valuesStr = valuesToOutput.map(v => v.unit ? `${v.num}${v.unit}` : v.num).join(' ');
      return `${keyword}${valuesStr} ${interpolatedColor}`;
    }
  }

  // Token-based interpolation
  const fromParts = fromStr.split(TOKEN_RE).filter((s) => s !== '');
  const toParts = toStr.split(TOKEN_RE).filter((s) => s !== '');

  if (fromParts.length !== toParts.length) {
    if (canSwitchFunctionNames(fromStr, toStr)) {
      return interpolateWithFunctionNameSwitch(fromStr, toStr, p);
    }
    throw new Error(`interpolate: template mismatch:\n  "${fromStr}"\n  vs "${toStr}"`);
  }

  const mappers = fromParts.map((fp, i) => {
    const tp = toParts[i];

    if (fp === tp && /\s+/.test(fp)) return () => fp;

    const n1 = fp.match(NUM_UNIT_RE);
    const n2 = tp.match(NUM_UNIT_RE);
    if (n1 && n2 && n1[3] === n2[3]) {
      const val = parseFloat(n1[1]) + (parseFloat(n2[1]) - parseFloat(n1[1])) * p;
      return () => `${formatNumber(val)}${n1[3]}`;
    }

    if (isCssColorLiteral(fp) && isCssColorLiteral(tp)) {
      return () => interpolateString(fp, tp, p);
    }

    if (fp === tp) return () => fp;

    // CSS keyword switching (e.g., "solid" vs "dashed")
    const isSimpleWord = /^[a-zA-Z-]+$/.test(fp) && /^[a-zA-Z-]+$/.test(tp);
    if (isSimpleWord) {
      const isFunctionName =
        (i + 1 < fromParts.length && fromParts[i + 1] === '(') ||
        (i + 1 < toParts.length && toParts[i + 1] === '(');
      if (!isFunctionName) {
        return () => (p < SWITCH_THRESHOLD ? fp : tp);
      }
    }

    throw new Error(`interpolate: cannot interpolate tokens "${fp}" vs "${tp}"`);
  });

  return mappers.map((fn) => fn()).join('');
}

// ============================================================================
// Public API
// ============================================================================

export function to(
  inRange: number[],
  outRange: (number | string)[],
  config?: ExtrapolateConfig
): (t: number) => number | string {
  const len = inRange.length;
  if (len < 2 || outRange.length !== len) {
    throw new Error(
      'interpolate: inRange and outRange must be arrays of the same length >= 2'
    );
  }

  const extrapolateLeft: ExtrapolateType =
    config?.extrapolateLeft ?? config?.extrapolate ?? 'extend';
  const extrapolateRight: ExtrapolateType =
    config?.extrapolateRight ?? config?.extrapolate ?? 'extend';

  const sanitizedOut = outRange.map((v) =>
    typeof v === 'string' ? replaceCssColorsWithRgba(v) : v
  );

  return (tRaw: number): number | string => {
    let t = tRaw;
    if (tRaw < inRange[0] && extrapolateLeft === 'clamp') {
      t = inRange[0];
    } else if (tRaw > inRange[len - 1] && extrapolateRight === 'clamp') {
      t = inRange[len - 1];
    }

    let i = 0;
    if (t <= inRange[0]) {
      i = 0;
    } else if (t >= inRange[len - 1]) {
      i = len - 2;
    } else {
      for (let j = 0; j < len - 1; j++) {
        if (t >= inRange[j] && t <= inRange[j + 1]) {
          i = j;
          break;
        }
      }
    }

    const t0 = inRange[i];
    const t1 = inRange[i + 1];
    let p = (t - t0) / (t1 - t0);

    if (config?.easing) p = config.easing(p);

    const fromOut = sanitizedOut[i];
    const toOut = sanitizedOut[i + 1];

    if (typeof fromOut === 'number' && typeof toOut === 'number') {
      return fromOut + (toOut - fromOut) * p;
    }

    return interpolateString(String(fromOut), String(toOut), p);
  };
}

// combine function moved to utils/combine.ts to avoid circular dependency
