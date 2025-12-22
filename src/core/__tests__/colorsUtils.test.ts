import {
  isCssColorLiteral,
  parseCssColor,
  replaceCssColorsWithRgba,
} from '../to';

describe('isCssColorLiteral', () => {
  it('identifies valid named colors', () => {
    expect(isCssColorLiteral('red')).toBe(true);
    expect(isCssColorLiteral('white')).toBe(true);
    expect(isCssColorLiteral('transparent')).toBe(true);
    expect(isCssColorLiteral('aliceblue')).toBe(true);
  });

  it('identifies valid hex colors (3, 4, 6, 8 digits)', () => {
    expect(isCssColorLiteral('#f00')).toBe(true);
    expect(isCssColorLiteral('#F00F')).toBe(true);
    expect(isCssColorLiteral('#FF0000')).toBe(true);
    expect(isCssColorLiteral('#ff0000aa')).toBe(true);
    expect(isCssColorLiteral('#abc')).toBe(true);
    expect(isCssColorLiteral('#123456')).toBe(true);
  });

  it('identifies valid rgb/rgba colors', () => {
    expect(isCssColorLiteral('rgb(255, 0, 0)')).toBe(true);
    expect(isCssColorLiteral('rgb(0, 128, 255)')).toBe(true);
    expect(isCssColorLiteral('rgba(255, 0, 0, 1)')).toBe(true);
    expect(isCssColorLiteral('rgba(0, 0, 0, 0.5)')).toBe(true);
    expect(isCssColorLiteral('rgba(10, 20, 30, 0)')).toBe(true);
    expect(isCssColorLiteral('rgb(100%, 0%, 0%)')).toBe(true);
    expect(isCssColorLiteral('rgba(100%, 50%, 25%, 0.75)')).toBe(true);
    expect(isCssColorLiteral('rgb( 10 , 20 , 30 )')).toBe(true);
  });

  it('identifies valid hsl/hsla colors', () => {
    expect(isCssColorLiteral('hsl(0, 100%, 50%)')).toBe(true);
    expect(isCssColorLiteral('hsl(120, 50%, 75%)')).toBe(true);
    expect(isCssColorLiteral('hsla(0, 100%, 50%, 1)')).toBe(true);
    expect(isCssColorLiteral('hsla(240, 75%, 25%, 0.25)')).toBe(true);
    expect(isCssColorLiteral('hsla(360, 0%, 0%, 0)')).toBe(true);
    expect(isCssColorLiteral('hsl( 100 , 50% , 75% )')).toBe(true);
  });

  it('rejects malformed functional strings', () => {
    expect(isCssColorLiteral('rgb(1,2,3a)')).toBe(false);
    expect(isCssColorLiteral('rgb(1,2,3,)')).toBe(false);
    expect(isCssColorLiteral('rgb(1,2)')).toBe(false);
    expect(isCssColorLiteral('rgb(1,2,3,4,5)')).toBe(false);
    expect(isCssColorLiteral('rgba(1,2,3,a)')).toBe(false);
    expect(isCssColorLiteral('hsl(1,2,3a)')).toBe(false);
    expect(isCssColorLiteral('hsl(1,2)')).toBe(false);
    expect(isCssColorLiteral('hsla(1,2,3,a)')).toBe(false);
    expect(isCssColorLiteral('rgb (255,0,0)')).toBe(false);
    expect(isCssColorLiteral('rgb(255,0,0 )')).toBe(true);
    expect(isCssColorLiteral('rgb( 255,0,0)')).toBe(true);
  });

  it('rejects functional colors with out-of-range values', () => {
    expect(isCssColorLiteral('rgb(256, 0, 0)')).toBe(false);
    expect(isCssColorLiteral('rgb(-1, 0, 0)')).toBe(false);
    expect(isCssColorLiteral('rgba(0, 0, 0, 1.1)')).toBe(false);
    expect(isCssColorLiteral('rgba(0, 0, 0, -0.1)')).toBe(false);
    expect(isCssColorLiteral('rgb(101%, 0%, 0%)')).toBe(false);
    expect(isCssColorLiteral('rgb(-1%, 0%, 0%)')).toBe(false);
    expect(isCssColorLiteral('hsl(0, 101%, 50%)')).toBe(false);
    expect(isCssColorLiteral('hsl(0, -1%, 50%)')).toBe(false);
    expect(isCssColorLiteral('hsl(0, 100%, 101%)')).toBe(false);
    expect(isCssColorLiteral('hsl(0, 100%, -1%)')).toBe(false);
    expect(isCssColorLiteral('hsla(0, 100%, 50%, 1.1)')).toBe(false);
    expect(isCssColorLiteral('hsla(0, 100%, 50%, -0.1)')).toBe(false);
  });

  it('rejects invalid hex codes', () => {
    expect(isCssColorLiteral('#f0')).toBe(false);
    expect(isCssColorLiteral('#f0000')).toBe(false);
    expect(isCssColorLiteral('#f000000')).toBe(false);
    expect(isCssColorLiteral('#g00')).toBe(false);
    expect(isCssColorLiteral('f00')).toBe(false);
  });

  it('rejects non-color strings', () => {
    expect(isCssColorLiteral('notacolor')).toBe(false);
    expect(isCssColorLiteral('')).toBe(false);
    expect(isCssColorLiteral(' ')).toBe(false);
    expect(isCssColorLiteral('blueish')).toBe(false);
    expect(isCssColorLiteral('rgba(255, 0, 0)')).toBe(true);
  });
});

