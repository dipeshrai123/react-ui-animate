import {
  isCssColorLiteral,
  parseCssColor,
  replaceCssColorsWithRgba,
} from '../colorsUtils';

describe('isCssColorLiteral', () => {
  // Test valid named colors
  it('identifies valid named colors', () => {
    expect(isCssColorLiteral('red')).toBe(true);
    expect(isCssColorLiteral('white')).toBe(true);
    expect(isCssColorLiteral('transparent')).toBe(true);
    expect(isCssColorLiteral('aliceblue')).toBe(true);
  });

  // Test valid hex colors
  it('identifies valid hex colors (3, 4, 6, 8 digits)', () => {
    expect(isCssColorLiteral('#f00')).toBe(true); // 3-digit
    expect(isCssColorLiteral('#F00F')).toBe(true); // 4-digit
    expect(isCssColorLiteral('#FF0000')).toBe(true); // 6-digit
    expect(isCssColorLiteral('#ff0000aa')).toBe(true); // 8-digit
    expect(isCssColorLiteral('#abc')).toBe(true);
    expect(isCssColorLiteral('#123456')).toBe(true);
  });

  // Test valid rgb/rgba colors
  it('identifies valid rgb/rgba colors', () => {
    expect(isCssColorLiteral('rgb(255, 0, 0)')).toBe(true);
    expect(isCssColorLiteral('rgb(0, 128, 255)')).toBe(true);
    expect(isCssColorLiteral('rgba(255, 0, 0, 1)')).toBe(true);
    expect(isCssColorLiteral('rgba(0, 0, 0, 0.5)')).toBe(true);
    expect(isCssColorLiteral('rgba(10, 20, 30, 0)')).toBe(true);
    expect(isCssColorLiteral('rgb(100%, 0%, 0%)')).toBe(true); // Percentage values
    expect(isCssColorLiteral('rgba(100%, 50%, 25%, 0.75)')).toBe(true);
    expect(isCssColorLiteral('rgb( 10 , 20 , 30 )')).toBe(true); // With extra spaces
  });

  // Test valid hsl/hsla colors
  it('identifies valid hsl/hsla colors', () => {
    expect(isCssColorLiteral('hsl(0, 100%, 50%)')).toBe(true);
    expect(isCssColorLiteral('hsl(120, 50%, 75%)')).toBe(true);
    expect(isCssColorLiteral('hsla(0, 100%, 50%, 1)')).toBe(true);
    expect(isCssColorLiteral('hsla(240, 75%, 25%, 0.25)')).toBe(true);
    expect(isCssColorLiteral('hsla(360, 0%, 0%, 0)')).toBe(true);
    expect(isCssColorLiteral('hsl( 100 , 50% , 75% )')).toBe(true); // With extra spaces
  });

  // Test rejection of malformed functional strings (the original issue)
  it('rejects malformed functional strings', () => {
    expect(isCssColorLiteral('rgb(1,2,3a)')).toBe(false); // Malformed arg
    expect(isCssColorLiteral('rgb(1,2,3,)')).toBe(false); // Trailing comma
    expect(isCssColorLiteral('rgb(1,2)')).toBe(false); // Too few args
    expect(isCssColorLiteral('rgb(1,2,3,4,5)')).toBe(false); // Too many args
    expect(isCssColorLiteral('rgba(1,2,3,a)')).toBe(false); // Malformed alpha
    expect(isCssColorLiteral('hsl(1,2,3a)')).toBe(false); // Malformed arg
    expect(isCssColorLiteral('hsl(1,2)')).toBe(false); // Too few args
    expect(isCssColorLiteral('hsla(1,2,3,a)')).toBe(false); // Malformed alpha
    expect(isCssColorLiteral('rgb (255,0,0)')).toBe(false); // Space before parenthesis
    expect(isCssColorLiteral('rgb(255,0,0 )')).toBe(true); // Trailing space inside
    expect(isCssColorLiteral('rgb( 255,0,0)')).toBe(true); // Leading space inside
  });

  // Test rejection of out-of-range values (for internal logic, though regex might catch some)
  it('rejects functional colors with out-of-range values', () => {
    // RGB
    expect(isCssColorLiteral('rgb(256, 0, 0)')).toBe(false); // > 255
    expect(isCssColorLiteral('rgb(-1, 0, 0)')).toBe(false); // < 0
    expect(isCssColorLiteral('rgba(0, 0, 0, 1.1)')).toBe(false); // alpha > 1
    expect(isCssColorLiteral('rgba(0, 0, 0, -0.1)')).toBe(false); // alpha < 0
    expect(isCssColorLiteral('rgb(101%, 0%, 0%)')).toBe(false); // percentage > 100%
    expect(isCssColorLiteral('rgb(-1%, 0%, 0%)')).toBe(false); // percentage < 0%

    // HSL
    expect(isCssColorLiteral('hsl(0, 101%, 50%)')).toBe(false); // saturation > 100%
    expect(isCssColorLiteral('hsl(0, -1%, 50%)')).toBe(false); // saturation < 0%
    expect(isCssColorLiteral('hsl(0, 100%, 101%)')).toBe(false); // lightness > 100%
    expect(isCssColorLiteral('hsl(0, 100%, -1%)')).toBe(false); // lightness < 0%
    expect(isCssColorLiteral('hsla(0, 100%, 50%, 1.1)')).toBe(false); // alpha > 1
    expect(isCssColorLiteral('hsla(0, 100%, 50%, -0.1)')).toBe(false); // alpha < 0
  });

  // Test rejection of invalid hex codes
  it('rejects invalid hex codes', () => {
    expect(isCssColorLiteral('#f0')).toBe(false); // Too short
    expect(isCssColorLiteral('#f0000')).toBe(false); // Odd length
    expect(isCssColorLiteral('#f000000')).toBe(false); // Odd length
    expect(isCssColorLiteral('#g00')).toBe(false); // Invalid char
    expect(isCssColorLiteral('f00')).toBe(false); // Missing hash
  });

  // Test rejection of other invalid strings
  it('rejects non-color strings', () => {
    expect(isCssColorLiteral('notacolor')).toBe(false);
    expect(isCssColorLiteral('')).toBe(false);
    expect(isCssColorLiteral(' ')).toBe(false);
    expect(isCssColorLiteral('blueish')).toBe(false);
    expect(isCssColorLiteral('rgba(255, 0, 0)')).toBe(true); // Ensure valid ones still pass
  });
});

