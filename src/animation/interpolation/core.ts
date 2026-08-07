import { isCssColorLiteral, parseCssColor } from './colors';
import { canSwitchFunctionNames, hasDifferentTransformFormats } from './transforms';
import { createZeroValueFromTarget, parseBoxShadow } from './shadows';
import {
  GRADIENT_RE,
  OPTIONAL_KEYWORDS,
  SWITCH_THRESHOLD,
  TOKEN_RE,
  formatNumber,
  hasListComma,
  splitByListCommas,
} from './utils';

const SIMPLE_FUNC_RE = /^([a-zA-Z$_][\w$]*)\((-?\d*\.?\d+)([a-zA-Z%]*)\)$/;
const NUM_UNIT_RE = /^(-?\d+(\.\d+)?)([a-zA-Z%]*)$/;

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

function convertRgbToRgba(str: string): string {
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

  return p < SWITCH_THRESHOLD ? fromStr : toStr;
}

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

export function interpolateString(fromStr: string, toStr: string, p: number): string {
  if (!fromStr || fromStr.trim() === '') {
    const zeroFrom = createZeroValueFromTarget(toStr);
    if (zeroFrom) {
      return interpolateString(zeroFrom, toStr, p);
    }

    if (p >= SWITCH_THRESHOLD) {
      return toStr;
    }
    return fromStr || '';
  }

  // Fades through a zero-value version rather than switching abruptly at the threshold.
  if (!toStr || toStr.trim() === '') {
    const zeroTo = createZeroValueFromTarget(fromStr);
    if (zeroTo) {
      const zeroResult = interpolateString(fromStr, zeroTo, Math.min(p * 2, 1));
      if (p >= 0.5) {
        const emptyProgress = (p - 0.5) * 2;
        const zeroMatch = zeroResult.match(/^(\S+\s+)?(-?\d+(?:\.\d+)?)(px|rem|em|%|cm|mm|in|pt|pc|ch|vh|vw|vmin|vmax)?\s+(-?\d+(?:\.\d+)?)(px|rem|em|%|cm|mm|in|pt|pc|ch|vh|vw|vmin|vmax)?\s+(-?\d+(?:\.\d+)?)(px|rem|em|%|cm|mm|in|pt|pc|ch|vh|vw|vmin|vmax)?\s+(.+)$/);
        if (zeroMatch) {
          const x = Math.abs(parseFloat(zeroMatch[2]));
          const y = Math.abs(parseFloat(zeroMatch[4]));
          const z = Math.abs(parseFloat(zeroMatch[6]));
          const colorMatch = zeroMatch[8].match(/rgba?\((\d+),\s*(\d+),\s*(\d+),\s*([-\d.]+)\)/);
          const alpha = colorMatch ? Math.abs(parseFloat(colorMatch[4])) : 0;

          if (x < 0.01 && y < 0.01 && z < 0.01 && alpha < 0.01 && emptyProgress > 0.9) {
            return '';
          }
        }
        return zeroResult;
      }
      return zeroResult;
    }

    if (p < SWITCH_THRESHOLD) {
      return fromStr;
    }
    return toStr || '';
  }

  const m1 = fromStr.match(SIMPLE_FUNC_RE);
  const m2 = toStr.match(SIMPLE_FUNC_RE);
  if (m1 && m2 && m1[1] === m2[1] && m1[3] === m2[3]) {
    const val = parseFloat(m1[2]) + (parseFloat(m2[2]) - parseFloat(m1[2])) * p;
    return `${m1[1]}(${formatNumber(val)}${m1[3]})`;
  }

  if (isCssColorLiteral(fromStr) && isCssColorLiteral(toStr)) {
    const [r1, g1, b1, a1] = parseCssColor(fromStr);
    const [r2, g2, b2, a2] = parseCssColor(toStr);
    const R = Math.round(r1 + (r2 - r1) * p);
    const G = Math.round(g1 + (g2 - g1) * p);
    const B = Math.round(b1 + (b2 - b1) * p);
    const A = a1 + (a2 - a1) * p;
    const formattedAlpha = formatNumber(A);
    return A < 1 ? `rgba(${R},${G},${B},${formattedAlpha})` : `rgb(${R},${G},${B})`;
  }

  const fromGradient = fromStr.trim().match(GRADIENT_RE);
  const toGradient = toStr.trim().match(GRADIENT_RE);
  if (fromGradient || toGradient) {
    return interpolateWithFunctionNameSwitch(fromStr.trim(), toStr.trim(), p);
  }

  if (hasDifferentTransformFormats(fromStr, toStr)) {
    return interpolateWithFunctionNameSwitch(fromStr, toStr, p);
  }

  if ((fromStr.includes(',') || toStr.includes(',')) && (hasListComma(fromStr) || hasListComma(toStr))) {
    return interpolateCommaSeparatedList(fromStr, toStr, p);
  }

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

  // Normalizes 3-value/4-value (spread) shadows to the max count before interpolating.
  const fromShadow = parseBoxShadow(fromStr);
  const toShadow = parseBoxShadow(toStr);
  if (fromShadow && toShadow) {
    const maxValues = Math.max(fromShadow.values.length, toShadow.values.length);

    const normalizeShadow = (shadow: ReturnType<typeof parseBoxShadow>, targetLength: number) => {
      if (!shadow) return null;
      const { keyword, values, color } = shadow;
      if (values.length === 3 && targetLength === 4) {
        const blurUnit = values[2].unit || 'px';
        return { keyword, values: [...values, { num: '0', unit: blurUnit }], color };
      }
      return { keyword, values, color };
    };

    const normalizedFrom = normalizeShadow(fromShadow, maxValues);
    const normalizedTo = normalizeShadow(toShadow, maxValues);

    if (normalizedFrom && normalizedTo) {
      const interpolatedValues = normalizedFrom.values.map((fromVal, i) => {
        const toVal = normalizedTo.values[i];
        if (!toVal) return fromVal;

        if (fromVal.unit === toVal.unit) {
          const fromNum = parseFloat(fromVal.num);
          const toNum = parseFloat(toVal.num);
          const interpolated = fromNum + (toNum - fromNum) * p;
          return { num: formatNumber(interpolated), unit: fromVal.unit };
        }
        return p < SWITCH_THRESHOLD ? fromVal : toVal;
      });

      let interpolatedColor = normalizedFrom.color;
      if (normalizedFrom.color !== normalizedTo.color) {
        try {
          interpolatedColor = interpolateString(normalizedFrom.color, normalizedTo.color, p);
        } catch {
          interpolatedColor = p < SWITCH_THRESHOLD ? normalizedFrom.color : normalizedTo.color;
        }
      }

      const keyword = p < SWITCH_THRESHOLD
        ? (normalizedFrom.keyword || normalizedTo.keyword)
        : (normalizedTo.keyword || normalizedFrom.keyword);

      // Don't leak the zero-padding added above into the output.
      const shouldIncludeSpread = maxValues === 4;
      const valuesToOutput = shouldIncludeSpread
        ? interpolatedValues
        : interpolatedValues.slice(0, 3);

      const valuesStr = valuesToOutput.map((v) => (v.unit ? `${v.num}${v.unit}` : v.num)).join(' ');
      return `${keyword}${valuesStr} ${interpolatedColor}`;
    }
  }

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