describe('parseCssColor', () => {
  it('parses named colors to RGBA', () => {
    expect(parseCssColor('red')).toEqual([255, 0, 0, 1]);
    expect(parseCssColor('black')).toEqual([0, 0, 0, 1]);
    expect(parseCssColor('transparent')).toEqual([0, 0, 0, 0]);
    expect(parseCssColor('aliceblue')).toEqual([240, 248, 255, 1]);
  });

  it('parses hex colors to RGBA', () => {
    expect(parseCssColor('#f00')).toEqual([255, 0, 0, 1]);
    expect(parseCssColor('#F00F')).toEqual([255, 0, 0, 1]);
    expect(parseCssColor('#FF0000')).toEqual([255, 0, 0, 1]);
    expect(parseCssColor('#ff000080')).toEqual([255, 0, 0, 0.5019607843137255]);
    expect(parseCssColor('#123456')).toEqual([18, 52, 86, 1]);
    expect(parseCssColor('#aabbccdd')).toEqual([170, 187, 204, 0.8666666666666667]);
  });

  it('parses rgb/rgba colors to RGBA', () => {
    expect(parseCssColor('rgb(255, 0, 0)')).toEqual([255, 0, 0, 1]);
    expect(parseCssColor('rgb(0, 128, 255)')).toEqual([0, 128, 255, 1]);
    expect(parseCssColor('rgba(255, 0, 0, 1)')).toEqual([255, 0, 0, 1]);
    expect(parseCssColor('rgba(0, 0, 0, 0.5)')).toEqual([0, 0, 0, 0.5]);
    expect(parseCssColor('rgba(10, 20, 30, 0)')).toEqual([10, 20, 30, 0]);
    expect(parseCssColor('rgb(100%, 0%, 0%)')).toEqual([255, 0, 0, 1]);
    expect(parseCssColor('rgba(100%, 50%, 25%, 0.75)')).toEqual([255, 128, 64, 0.75]);
  });

  it('parses hsl/hsla colors to RGBA', () => {
    expect(parseCssColor('hsl(0, 100%, 50%)')).toEqual([255, 0, 0, 1]);
    expect(parseCssColor('hsl(120, 100%, 50%)')).toEqual([0, 255, 0, 1]);
    expect(parseCssColor('hsl(240, 100%, 50%)')).toEqual([0, 0, 255, 1]);
    expect(parseCssColor('hsl(180, 50%, 50%)')).toEqual([64, 191, 191, 1]);
    expect(parseCssColor('hsla(0, 100%, 50%, 0.5)')).toEqual([255, 0, 0, 0.5]);
    expect(parseCssColor('hsla(120, 50.00%, 74.90%, 0.75)')).toEqual([159, 223, 159, 0.75]);
  });

  it('throws an error for unrecognized CSS colors', () => {
    expect(() => parseCssColor('notacolor')).toThrow('Unrecognized CSS color: notacolor');
    expect(() => parseCssColor('rgb(1,2,3a)')).toThrow('Unrecognized CSS color: rgb(1,2,3a)');
    expect(() => parseCssColor('#f0')).toThrow(/Unrecognized CSS color/);
  });
});