describe('parseCssColor', () => {
  // Test parsing named colors
  it('parses named colors to RGBA', () => {
    expect(parseCssColor('red')).toEqual([255, 0, 0, 1]);
    expect(parseCssColor('black')).toEqual([0, 0, 0, 1]);
    expect(parseCssColor('transparent')).toEqual([0, 0, 0, 0]);
    expect(parseCssColor('aliceblue')).toEqual([240, 248, 255, 1]);
  });

  // Test parsing hex colors
  it('parses hex colors to RGBA', () => {
    expect(parseCssColor('#f00')).toEqual([255, 0, 0, 1]); // 3-digit
    expect(parseCssColor('#F00F')).toEqual([255, 0, 0, 1]); // 4-digit
    expect(parseCssColor('#FF0000')).toEqual([255, 0, 0, 1]); // 6-digit
    expect(parseCssColor('#ff000080')).toEqual([255, 0, 0, 0.5019607843137255]); // 8-digit (128/255)
    expect(parseCssColor('#123456')).toEqual([18, 52, 86, 1]);
    expect(parseCssColor('#aabbccdd')).toEqual([
      170, 187, 204, 0.8666666666666667,
    ]);
  });

  // Test parsing rgb/rgba colors
  it('parses rgb/rgba colors to RGBA', () => {
    expect(parseCssColor('rgb(255, 0, 0)')).toEqual([255, 0, 0, 1]);
    expect(parseCssColor('rgb(0, 128, 255)')).toEqual([0, 128, 255, 1]);
    expect(parseCssColor('rgba(255, 0, 0, 1)')).toEqual([255, 0, 0, 1]);
    expect(parseCssColor('rgba(0, 0, 0, 0.5)')).toEqual([0, 0, 0, 0.5]);
    expect(parseCssColor('rgba(10, 20, 30, 0)')).toEqual([10, 20, 30, 0]);
    expect(parseCssColor('rgb(100%, 0%, 0%)')).toEqual([255, 0, 0, 1]);
    expect(parseCssColor('rgba(100%, 50%, 25%, 0.75)')).toEqual([
      255, 128, 64, 0.75,
    ]);
  });

  // Test parsing hsl/hsla colors
  it('parses hsl/hsla colors to RGBA', () => {
    // Note: HSL to RGB conversion can have slight floating point differences.
    // Use toBeCloseTo for alpha if needed, but for integers, exact match is fine.
    expect(parseCssColor('hsl(0, 100%, 50%)')).toEqual([255, 0, 0, 1]); // Red
    expect(parseCssColor('hsl(120, 100%, 50%)')).toEqual([0, 255, 0, 1]); // Green
    expect(parseCssColor('hsl(240, 100%, 50%)')).toEqual([0, 0, 255, 1]); // Blue
    expect(parseCssColor('hsl(180, 50%, 50%)')).toEqual([64, 191, 191, 1]); // Cyan-ish
    expect(parseCssColor('hsla(0, 100%, 50%, 0.5)')).toEqual([255, 0, 0, 0.5]);
    expect(parseCssColor('hsla(120, 50.00%, 74.90%, 0.75)')).toEqual([
      159, 223, 159, 0.75,
    ]);
  });

  // Test error handling for unrecognized colors
  it('throws an error for unrecognized CSS colors', () => {
    expect(() => parseCssColor('notacolor')).toThrow(
      'Unrecognized CSS color: notacolor'
    );
    expect(() => parseCssColor('rgb(1,2,3a)')).toThrow(
      'Unrecognized CSS color: rgb(1,2,3a)'
    );
    expect(() => parseCssColor('#f0')).toThrow(/Unrecognized CSS color/);
  });
});

