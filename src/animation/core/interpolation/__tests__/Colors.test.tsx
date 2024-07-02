import { rgbaToHex, hexToRgba } from '../Colors';

describe('Colors', () => {
  it('rgbaToHex() function to convert rgba object to hex string', () => {
    expect(rgbaToHex({ r: 255, g: 255, b: 255, a: 1 })).toStrictEqual(
      '#ffffffff'
    );
    expect(rgbaToHex({ r: 252, g: 186, b: 3, a: 1 })).toStrictEqual(
      '#fcba03ff'
    );
  });

  it('hexToRgba() function to convert hex string to rgba object', () => {
    expect(hexToRgba('#ffffff')).toStrictEqual({
      r: 255,
      g: 255,
      b: 255,
      a: 1,
    });

    expect(hexToRgba('#fff')).toStrictEqual({
      r: 255,
      g: 255,
      b: 255,
      a: 1,
    });

    expect(hexToRgba('#2a6e55')).toStrictEqual({
      r: 42,
      g: 110,
      b: 85,
      a: 1,
    });
  });
});
