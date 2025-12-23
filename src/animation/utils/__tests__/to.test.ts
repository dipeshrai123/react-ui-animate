import { to } from '../to';

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

describe('CSS keyword switching (border-style, etc.)', () => {
  it('switches from solid to dashed border style', () => {
    const fn = to([0, 1], ['2px solid rgba(100, 150, 200, 0.5)', '1px dashed rgba(50, 200, 255, 0.8)']);
    // At start, should use "solid"
    expect(fn(0)).toContain('solid');
    // At end, should use "dashed"
    expect(fn(1)).toContain('dashed');
    // Numeric values should interpolate
    expect(fn(0.5)).toContain('dashed'); // Should switch to dashed quickly
  });

  it('switches from solid to double border style', () => {
    const fn = to([0, 1], ['2px solid rgba(100, 150, 200, 0.5)', '10px double rgba(200, 50, 200, 0.6)']);
    // At start, should use "solid"
    expect(fn(0)).toContain('solid');
    // At end, should use "double"
    expect(fn(1)).toContain('double');
    // Should switch to double quickly
    expect(fn(0.5)).toContain('double');
  });

  it('switches between multiple border styles (dotted, groove, ridge)', () => {
    const fn = to([0, 1], ['3px dotted rgba(255, 0, 0, 0.5)', '5px groove rgba(0, 255, 0, 0.8)']);
    expect(fn(0)).toContain('dotted');
    expect(fn(1)).toContain('groove');
  });
});

describe('complex box-shadow cases', () => {
  it('handles box-shadow with inset keyword', () => {
    const fn = to([0, 1], ['0px 0px 0px rgba(0, 0, 0, 0)', 'inset 10px 10px 20px rgba(0, 0, 0, 0.5)']);
    expect(fn(0)).not.toContain('inset');
    expect(fn(1)).toContain('inset');
  });

  it('handles multiple box-shadows', () => {
    const fn = to(
      [0, 1],
      [
        '0px 0px 0px rgba(0, 0, 0, 0)',
        '5px 5px 10px rgba(255, 0, 0, 0.5), 10px 10px 20px rgba(0, 0, 0, 0.3)',
      ]
    );
    const result = fn(0.5);
    expect(result).toContain('rgba');
  });

  it('handles box-shadow with spread radius', () => {
    const fn = to(
      [0, 1],
      ['0px 0px 0px 0px rgba(0, 0, 0, 0)', '10px 10px 20px 5px rgba(0, 0, 0, 0.5)']
    );
    const result = fn(0.5);
    expect(result).toContain('rgba');
    expect(result).toMatch(/\d+px/);
  });
});

