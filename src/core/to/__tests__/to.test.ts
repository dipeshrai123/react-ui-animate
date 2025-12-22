import { to } from '../../to';

describe('numeric → numeric', () => {
  it('linearly interpolates numbers', () => {
    const fn = to([0, 1], [0, 100]);
    expect(fn(0)).toBe(0);
    expect(fn(0.5)).toBe(50);
    expect(fn(1)).toBe(100);
  });
});

describe('simple CSS function (funcRegex branch)', () => {
  it('interpolates single-arg functions with units', () => {
    const fn = to([0, 1], ['translateX(0px)', 'translateX(100px)']);
    expect(fn(0.25)).toBe('translateX(25px)');
    expect(fn(1)).toBe('translateX(100px)');
  });

  it('throws if function name or unit changes', () => {
    const fn = to([0, 1], ['scale(1)', 'scaleX(2)']);
    expect(() => fn(0.5)).toThrow(/cannot interpolate tokens/);
  });
});

describe('CSS-color literal (parseCssColor branch)', () => {
  it('interpolates rgb→rgb and drops alpha if 1', () => {
    const fn = to([0, 1], ['rgb(0,0,0)', 'rgb(100,100,100)']);
    expect(fn(0.5)).toBe('rgb(50,50,50)');
  });

  it('interpolates rgba→rgba preserving fractional alpha', () => {
    const fn = to([0, 1], ['rgba(0,0,0,0)', 'rgba(0,0,0,1)']);
    expect(fn(0.25)).toBe('rgba(0,0,0,0.250)');
    expect(fn(1)).toBe('rgb(0,0,0)'); // alpha=1 collapses to rgb
  });
});

describe('generic template (tokenRegex + numUnitRE)', () => {
  it('handles multiple numeric tokens and punctuation', () => {
    const fn = to([0, 1], ['10px 20px', '20px 40px']);
    expect(fn(0.5)).toBe('15px 30px');
  });

  it('handles nested functions with multiple args', () => {
    const fn = to([0, 1], ['matrix(1, 2, 3, 4)', 'matrix(5, 6, 7, 8)']);
    expect(fn(0.5)).toBe('matrix(3, 4, 5, 6)');
  });

  it('throws on unit mismatch', () => {
    const fn = to([0, 1], ['10px', '20%']);
    expect(() => fn(0.5)).toThrow(/cannot interpolate tokens/);
  });

  it('throws on template length mismatch', () => {
    const fn = to([0, 1], ['a b c', 'a b']);
    expect(() => fn(0.5)).toThrow(/template mismatch/);
  });
});

describe('real-world boxShadow case', () => {
  it('smoothly interpolates all four parts + rgba alpha', () => {
    const fn = to(
      [0, 1],
      ['0px 0px 0px rgba(0, 0, 0, 0)', '10px 10px 20px rgba(0, 0, 0, 0.5)']
    );
    expect(fn(0.5)).toBe('5px 5px 10px rgba(0,0,0,0.25)');
  });
});

describe('to() with inline hex-color normalization', () => {
  const interp = to([0, 1], ['60px solid rgb(0,0,0)', '20px solid #3399ff']);

  it('at t=0 returns the exact first string', () => {
    expect(interp(0)).toBe('60px solid rgba(0,0,0,1)');
  });

  it('at t=1 returns the normalized second string', () => {
    expect(interp(1)).toBe('20px solid rgba(51,153,255,1)');
  });
});

describe('RGB to HSL interpolation', () => {
  it('correctly interpolates between rgb and hsl colors', () => {
    const fn = to([0, 1], ['rgb(255, 0, 0)', 'hsl(120, 100%, 50%)']);
    expect(fn(0)).toBe('rgb(255,0,0)');
    expect(fn(0.5)).toBe('rgb(128,128,0)');
    expect(fn(1)).toBe('rgb(0,255,0)');
  });
});

describe('edge cases for numeric interpolation', () => {
  it('handles extrapolation below and above input range', () => {
    const fn = to([0, 1], [0, 100]);
    expect(fn(-0.5)).toBe(-50);
    expect(fn(1.5)).toBe(150);
  });
});

describe('color interpolation with alpha between rgb and rgba', () => {
  it('handles rgb to rgba with alpha blending', () => {
    const fn = to([0, 1], ['rgb(100,100,100)', 'rgba(200,200,200,0.5)']);
    expect(fn(0.5)).toBe('rgba(150,150,150,0.750)');
  });

  it('handles alpha collapse when near 1', () => {
    const fn = to([0, 1], ['rgba(0,0,0,0.999)', 'rgba(0,0,0,1)']);
    expect(fn(1)).toBe('rgb(0,0,0)');
  });
});

describe('string templates with negative numbers and decimals', () => {
  it('interpolates decimal values', () => {
    const fn = to([0, 1], ['translateX(0.5px)', 'translateX(1.5px)']);
    expect(fn(0.5)).toBe('translateX(1px)');
  });

  it('interpolates negative values', () => {
    const fn = to([0, 1], ['-10px -20px', '10px 20px']);
    expect(fn(0.5)).toBe('0px 0px');
  });
});

describe('interpolating mixed tokens with string suffixes', () => {
  it('interpolates while preserving static tokens', () => {
    const fn = to([0, 1], ['rotate(0deg) scale(1)', 'rotate(360deg) scale(2)']);
    expect(fn(0.25)).toBe('rotate(90deg) scale(1.25)');
  });

  it('throws on mismatched transform function names', () => {
    const fn = to([0, 1], ['rotate(0deg)', 'skew(30deg)']);
    expect(() => fn(0.5)).toThrow(/cannot interpolate tokens/);
  });
});

describe('interpolates hex to named color', () => {
  it('normalizes both sides before interpolation', () => {
    const fn = to([0, 1], ['#ff0000', 'blue']);
    expect(fn(0.5)).toBe('rgb(128,0,128)');
  });
});
