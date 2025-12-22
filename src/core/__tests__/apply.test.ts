import { applyStyles, applyAttrs } from '../apply';
import { AnimateValue } from '../AnimateValue';

describe('applyStyles()', () => {
  let node: HTMLElement;

  beforeEach(() => {
    node = document.createElement('div');
  });

  it('applies static styles immediately and returns no subscriptions', () => {
    const subscriptions = applyStyles(node, {
      width: 100,
      opacity: '0.5',
      backgroundColor: 'red',
    });

    expect(node.style.width).toBe('100px');
    expect(node.style.opacity).toBe('0.5');
    expect(node.style.backgroundColor).toBe('red');
    expect(subscriptions).toEqual([]);
  });

  it('subscribes to AnimateValue and updates style on change', () => {
    const value = new AnimateValue(0);
    const subscriptions = applyStyles(node, { height: value });

    expect(node.style.height).toBe('0px');
    expect(typeof subscriptions[0]).toBe('function');

    value.set(50);
    expect(node.style.height).toBe('50px');

    const unsubscribe = subscriptions[0];
    unsubscribe();
    value.set(75);
    expect(node.style.height).toBe('50px');
  });
});

describe('applyAttrs()', () => {
  let node: HTMLElement;

  beforeEach(() => {
    node = document.createElement('div');
  });

  it('applies static attributes immediately and returns no subscriptions', () => {
    const subscriptions = applyAttrs(node, {
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
    expect(subscriptions).toEqual([]);
  });

  it('subscribes to AnimateValue and updates attribute on change', () => {
    const value = new AnimateValue('initial');
    const subscriptions = applyAttrs(node, { title: value });

    expect(node.getAttribute('title')).toBe('initial');

    value.set('updated');
    expect(node.getAttribute('title')).toBe('updated');

    const unsubscribe = subscriptions[0];
    unsubscribe();
    value.set('final');
    expect(node.getAttribute('title')).toBe('updated');
  });
});

