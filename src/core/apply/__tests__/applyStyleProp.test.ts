import { applyStyleProps } from '../../apply/applyStyleProp';

describe('applyStyleProps()', () => {
  let el: HTMLElement;

  beforeEach(() => {
    el = document.createElement('div');
  });

  it('appends "px" for numeric values on non-unitless properties', () => {
    applyStyleProps(el, 'width', 100);
    expect(el.style.width).toBe('100px');

    applyStyleProps(el, 'height', 0);
    expect(el.style.height).toBe('0px');

    applyStyleProps(el, 'marginTop', -5);
    expect(el.style.marginTop).toBe('-5px');
  });

  it('does NOT append "px" for numeric values on unitless properties', () => {
    applyStyleProps(el, 'opacity', 0.5);
    expect(el.style.opacity).toBe('0.5');

    applyStyleProps(el, 'zIndex', 10);
    expect(el.style.zIndex).toBe('10');
  });

  it('stringifies non-number values directly', () => {
    applyStyleProps(el, 'width', '50%');
    expect(el.style.width).toBe('50%');

    applyStyleProps(el, 'lineHeight', '1.5');
    expect(el.style.lineHeight).toBe('1.5');

    applyStyleProps(el, 'display', null);
    expect(el.style.display).toBe('null');

    applyStyleProps(el, 'visibility', undefined);
    expect(el.style.visibility).toBe('undefined');
  });

  it('works if you mix number and unitless keys in sequence', () => {
    applyStyleProps(el, 'opacity', 0.2);
    applyStyleProps(el, 'padding', 10);
    applyStyleProps(el, 'flexGrow', 3);
    expect(el.style.opacity).toBe('0.2');
    expect(el.style.padding).toBe('10px');
    expect(el.style.flexGrow).toBe('3');
  });
});
