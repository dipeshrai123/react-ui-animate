import { applyStyleProp } from '../apply';

describe('applyStyleProp()', () => {
  let element: HTMLElement;

  beforeEach(() => {
    element = document.createElement('div');
  });

  it('appends "px" for numeric values on non-unitless properties', () => {
    applyStyleProp(element, 'width', 100);
    expect(element.style.width).toBe('100px');

    applyStyleProp(element, 'height', 0);
    expect(element.style.height).toBe('0px');

    applyStyleProp(element, 'marginTop', -5);
    expect(element.style.marginTop).toBe('-5px');
  });

  it('does NOT append "px" for numeric values on unitless properties', () => {
    applyStyleProp(element, 'opacity', 0.5);
    expect(element.style.opacity).toBe('0.5');

    applyStyleProp(element, 'zIndex', 10);
    expect(element.style.zIndex).toBe('10');
  });

  it('stringifies non-number values directly', () => {
    applyStyleProp(element, 'width', '50%');
    expect(element.style.width).toBe('50%');

    applyStyleProp(element, 'lineHeight', '1.5');
    expect(element.style.lineHeight).toBe('1.5');

    applyStyleProp(element, 'display', null);
    expect(element.style.display).toBe('null');

    applyStyleProp(element, 'visibility', undefined);
    expect(element.style.visibility).toBe('undefined');
  });

  it('works if you mix number and unitless keys in sequence', () => {
    applyStyleProp(element, 'opacity', 0.2);
    applyStyleProp(element, 'padding', 10);
    applyStyleProp(element, 'flexGrow', 3);
    expect(element.style.opacity).toBe('0.2');
    expect(element.style.padding).toBe('10px');
    expect(element.style.flexGrow).toBe('3');
  });
});

