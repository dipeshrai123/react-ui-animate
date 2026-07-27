import type { AnimateValue } from '../values/AnimateValue';
import { isAnimateValue } from '../values/AnimateValue';

const UNIT_LESS = new Set([
  'borderImageOutset',
  'borderImageSlice',
  'borderImageWidth',
  'fontWeight',
  'lineHeight',
  'opacity',
  'orphans',
  'tabSize',
  'widows',
  'zIndex',
  'zoom',
  'fillOpacity',
  'floodOpacity',
  'stopOpacity',
  'strokeDasharray',
  'strokeDashoffset',
  'strokeMiterlimit',
  'strokeOpacity',
  'strokeWidth',
  'animationIterationCount',
  'boxFlex',
  'boxFlexGroup',
  'boxOrdinalGroup',
  'columnCount',
  'flex',
  'flexGrow',
  'flexPositive',
  'flexShrink',
  'flexNegative',
  'flexOrder',
  'gridRow',
  'gridColumn',
  'order',
  'lineClamp',
]);

export const transformKeys = [
  'translateX',
  'translateY',
  'translateZ',
  'rotate',
  'rotateX',
  'rotateY',
  'rotateZ',
  'scale',
  'scaleX',
  'scaleY',
  'skewX',
  'skewY',
  'perspective',
] as const;

// Namespaced pseudo-keys so `flip`/`flipId` transforms never overwrite a same-named
// transform the consumer animates via animate/hover/press/view/style; they compose instead.
export const FLIP_TRANSFORM_KEY_TO_CSS_FUNCTION = {
  __flipTranslateX: 'translateX',
  __flipTranslateY: 'translateY',
  __flipScaleX: 'scaleX',
  __flipScaleY: 'scaleY',
  __flipIdTranslateX: 'translateX',
  __flipIdTranslateY: 'translateY',
  __flipIdScaleX: 'scaleX',
  __flipIdScaleY: 'scaleY',
} as const;

export type FlipTransformKey = keyof typeof FLIP_TRANSFORM_KEY_TO_CSS_FUNCTION;

// Internal function - exported for testing only (not re-exported from main index)
export function applyStyleProp(el: HTMLElement, key: string, v: any) {
  const css =
    typeof v === 'number' && !UNIT_LESS.has(key) ? `${v}px` : String(v);
  (el.style as any)[key] = css;
}

function splitCSSValueAndUnit(raw: string) {
  const numMatch = raw.match(/-?\d+(\.\d+)?/)?.[0] ?? '0';
  const unitMatch =
    raw.match(/px|rem|em|ex|%|cm|mm|in|pt|pc|ch|vh|vw|vmin|vmax/)?.[0] ?? '';
  return { value: Number(numMatch), unit: unitMatch };
}

function defaultUnit(key: string) {
  if (key === 'perspective' || key.startsWith('translate')) return 'px';
  if (key.startsWith('rotate') || key.startsWith('skew')) return 'deg';
  return '';
}

function formatTransformFunction(key: string, raw: any) {
  const cssFunction =
    (FLIP_TRANSFORM_KEY_TO_CSS_FUNCTION as Record<string, string>)[key] ??
    key;

  const cur =
    raw && typeof (raw as AnimateValue<any>).subscribe === 'function'
      ? (raw as AnimateValue<any>).current
      : raw;

  if (Array.isArray(cur)) {
    return `${cssFunction}(${cur.join(',')})`;
  }

  const str = String(cur);

  const { value, unit: parsedUnit } = splitCSSValueAndUnit(str);
  const unit = parsedUnit || defaultUnit(cssFunction);
  return `${cssFunction}(${value}${unit})`;
}

// Internal function - exported for internal use only
export function isTransformKey(key: string) {
  return (
    transformKeys.includes(key as (typeof transformKeys)[number]) ||
    key in FLIP_TRANSFORM_KEY_TO_CSS_FUNCTION
  );
}

export function formatTransformString(txProps: Record<string, any>): string {
  const transformKeyList = Object.keys(txProps).filter(isTransformKey);
  if (transformKeyList.length > 0) {
    return transformKeyList
      .map((key) => formatTransformFunction(key, txProps[key]))
      .join(' ');
  }
  if (typeof txProps.transform === 'string') return txProps.transform;
  return '';
}

// Internal function - exported for testing only (not re-exported from main index)
export function applyTransformsStyle(
  node: HTMLElement,
  txProps: Record<string, any>
): (() => void)[] {
  const transformKeyList = Object.keys(txProps).filter(isTransformKey);
  const hasTransformKeys = transformKeyList.length > 0;

  const render = () => {
    if (hasTransformKeys) {
      const parts = transformKeyList.map((key) =>
        formatTransformFunction(key, txProps[key])
      );
      node.style.transform = parts.join(' ');
    } else if (typeof txProps.transform === 'string') {
      node.style.transform = txProps.transform;
    }
  };

  render();

  const unsubs: (() => void)[] = [];

  if (hasTransformKeys) {
    for (const key of transformKeyList) {
      const value = txProps[key];
      if (
        value &&
        typeof (value as AnimateValue<any>).subscribe === 'function'
      ) {
        unsubs.push((value as AnimateValue<any>).subscribe(render));
      }
    }
  }

  return unsubs;
}

