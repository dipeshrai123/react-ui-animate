import type { Primitive } from '../types';
import { isTransformKey } from './apply';

// Helper to extract initial value from style prop (static values only)
export function getStaticStyleValue(style: any, key: string): Primitive | null {
  if (!style || !(key in style)) return null;
  
  const value = style[key];
  if (value === undefined || value === null) return null;
  
  // Skip AnimateValues - we want static initial values
  if (value && typeof value === 'object' && 'subscribe' in value) return null;
  
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    // Check if the string has a CSS unit - if so, keep it as a string
    if (/\d+(px|rem|em|ex|%|cm|mm|in|pt|pc|ch|vh|vw|vmin|vmax)$/i.test(value)) return value;
    
    const num = parseFloat(value);
    return isNaN(num) ? value : num;
  }
  
  return null;
}

// Helper to get default initial value for a property
export function getDefaultInitialValue(key: string): Primitive {
  if (key === 'opacity') return 1;
  if (key === 'scale' || key === 'scaleX' || key === 'scaleY') return 1;
  if (key.startsWith('translate')) return 0;
  if (key.startsWith('rotate')) return 0;
  return 0;
}

// Helper to check if a string has a CSS unit
export function hasUnit(value: string): boolean {
  return /\d+(px|rem|em|ex|%|cm|mm|in|pt|pc|ch|vh|vw|vmin|vmax)$/i.test(value);
}

// Helper to check if a property should always be numeric
export function isNumericProperty(key: string): boolean {
  // Transform properties should be numeric
  if (isTransformKey(key)) return true;
  // Opacity should be numeric
  if (key === 'opacity') return true;
  // Z-index should be numeric
  if (key === 'zIndex') return true;
  return false;
}

// Helper to get initial value for a property
export function getInitialValue(
  key: string,
  style: any,
  node: HTMLElement,
  computedStyle: CSSStyleDeclaration
): Primitive {
  const shouldBeNumeric = isNumericProperty(key);
  
  // Prioritize static value from style prop
  const staticValue = getStaticStyleValue(style, key);
  if (staticValue !== null) {
    // Ensure numeric properties are always numbers
    if (shouldBeNumeric && typeof staticValue === 'string') {
      const num = parseFloat(staticValue);
      return isNaN(num) ? getDefaultInitialValue(key) : num;
    }
    return staticValue;
  }
  
  // Fall back to inline style
  const inlineValue = (node.style as any)[key];
  if (inlineValue) {
    // For numeric properties, always parse to number
    if (shouldBeNumeric) {
      const num = parseFloat(inlineValue);
      return isNaN(num) ? getDefaultInitialValue(key) : num;
    }
    // Preserve strings with units for non-numeric properties
    if (hasUnit(inlineValue)) return inlineValue;
    const num = parseFloat(inlineValue);
    return isNaN(num) ? inlineValue : num;
  }
  
  // Fall back to computed style
  const computedValue = computedStyle.getPropertyValue(
    key.replace(/([A-Z])/g, '-$1').toLowerCase()
  );
  if (computedValue) {
    // For numeric properties, always parse to number
    if (shouldBeNumeric) {
      const num = parseFloat(computedValue);
      return isNaN(num) ? getDefaultInitialValue(key) : num;
    }
    // Preserve strings with units for non-numeric properties
    if (hasUnit(computedValue)) return computedValue.trim();
    const num = parseFloat(computedValue);
    return isNaN(num) ? computedValue.trim() : num;
  }
  
  // Use default
  return getDefaultInitialValue(key);
}

