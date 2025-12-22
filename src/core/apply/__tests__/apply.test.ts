import { applyStyles, applyAttrs } from '../../apply/apply';
import { MotionValue } from '../../MotionValue';

describe('applyStyles()', () => {
  let node: HTMLElement;

  beforeEach(() => {
    node = document.createElement('div');
  });

  it('applies static styles immediately and returns no unsubs', () => {
    const unsubs = applyStyles(node, {
      width: 100,
      opacity: '0.5',
      backgroundColor: 'red',
    });

    expect(node.style.width).toBe('100px');
    expect(node.style.opacity).toBe('0.5');
    expect(node.style.backgroundColor).toBe('red');
    expect(unsubs).toEqual([]);
  });

  it('subscribes to MotionValue and updates style on change', () => {
    const mv = new MotionValue(0);
    const unsubs = applyStyles(node, { height: mv });

    expect(node.style.height).toBe('0px');
    expect(typeof unsubs[0]).toBe('function');

    mv.set(50);
    expect(node.style.height).toBe('50px');

    const unsubscribe = unsubs[0];
    unsubscribe();
    mv.set(75);
    expect(node.style.height).toBe('50px');
  });
});

describe('applyAttrs()', () => {
  let node: HTMLElement;

  beforeEach(() => {
    node = document.createElement('div');
  });

  it('applies static attributes immediately and returns no unsubs', () => {
    const unsubs = applyAttrs(node, {
      id: 'my-id',
      'data-num': 42,
      hidden: true,
      foo: null,
      bar: undefined,
    });

    expect(node.getAttribute('id')).toBe('my-id');
    expect(node.getAttribute('data-num')).toBe('42');
    expect(node.hidden).toBe(true);
    expect(node.hasAttribute('foo')).toBe(false);
    expect(node.hasAttribute('bar')).toBe(false);
    expect(unsubs).toEqual([]);
  });

  it('subscribes to MotionValue and updates attribute on change', () => {
    const mv = new MotionValue('initial');
    const unsubs = applyAttrs(node, { title: mv });

    expect(node.getAttribute('title')).toBe('initial');

    mv.set('updated');
    expect(node.getAttribute('title')).toBe('updated');

    const unsubscribe = unsubs[0];
    unsubscribe();
    mv.set('final');
    expect(node.getAttribute('title')).toBe('updated');
  });
});