function applyStyles(
  node: HTMLElement,
  style: Record<string, any>
): (() => void)[] {
  const subscriptions: (() => void)[] = [];

  for (const [key, value] of Object.entries(style)) {
    if (isAnimateValue(value)) {
      subscriptions.push(value.subscribe((v) => applyStyleProp(node, key, v)));
    } else {
      applyStyleProp(node, key, value);
    }
  }

  return subscriptions;
}

// setAttribute needs hyphenated SVG attribute names; passing camelCase silently no-ops.
const SVG_ATTRIBUTE_NAME_MAP: Record<string, string> = {
  alignmentBaseline: 'alignment-baseline',
  baselineShift: 'baseline-shift',
  clipPath: 'clip-path',
  clipRule: 'clip-rule',
  colorInterpolation: 'color-interpolation',
  colorInterpolationFilters: 'color-interpolation-filters',
  colorRendering: 'color-rendering',
  dominantBaseline: 'dominant-baseline',
  enableBackground: 'enable-background',
  fillOpacity: 'fill-opacity',
  fillRule: 'fill-rule',
  floodColor: 'flood-color',
  floodOpacity: 'flood-opacity',
  fontFamily: 'font-family',
  fontSize: 'font-size',
  fontSizeAdjust: 'font-size-adjust',
  fontStretch: 'font-stretch',
  fontStyle: 'font-style',
  fontVariant: 'font-variant',
  fontWeight: 'font-weight',
  glyphOrientationHorizontal: 'glyph-orientation-horizontal',
  glyphOrientationVertical: 'glyph-orientation-vertical',
  imageRendering: 'image-rendering',
  letterSpacing: 'letter-spacing',
  lightingColor: 'lighting-color',
  markerEnd: 'marker-end',
  markerMid: 'marker-mid',
  markerStart: 'marker-start',
  paintOrder: 'paint-order',
  pointerEvents: 'pointer-events',
  shapeRendering: 'shape-rendering',
  stopColor: 'stop-color',
  stopOpacity: 'stop-opacity',
  strokeDasharray: 'stroke-dasharray',
  strokeDashoffset: 'stroke-dashoffset',
  strokeLinecap: 'stroke-linecap',
  strokeLinejoin: 'stroke-linejoin',
  strokeMiterlimit: 'stroke-miterlimit',
  strokeOpacity: 'stroke-opacity',
  strokeWidth: 'stroke-width',
  textAnchor: 'text-anchor',
  textDecoration: 'text-decoration',
  textRendering: 'text-rendering',
  transformOrigin: 'transform-origin',
  underlinePosition: 'underline-position',
  underlineThickness: 'underline-thickness',
  unicodeBidi: 'unicode-bidi',
  wordSpacing: 'word-spacing',
  writingMode: 'writing-mode',
  className: 'class',
  htmlFor: 'for',
  xlinkHref: 'xlink:href',
};

function applyAttrs(
  node: HTMLElement,
  props: Record<string, any>
): (() => void)[] {
  const subscriptions: (() => void)[] = [];

  for (const [propKey, value] of Object.entries(props)) {
    const key = SVG_ATTRIBUTE_NAME_MAP[propKey] ?? propKey;
    const setBool = (v: boolean) => {
      if (v) node.setAttribute(key, '');
      else node.removeAttribute(key);
    };
    const setOther = (v: string | number) => {
      node.setAttribute(key, String(v));
    };

    if (isAnimateValue(value)) {
      subscriptions.push(
        value.subscribe((v) => {
          if (typeof v === 'boolean') setBool(v);
          else if (typeof v === 'string') setOther(v);
          else if (typeof v === 'number') setOther(v);
          else node.removeAttribute(key);
        })
      );
    } else {
      if (typeof value === 'boolean') setBool(value);
      else if (typeof value === 'string') setOther(value);
      else if (typeof value === 'number') setOther(value);
    }
  }

  return subscriptions;
}

function applyTransforms(
  elRef: HTMLElement,
  txProps: Record<string, any>
): (() => void)[] {
  return applyTransformsStyle(elRef, txProps);
}

export function createTransformRenderer(
  node: HTMLElement,
  animateValues: Record<string, AnimateValue<any>>
): () => void {
  return () => {
    const transformKeyList = Object.keys(animateValues).filter(isTransformKey);
    if (transformKeyList.length > 0) {
      const parts = transformKeyList.map((key) =>
        formatTransformFunction(key, animateValues[key])
      );
      node.style.transform = parts.join(' ');
    }
  };
}

export { applyStyles, applyAttrs, applyTransforms };
