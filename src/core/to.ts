import { AnimateValue } from './AnimateValue';

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

const numberRE = /-?\d+(\.\d+)?/g;
const HEX_RE = /^#(?:[0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const RGB_RE =
  /^rgba?\(\s*-?\d+(\.\d+)?%?(?:\s*,\s*-?\d+(\.\d+)?%?){2}(?:\s*,\s*(0|1|0?\.\d+))?\s*\)$/i;
const HSL_RE = /^hsl\(\s*\d+(\.\d+)?(?:\s*,\s*\d+(\.\d+)?%){2}\s*\)$/i;
const HSLA_RE =
  /^hsla\(\s*\d+(\.\d+)?(?:\s*,\s*\d+(\.\d+)?%){2}\s*,\s*(0|1|0?\.\d+)\s*\)$/i;

// Exported for testing
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
      if (
        r < 0 ||
        r > 100 ||
        g < 0 ||
        g > 100 ||
        b < 0 ||
        b > 100 ||
        a < 0 ||
        a > 1
      ) {
        return false;
      }
    } else {
      if (
        r < 0 ||
        r > 255 ||
        g < 0 ||
        g > 255 ||
        b < 0 ||
        b > 255 ||
        a < 0 ||
        a > 1
      ) {
        return false;
      }
    }
    return true;
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
      h >= 0 &&
      h <= 360 &&
      s >= 0 &&
      s <= 100 &&
      l >= 0 &&
      l <= 100 &&
      a >= 0 &&
      a <= 1
    );
  }

  return false;
}

// Exported for testing
export function parseCssColor(c: string): [number, number, number, number] {
  let color = c.trim().toLowerCase();
  if (namedColors[color]) color = namedColors[color];

  if (HEX_RE.test(color)) {
    let hex = color.slice(1);
    if (hex.length === 3)
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    else if (hex.length === 4)
      hex =
        hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
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

// Exported for testing
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

function interpolateString(fromStr: string, toStr: string, p: number): string {
  const funcRegex = /^([a-zA-Z$_][\w$]*)\((-?\d*\.?\d+)([a-zA-Z%]*)\)$/;
  const m1 = fromStr.match(funcRegex);
  const m2 = toStr.match(funcRegex);

  if (m1 && m2 && m1[1] === m2[1] && m1[3] === m2[3]) {
    const name = m1[1];
    const fromN = parseFloat(m1[2]);
    const toN = parseFloat(m2[2]);
    const unit = m1[3];
    const val = fromN + (toN - fromN) * p;
    return `${name}(${formatNumber(val)}${unit})`;
  }

  if (isCssColorLiteral(fromStr) && isCssColorLiteral(toStr)) {
    const c1 = parseCssColor(fromStr);
    const c2 = parseCssColor(toStr);
    const [r1, g1, b1, a1] = c1;
    const [r2, g2, b2, a2] = c2;
    const R = Math.round(r1 + (r2 - r1) * p);
    const G = Math.round(g1 + (g2 - g1) * p);
    const B = Math.round(b1 + (b2 - b1) * p);
    const A = a1 + (a2 - a1) * p;
    return A < 1
      ? `rgba(${R},${G},${B},${A.toFixed(3)})`
      : `rgb(${R},${G},${B})`;
  }

  const tokenRegex = /(\s+|[(),])/g;
  const fromParts = fromStr.split(tokenRegex).filter((s) => s !== '');
  const toParts = toStr.split(tokenRegex).filter((s) => s !== '');

  if (fromParts.length !== toParts.length) {
    throw new Error(
      `interpolate: template mismatch:\n  "${fromStr}"\n  vs "${toStr}"`
    );
  }

  const numUnitRE = /^(-?\d+(\.\d+)?)([a-zA-Z%]*)$/;
  const mappers = fromParts.map((fp, i) => {
    const tp = toParts[i];

    if (fp === tp && /\s+/.test(fp)) return () => fp;

    const n1 = fp.match(numUnitRE);
    const n2 = tp.match(numUnitRE);

    if (n1 && n2 && n1[3] === n2[3]) {
      const fromN = parseFloat(n1[1]);
      const toN = parseFloat(n2[1]);
      const unit = n1[3];

      return () => {
        const val = fromN + (toN - fromN) * p;
        return `${formatNumber(val)}${unit}`;
      };
    }

    if (isCssColorLiteral(fp) && isCssColorLiteral(tp)) {
      return () => interpolateString(fp, tp, p);
    }

    if (fp === tp) return () => fp;

    throw new Error(
      `interpolate: cannot interpolate tokens "${fp}" vs "${tp}"`
    );
  });

  return mappers.map((fn) => fn()).join('');
}

function formatNumber(val: number): string {
  let s = val.toFixed(3);
  return s.replace(/\.?0+$/, '');
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