describe('replaceCssColorsWithRgba', () => {
  // Test replacing named colors
  it('replaces named colors with rgba format', () => {
    expect(replaceCssColorsWithRgba('The color is red.')).toBe(
      'The color is rgba(255,0,0,1).'
    );
    expect(replaceCssColorsWithRgba('transparent background')).toBe(
      'rgba(0,0,0,0) background'
    );
  });

  // Test replacing hex colors
  it('replaces hex colors with rgba format', () => {
    expect(replaceCssColorsWithRgba('Background: #FFF; Color: #000000;')).toBe(
      'Background: rgba(255,255,255,1); Color: rgba(0,0,0,1);'
    );
    expect(replaceCssColorsWithRgba('Alpha hex: #1234')).toBe(
      'Alpha hex: rgba(17,34,51,0.267)'
    ); // 0x44 / 255
    expect(replaceCssColorsWithRgba('Full alpha hex: #AABBCCDD')).toBe(
      'Full alpha hex: rgba(170,187,204,0.867)'
    );
  });

  // Test replacing rgb/rgba colors (should just reformat to consistent rgba)
  it('replaces rgb/rgba colors with consistent rgba format', () => {
    expect(replaceCssColorsWithRgba('Old RGB: rgb(10, 20, 30)')).toBe(
      'Old RGB: rgba(10,20,30,1)'
    );
    expect(replaceCssColorsWithRgba('Old RGBA: rgba(10, 20, 30, 0.75)')).toBe(
      'Old RGBA: rgba(10,20,30,0.75)'
    );
    expect(replaceCssColorsWithRgba('rgb(100%, 50%, 0%)')).toBe(
      'rgba(255,128,0,1)'
    );
  });

  // Test replacing hsl/hsla colors
  it('replaces hsl/hsla colors with rgba format', () => {
    expect(replaceCssColorsWithRgba('HSL color: hsl(0, 100%, 50%)')).toBe(
      'HSL color: rgba(255,0,0,1)'
    );
    expect(
      replaceCssColorsWithRgba('HSLA color: hsla(120, 50%, 75%, 0.5)')
    ).toBe('HSLA color: rgba(159,223,159,0.5)');
  });

  // Test strings with multiple color formats
  it('handles strings with multiple color formats', () => {
    const input =
      'This is red, #00F, rgb(0,255,0), and hsla(240, 100%, 50%, 0.8) mixed.';
    const expected =
      'This is rgba(255,0,0,1), rgba(0,0,255,1), rgba(0,255,0,1), and rgba(0,0,255,0.8) mixed.';
    expect(replaceCssColorsWithRgba(input)).toBe(expected);
  });

  // Test strings with no colors
  it('returns the original string if no colors are found', () => {
    expect(replaceCssColorsWithRgba('Just plain text.')).toBe(
      'Just plain text.'
    );
    expect(replaceCssColorsWithRgba('')).toBe('');
  });

  // Test handling of malformed colors within a string (should leave them unchanged)
  it('leaves malformed colors unchanged within a string', () => {
    const input = 'Valid: red, Invalid: rgb(1,2,3a), Another valid: #ccc';
    const expected =
      'Valid: rgba(255,0,0,1), Invalid: rgb(1,2,3a), Another valid: rgba(204,204,204,1)';
    expect(replaceCssColorsWithRgba(input)).toBe(expected);
    expect(
      replaceCssColorsWithRgba('Some text with #invalidhex and rgb(bad,values)')
    ).toBe('Some text with #invalidhex and rgb(bad,values)');
  });

  // Test case sensitivity for color names and hex codes
  it('handles case sensitivity for color names and hex codes', () => {
    expect(replaceCssColorsWithRgba('RED and #fff')).toBe(
      'rgba(255,0,0,1) and rgba(255,255,255,1)'
    );
    expect(replaceCssColorsWithRgba('rEd and #FFF')).toBe(
      'rgba(255,0,0,1) and rgba(255,255,255,1)'
    );
  });
});
