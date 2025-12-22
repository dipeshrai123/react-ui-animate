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

export function applyStyleProps(el: HTMLElement, key: string, v: any) {
  const css =
    typeof v === 'number' && !UNIT_LESS.has(key) ? `${v}px` : String(v);
  (el.style as any)[key] = css;
}