describe('replaceCssColorsWithRgba', () => {
  it('replaces named colors with rgba format', () => {
    expect(replaceCssColorsWithRgba('The color is red.')).toBe('The color is rgba(255,0,0,1).');
    expect(replaceCssColorsWithRgba('transparent background')).toBe('rgba(0,0,0,0) background');
  });

  it('replaces hex colors with rgba format', () => {
    expect(replaceCssColorsWithRgba('Background: #FFF; Color: #000000;')).toBe(
      'Background: rgba(255,255,255,1); Color: rgba(0,0,0,1);'
    );
    expect(replaceCssColorsWithRgba('Alpha hex: #1234')).toBe('Alpha hex: rgba(17,34,51,0.267)');
    expect(replaceCssColorsWithRgba('Full alpha hex: #AABBCCDD')).toBe(
      'Full alpha hex: rgba(170,187,204,0.867)'
    );
  });

  it('replaces rgb/rgba colors with consistent rgba format', () => {
    expect(replaceCssColorsWithRgba('Old RGB: rgb(10, 20, 30)')).toBe('Old RGB: rgba(10,20,30,1)');
    expect(replaceCssColorsWithRgba('Old RGBA: rgba(10, 20, 30, 0.75)')).toBe(
      'Old RGBA: rgba(10,20,30,0.75)'
    );
    expect(replaceCssColorsWithRgba('rgb(100%, 50%, 0%)')).toBe('rgba(255,128,0,1)');
  });

  it('replaces hsl/hsla colors with rgba format', () => {
    expect(replaceCssColorsWithRgba('HSL color: hsl(0, 100%, 50%)')).toBe('HSL color: rgba(255,0,0,1)');
    expect(replaceCssColorsWithRgba('HSLA color: hsla(120, 50%, 75%, 0.5)')).toBe(
      'HSLA color: rgba(159,223,159,0.5)'
    );
  });

  it('handles strings with multiple color formats', () => {
    const input = 'This is red, #00F, rgb(0,255,0), and hsla(240, 100%, 50%, 0.8) mixed.';
    const expected =
      'This is rgba(255,0,0,1), rgba(0,0,255,1), rgba(0,255,0,1), and rgba(0,0,255,0.8) mixed.';
    expect(replaceCssColorsWithRgba(input)).toBe(expected);
  });

  it('returns the original string if no colors are found', () => {
    expect(replaceCssColorsWithRgba('Just plain text.')).toBe('Just plain text.');
    expect(replaceCssColorsWithRgba('')).toBe('');
  });

  it('leaves malformed colors unchanged within a string', () => {
    const input = 'Valid: red, Invalid: rgb(1,2,3a), Another valid: #ccc';
    const expected = 'Valid: rgba(255,0,0,1), Invalid: rgb(1,2,3a), Another valid: rgba(204,204,204,1)';
    expect(replaceCssColorsWithRgba(input)).toBe(expected);
    expect(replaceCssColorsWithRgba('Some text with #invalidhex and rgb(bad,values)')).toBe(
      'Some text with #invalidhex and rgb(bad,values)'
    );
  });

  it('handles case sensitivity for color names and hex codes', () => {
    expect(replaceCssColorsWithRgba('RED and #fff')).toBe('rgba(255,0,0,1) and rgba(255,255,255,1)');
    expect(replaceCssColorsWithRgba('rEd and #FFF')).toBe('rgba(255,0,0,1) and rgba(255,255,255,1)');
  });
});

