import type { Primitive } from '../types';
import { isTransformKey } from './apply';

export function getStaticStyleValue(style: any, key: string): Primitive | null {
  if (!style || !(key in style)) return null;

  const value = style[key];
  if (value === undefined || value === null) return null;

  // Skip AnimateValues - we want static initial values
  if (value && typeof value === 'object' && 'subscribe' in value) return null;

  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    // Must check for complex CSS values (spaces, functions, colors, gradients)
    // before attempting to parse as a number, or e.g. "0 0 0 rgba(0,0,0,0)"
    // would get mangled.
    const complexValuePatterns = [
      /\s/,
      /rgba?\(/,
      /hsla?\(/,
      /#[0-9a-fA-F]/,
      /linear-gradient|radial-gradient|conic-gradient/,
      /calc\(|var\(/,
    ];

    if (complexValuePatterns.some(pattern => pattern.test(value))) {
      return value;
    }

    if (/\d+(px|rem|em|ex|%|cm|mm|in|pt|pc|ch|vh|vw|vmin|vmax)$/i.test(value)) return value;

    const num = parseFloat(value);
    return isNaN(num) ? value : num;
  }

  return null;
}

export function getDefaultInitialValue(key: string): Primitive {
  if (key === 'opacity') return 1;
  if (key === 'scale' || key === 'scaleX' || key === 'scaleY') return 1;
  if (key.startsWith('translate')) return 0;
  if (key.startsWith('rotate')) return 0;

  const stringProperties = [
    'boxShadow', 'textShadow', 'background', 'backgroundImage',
    'backgroundPosition', 'backgroundSize', 'border', 'borderColor',
    'borderImage', 'borderRadius', 'color', 'fill', 'stroke',
    'filter', 'backdropFilter', 'clipPath', 'mask', 'maskImage'
  ];

  if (stringProperties.includes(key)) {
    return '';
  }

  return 0;
}

export function hasUnit(value: string): boolean {
  return /\d+(px|rem|em|ex|%|cm|mm|in|pt|pc|ch|vh|vw|vmin|vmax)$/i.test(value);
}

export function isNumericProperty(key: string): boolean {
  if (isTransformKey(key)) return true;
  if (key === 'opacity') return true;
  if (key === 'zIndex') return true;
  return false;
}

// Resolves in priority order: explicit style prop -> inline style -> computed
// style -> a sensible per-property default.
export function getInitialValue(
  key: string,
  style: any,
  node: HTMLElement,
  computedStyle: CSSStyleDeclaration
): Primitive {
  const shouldBeNumeric = isNumericProperty(key);

  const staticValue = getStaticStyleValue(style, key);
  if (staticValue !== null) {
    if (shouldBeNumeric && typeof staticValue === 'string') {
      const num = parseFloat(staticValue);
      return isNaN(num) ? getDefaultInitialValue(key) : num;
    }
    return staticValue;
  }

  const inlineValue = (node.style as any)[key];
  if (inlineValue) {
    if (shouldBeNumeric) {
      const num = parseFloat(inlineValue);
      return isNaN(num) ? getDefaultInitialValue(key) : num;
    }
    if (hasUnit(inlineValue)) return inlineValue;
    const num = parseFloat(inlineValue);
    return isNaN(num) ? inlineValue : num;
  }

  const computedValue = computedStyle.getPropertyValue(
    key.replace(/([A-Z])/g, '-$1').toLowerCase()
  );
  if (computedValue) {
    const trimmed = computedValue.trim();

    if (shouldBeNumeric) {
      const num = parseFloat(trimmed);
      return isNaN(num) ? getDefaultInitialValue(key) : num;
    }

    // 'none' -> '' so a property can animate from "no value" to a value.
    if (trimmed === 'none') {
      const stringProperties = [
        'boxShadow', 'textShadow', 'background', 'backgroundImage',
        'backgroundPosition', 'backgroundSize', 'border', 'borderColor',
        'borderImage', 'borderRadius', 'color', 'fill', 'stroke',
        'filter', 'backdropFilter', 'clipPath', 'mask', 'maskImage'
      ];
      if (stringProperties.includes(key)) {
        return '';
      }
    }

    if (hasUnit(trimmed)) return trimmed;
    const num = parseFloat(trimmed);
    return isNaN(num) ? trimmed : num;
  }

  return getDefaultInitialValue(key);
}

