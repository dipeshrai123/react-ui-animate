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
    // Check if it's a complex CSS value (contains spaces, functions, colors, etc.)
    // These should be kept as strings for proper interpolation
    // Check this FIRST before trying to parse as number
    const complexValuePatterns = [
      /\s/, // Contains spaces (e.g., "0 0 0 rgba(0,0,0,0)")
      /rgba?\(/, // Contains rgba/rgb functions
      /hsla?\(/, // Contains hsl/hsla functions
      /#[0-9a-fA-F]/, // Contains hex colors
      /linear-gradient|radial-gradient|conic-gradient/, // Contains gradients
      /calc\(|var\(/, // Contains CSS functions
    ];
    
    if (complexValuePatterns.some(pattern => pattern.test(value))) {
      return value;
    }
    
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
  
  // String properties that should default to empty string
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
    const trimmed = computedValue.trim();
    
    // For numeric properties, always parse to number
    if (shouldBeNumeric) {
      const num = parseFloat(trimmed);
      return isNaN(num) ? getDefaultInitialValue(key) : num;
    }
    
    // For string properties, convert 'none' to empty string for better interpolation
    // This allows animating from no value to a value
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
    
    // Preserve strings with units for non-numeric properties
    if (hasUnit(trimmed)) return trimmed;
    const num = parseFloat(trimmed);
    return isNaN(num) ? trimmed : num;
  }
  
  // Use default
  return getDefaultInitialValue(key);
}

