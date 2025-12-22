import {
  applyTransformsStyle,
  isTransformKey,
  transformKeys,
} from '../../apply/styleTransformUtils';

class DummyMV<T> {
  current: T;
  private subs: ((v: T) => void)[] = [];

  constructor(initial: T) {
    this.current = initial;
  }

  subscribe(fn: (v: T) => void) {
    this.subs.push(fn);
    fn(this.current);
    return () => {
      const idx = this.subs.indexOf(fn);
      if (idx !== -1) this.subs.splice(idx, 1);
    };
  }

  set(v: T) {
    this.current = v;
    this.subs.forEach((fn) => fn(v));
  }
}

describe('isTransformKey()', () => {
  it('returns true for all keys in transformKeys', () => {
    transformKeys.forEach((key) => {
      expect(isTransformKey(key)).toBe(true);
    });
  });

  it('returns false for non-transform keys', () => {
    ['width', 'opacity', '', 'translate', 'fooBar'].forEach((k) => {
      expect(isTransformKey(k)).toBe(false);
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
      scale: [1, 2], // → “1,2”
      notATransform: 123, // ignored
    };

    applyTransformsStyle(node, props);
    expect(node.style.transform).toBe(
      'translateX(5px) rotate(45deg) scale(1,2)'
    );
  });

  it('subscribes to MotionValues and updates transform on change', () => {
    const tx = new DummyMV(10);
    const rz = new DummyMV('90deg');
    const props: Record<string, any> = { translateX: tx, rotate: rz };

    const unsubs = applyTransformsStyle(node, props);
    // initial render from subscribe()
    expect(node.style.transform).toBe('translateX(10px) rotate(90deg)');

    // update one MotionValue
    tx.set(20);
    expect(node.style.transform).toBe('translateX(20px) rotate(90deg)');

    // update the other
    rz.set('180deg');
    expect(node.style.transform).toBe('translateX(20px) rotate(180deg)');

    // unsub all and then change again
    unsubs.forEach((u) => u());
    tx.set(30);
    rz.set('270deg');
    // stays at last values
    expect(node.style.transform).toBe('translateX(20px) rotate(180deg)');
  });

  it('skips keys that are not in transformKeys', () => {
    const props = { foo: 1, bar: new DummyMV(2) };
    const unsubs = applyTransformsStyle(node, props);
    expect(node.style.transform).toBe('');
    expect(unsubs).toEqual([]);
  });

  it('ignores a raw transform prop and only applies specific transformKeys', () => {
    const props: Record<string, any> = {
      transform: 'rotate(30deg)',
      translateX: 10,
      scale: 2,
    };

    const unsubs = applyTransformsStyle(node, props);
    expect(node.style.transform).toBe('translateX(10px) scale(2)');
    expect(unsubs).toEqual([]);
  });

  it('when raw transform is passed without other it should apply it', () => {
    const props: Record<string, any> = {
      transform: 'perspective(400px)',
    };

    const unsubs = applyTransformsStyle(node, props);
    expect(node.style.transform).toBe('perspective(400px)');
    expect(unsubs).toEqual([]);
  });
});
