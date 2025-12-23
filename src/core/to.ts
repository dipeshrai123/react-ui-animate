import { AnimateValue } from './AnimateValue';

// ============================================================================
// Constants
// ============================================================================

const SWITCH_THRESHOLD = 0.01; // Threshold for switching between incompatible tokens

const OPTIONAL_KEYWORDS = ['inset', 'normal', 'italic', 'bold', 'thin', 'medium', 'thick'];
const TRANSFORM_KEYWORDS = ['translate', 'rotate', 'scale', 'skew', 'matrix', 'perspective'];

// Named CSS colors mapping
const namedColors: Record<string, string> = {
  transparent: '#00000000',
  aliceblue: '#f0f8ffff',
  antiquewhite: '#faebd7ff',
  aqua: '#00ffffff',
  aquamarine: '#7fffd4ff',
  azure: '#f0ffffff',
  beige: '#f5f5dcff',
  bisque: '#ffe4c4ff',
  black: '#000000ff',
  blanchedalmond: '#ffebcdff',
  blue: '#0000ffff',
  blueviolet: '#8a2be2ff',
  brown: '#a52a2aff',
  burlywood: '#deb887ff',
  burntsienna: '#ea7e5dff',
  cadetblue: '#5f9ea0ff',
  chartreuse: '#7fff00ff',
  chocolate: '#d2691eff',
  coral: '#ff7f50ff',
  cornflowerblue: '#6495edff',
  cornsilk: '#fff8dcff',
  crimson: '#dc143cff',
  cyan: '#00ffffff',
  darkblue: '#00008bff',
  darkcyan: '#008b8bff',
  darkgoldenrod: '#b8860bff',
  darkgray: '#a9a9a9ff',
  darkgreen: '#006400ff',
  darkgrey: '#a9a9a9ff',
  darkkhaki: '#bdb76bff',
  darkmagenta: '#8b008bff',
  darkolivegreen: '#556b2fff',
  darkorange: '#ff8c00ff',
  darkorchid: '#9932ccff',
  darkred: '#8b0000ff',
  darksalmon: '#e9967aff',
  darkseagreen: '#8fbc8fff',
  darkslateblue: '#483d8bff',
  darkslategray: '#2f4f4fff',
  darkslategrey: '#2f4f4fff',
  darkturquoise: '#00ced1ff',
  darkviolet: '#9400d3ff',
  deeppink: '#ff1493ff',
  deepskyblue: '#00bfffff',
  dimgray: '#696969ff',
  dimgrey: '#696969ff',
  dodgerblue: '#1e90ffff',
  firebrick: '#b22222ff',
  floralwhite: '#fffaf0ff',
  forestgreen: '#228b22ff',
  fuchsia: '#ff00ffff',
  gainsboro: '#dcdcdcff',
  ghostwhite: '#f8f8ffff',
  gold: '#ffd700ff',
  goldenrod: '#daa520ff',
  gray: '#808080ff',
  green: '#008000ff',
  greenyellow: '#adff2fff',
  grey: '#808080ff',
  honeydew: '#f0fff0ff',
  hotpink: '#ff69b4ff',
  indianred: '#cd5c5cff',
  indigo: '#4b0082ff',
  ivory: '#fffff0ff',
  khaki: '#f0e68cff',
  lavender: '#e6e6faff',
  lavenderblush: '#fff0f5ff',
  lawngreen: '#7cfc00ff',
  lemonchiffon: '#fffacdff',
  lightblue: '#add8e6ff',
  lightcoral: '#f08080ff',
  lightcyan: '#e0ffffff',
  lightgoldenrodyellow: '#fafad2ff',
  lightgray: '#d3d3d3ff',
  lightgreen: '#90ee90ff',
  lightgrey: '#d3d3d3ff',
  lightpink: '#ffb6c1ff',
  lightsalmon: '#ffa07aff',
  lightseagreen: '#20b2aaff',
  lightskyblue: '#87cefaff',
  lightslategray: '#778899ff',
  lightslategrey: '#778899ff',
  lightsteelblue: '#b0c4deff',
  lightyellow: '#ffffe0ff',
  lime: '#00ff00ff',
  limegreen: '#32cd32ff',
  linen: '#faf0e6ff',
  magenta: '#ff00ffff',
  maroon: '#800000ff',
  mediumaquamarine: '#66cdaaff',
  mediumblue: '#0000cdff',
  mediumorchid: '#ba55d3ff',
  mediumpurple: '#9370dbff',
  mediumseagreen: '#3cb371ff',
  mediumslateblue: '#7b68eeff',
  mediumspringgreen: '#00fa9aff',
  mediumturquoise: '#48d1ccff',
  mediumvioletred: '#c71585ff',
  midnightblue: '#191970ff',
  mintcream: '#f5fffaff',
  mistyrose: '#ffe4e1ff',
  moccasin: '#ffe4b5ff',
  navajowhite: '#ffdeadff',
  navy: '#000080ff',
  oldlace: '#fdf5e6ff',
  olive: '#808000ff',
  olivedrab: '#6b8e23ff',
  orange: '#ffa500ff',
  orangered: '#ff4500ff',
  orchid: '#da70d6ff',
  palegoldenrod: '#eee8aaff',
  palegreen: '#98fb98ff',
  paleturquoise: '#afeeeeff',
  palevioletred: '#db7093ff',
  papayawhip: '#ffefd5ff',
  peachpuff: '#ffdab9ff',
  peru: '#cd853fff',
  pink: '#ffc0cbff',
  plum: '#dda0ddff',
  powderblue: '#b0e0e6ff',
  purple: '#800080ff',
  rebeccapurple: '#663399ff',
  red: '#ff0000ff',
  rosybrown: '#bc8f8fff',
  royalblue: '#4169e1ff',
  saddlebrown: '#8b4513ff',
  salmon: '#fa8072ff',
  sandybrown: '#f4a460ff',
  seagreen: '#2e8b57ff',
  seashell: '#fff5eeff',
  sienna: '#a0522dff',
  silver: '#c0c0c0ff',
  skyblue: '#87ceebff',
  slateblue: '#6a5acdff',
  slategray: '#708090ff',
  slategrey: '#708090ff',
  snow: '#fffafaff',
  springgreen: '#00ff7fff',
  steelblue: '#4682b4ff',
  tan: '#d2b48cff',
  teal: '#008080ff',
  thistle: '#d8bfd8ff',
  tomato: '#ff6347ff',
  turquoise: '#40e0d0ff',
  violet: '#ee82eeff',
  wheat: '#f5deb3ff',
  white: '#ffffffff',
  whitesmoke: '#f5f5f5ff',
  yellow: '#ffff00ff',
  yellowgreen: '#9acd32ff',
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

function interpolateString(fromStr: string, toStr: string, p: number): string {
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
    return A < 1 ? `rgba(${R},${G},${B},${A.toFixed(3)})` : `rgb(${R},${G},${B})`;
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

type ExtrapolateType = 'identity' | 'extend' | 'clamp';

export interface ExtrapolateConfig {
  extrapolate?: ExtrapolateType;
  extrapolateRight?: ExtrapolateType;
  extrapolateLeft?: ExtrapolateType;
  easing?: (t: number) => number;
}

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

export function combine<T extends any[], U>(
  inputs: { [K in keyof T]: AnimateValue<T[K]> },
  combiner: (...values: T) => U
): AnimateValue<U> {
  const initial = inputs.map((value) => value.current) as T;
  const output = new AnimateValue<U>(combiner(...initial));

  const update = () => {
    const values = inputs.map((value) => value.current) as T;
    output.set(combiner(...values));
  };

  inputs.forEach((value) => value.subscribe(() => update()));

  return output;
}