describe('complex transform cases', () => {
  it('handles matrix transform', () => {
    const fn = to([0, 1], ['matrix(1, 0, 0, 1, 0, 0)', 'matrix(2, 0, 0, 2, 100, 100)']);
    const result = fn(0.5);
    expect(result).toContain('matrix');
    expect(result).toMatch(/matrix\([\d.]+/);
  });

  it('handles matrix3d transform', () => {
    const fn = to(
      [0, 1],
      [
        'matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)',
        'matrix3d(2, 0, 0, 0, 0, 2, 0, 0, 0, 0, 2, 0, 100, 100, 0, 1)',
      ]
    );
    const result = fn(0.5);
    expect(result).toContain('matrix3d');
  });

  it('handles perspective in transform', () => {
    const fn = to([0, 1], ['perspective(0px) rotateX(0deg)', 'perspective(1000px) rotateX(45deg)']);
    const result = fn(0.5);
    expect(result).toContain('perspective');
    expect(result).toContain('rotateX');
  });
});

describe('gradient interpolation', () => {
  it('handles radial-gradient', () => {
    const fn = to(
      [0, 1],
      [
        'radial-gradient(circle, rgba(255, 0, 0, 1), rgba(0, 0, 255, 1))',
        'radial-gradient(ellipse, rgba(0, 255, 0, 1), rgba(255, 0, 255, 1))',
      ]
    );
    const result = fn(0.5);
    expect(result).toContain('radial-gradient');
    expect(result).toContain('rgba');
  });

  it('handles gradient with percentage stops', () => {
    const fn = to(
      [0, 1],
      [
        'linear-gradient(0deg, rgba(255, 0, 0, 1) 0%, rgba(0, 0, 255, 1) 100%)',
        'linear-gradient(90deg, rgba(0, 255, 0, 1) 25%, rgba(255, 0, 255, 1) 75%)',
      ]
    );
    const result = fn(0.5);
    expect(result).toContain('linear-gradient');
  });

  it('handles gradient with pixel stops', () => {
    const fn = to(
      [0, 1],
      [
        'linear-gradient(0deg, rgba(255, 0, 0, 1) 0px, rgba(0, 0, 255, 1) 100px)',
        'linear-gradient(90deg, rgba(0, 255, 0, 1) 50px, rgba(255, 0, 255, 1) 200px)',
      ]
    );
    const result = fn(0.5);
    expect(result).toContain('linear-gradient');
  });
});

describe('text-shadow and filter cases', () => {
  it('handles text-shadow with multiple values', () => {
    const fn = to(
      [0, 1],
      ['0px 0px 0px rgba(0, 0, 0, 0)', '2px 2px 4px rgba(0, 0, 0, 0.5)']
    );
    const result = fn(0.5);
    expect(result).toContain('rgba');
  });

  it('handles multiple text-shadows', () => {
    const fn = to(
      [0, 1],
      [
        '0px 0px 0px rgba(0, 0, 0, 0)',
        '1px 1px 2px rgba(255, 0, 0, 0.5), 2px 2px 4px rgba(0, 0, 0, 0.3)',
      ]
    );
    const result = fn(0.5);
    expect(result).toContain('rgba');
  });

  it('handles blur filter', () => {
    const fn = to([0, 1], ['blur(0px)', 'blur(10px)']);
    expect(fn(0.5)).toBe('blur(5px)');
  });

  it('handles multiple filters', () => {
    const fn = to(
      [0, 1],
      ['blur(0px) brightness(1)', 'blur(5px) brightness(1.5)']
    );
    const result = fn(0.5);
    expect(result).toContain('blur');
    expect(result).toContain('brightness');
  });
});

describe('font and typography cases', () => {
  it('handles font-weight keyword switching', () => {
    const fn = to([0, 1], ['16px normal', '24px bold']);
    expect(fn(0)).toContain('normal');
    expect(fn(1)).toContain('bold');
  });

  it('handles font-style keyword switching', () => {
    const fn = to([0, 1], ['16px normal', '20px italic']);
    expect(fn(0)).toContain('normal');
    expect(fn(1)).toContain('italic');
  });
});

describe('background and positioning cases', () => {
  it('handles background-position with keywords', () => {
    const fn = to([0, 1], ['0% 0%', '100% 100%']);
    const result = fn(0.5);
    expect(result).toBe('50% 50%');
  });

  it('handles background-size with keywords', () => {
    const fn = to([0, 1], ['100% 100%', '50% 50%']);
    const result = fn(0.5);
    expect(result).toBe('75% 75%');
  });
});

describe('edge cases with complex strings', () => {
  it('handles padding with 4 values', () => {
    const fn = to([0, 1], ['10px 20px 30px 40px', '5px 10px 15px 20px']);
    const result = fn(0.5);
    expect(result).toMatch(/\d+px/);
  });

  it('handles margin with 3 values', () => {
    const fn = to([0, 1], ['10px 20px 30px', '5px 10px 15px']);
    const result = fn(0.5);
    expect(result).toMatch(/\d+px/);
  });

  it('handles border-radius with multiple values', () => {
    const fn = to([0, 1], ['0px 0px 0px 0px', '10px 20px 30px 40px']);
    const result = fn(0.5);
    expect(result).toMatch(/\d+px/);
  });

  it('handles clip-path with polygon', () => {
    const fn = to(
      [0, 1],
      [
        'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
        'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
      ]
    );
    const result = fn(0.5);
    expect(result).toContain('polygon');
    expect(result).toMatch(/\d+%/);
  });
});

