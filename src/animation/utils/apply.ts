import type { AnimateValue } from '../values/AnimateValue';
import { isAnimateValue } from '../values/AnimateValue';

// Unitless CSS properties that don't need 'px' suffix
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

// Exported for testing
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
  const cur =
    raw && typeof (raw as AnimateValue<any>).subscribe === 'function'
      ? (raw as AnimateValue<any>).current
      : raw;

  if (Array.isArray(cur)) {
    return `${key}(${cur.join(',')})`;
  }

  const str = String(cur);

  const { value, unit: parsedUnit } = splitCSSValueAndUnit(str);
  const unit = parsedUnit || defaultUnit(key);
  return `${key}(${value}${unit})`;
}

export function isTransformKey(key: string) {
  return transformKeys.includes(key as (typeof transformKeys)[number]);
}

// Exported for testing
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
      if (value && typeof (value as AnimateValue<any>).subscribe === 'function') {
        unsubs.push((value as AnimateValue<any>).subscribe(render));
      }
    }
  }

  return unsubs;
}

export function applyStyles(
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

export function applyAttrs(
  node: HTMLElement,
  props: Record<string, any>
): (() => void)[] {
  const subscriptions: (() => void)[] = [];

  for (const [key, value] of Object.entries(props)) {
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

export function applyTransforms(
  elRef: HTMLElement,
  txProps: Record<string, any>
): (() => void)[] {
  return applyTransformsStyle(elRef, txProps);
}

