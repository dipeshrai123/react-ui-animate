import {
  applyTransformsStyle,
  isTransformKey,
  transformKeys,
} from '../apply';
import { AnimateValue } from '../AnimateValue';

class DummyAnimateValue<T> {
  current: T;
  private subscribers: ((value: T) => void)[] = [];

  constructor(initial: T) {
    this.current = initial;
  }

  subscribe(fn: (value: T) => void) {
    this.subscribers.push(fn);
    fn(this.current);
    return () => {
      const index = this.subscribers.indexOf(fn);
      if (index !== -1) this.subscribers.splice(index, 1);
    };
  }

  set(value: T) {
    this.current = value;
    this.subscribers.forEach((fn) => fn(value));
  }
}

describe('isTransformKey()', () => {
  it('returns true for all keys in transformKeys', () => {
    transformKeys.forEach((key) => {
      expect(isTransformKey(key)).toBe(true);
    });
  });

  it('returns false for non-transform keys', () => {
    ['width', 'opacity', '', 'translate', 'fooBar'].forEach((key) => {
      expect(isTransformKey(key)).toBe(false);
    });
  });
});

describe('applyTransformsStyle()', () => {
  let node: HTMLElement;

  beforeEach(() => {
    node = document.createElement('div');
    node.style.transform = '';
  });

  it('applies static transforms with correct units and ordering', () => {
    const props = {
      translateX: 5, // → 5px
      rotate: '45deg', // → 45deg
      scale: [1, 2], // → "1,2"
      notATransform: 123, // ignored
    };

    const subscriptions = applyTransformsStyle(node, props);
    expect(node.style.transform).toBe(
      'translateX(5px) rotate(45deg) scale(1,2)'
    );
  });

  it('subscribes to AnimateValues and updates transform on change', () => {
    const translateX = new DummyAnimateValue(10);
    const rotate = new DummyAnimateValue('90deg');
    const props: Record<string, any> = { translateX, rotate };

    const subscriptions = applyTransformsStyle(node, props);
    // initial render from subscribe()
    expect(node.style.transform).toBe('translateX(10px) rotate(90deg)');

    // update one AnimateValue
    translateX.set(20);
    expect(node.style.transform).toBe('translateX(20px) rotate(90deg)');

    // update the other
    rotate.set('180deg');
    expect(node.style.transform).toBe('translateX(20px) rotate(180deg)');

    // unsub all and then change again
    subscriptions.forEach((unsubscribe) => unsubscribe());
    translateX.set(30);
    rotate.set('270deg');
    // stays at last values
    expect(node.style.transform).toBe('translateX(20px) rotate(180deg)');
  });

  it('skips keys that are not in transformKeys', () => {
    const props = { foo: 1, bar: new DummyAnimateValue(2) };
    const subscriptions = applyTransformsStyle(node, props);
    expect(node.style.transform).toBe('');
    expect(subscriptions).toEqual([]);
  });

  it('ignores a raw transform prop and only applies specific transformKeys', () => {
    const props: Record<string, any> = {
      transform: 'rotate(30deg)',
      translateX: 10,
      scale: 2,
    };

    const subscriptions = applyTransformsStyle(node, props);
    expect(node.style.transform).toBe('translateX(10px) scale(2)');
    expect(subscriptions).toEqual([]);
  });

  it('when raw transform is passed without other it should apply it', () => {
    const props: Record<string, any> = {
      transform: 'perspective(400px)',
    };

    const subscriptions = applyTransformsStyle(node, props);
    expect(node.style.transform).toBe('perspective(400px)');
    expect(subscriptions).toEqual([]);
  });
});

