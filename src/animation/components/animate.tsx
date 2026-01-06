import { makeAnimated } from './AnimatedComponent';

const cache = new Map<
  keyof JSX.IntrinsicElements,
  ReturnType<typeof makeAnimated>
>();

export const animate = new Proxy({} as any, {
  get(_, tag: keyof JSX.IntrinsicElements) {
    if (!cache.has(tag)) {
      cache.set(tag, makeAnimated(tag));
    }
    return cache.get(tag);
  },
}) as {
  [K in keyof JSX.IntrinsicElements]: ReturnType<typeof makeAnimated<K>>;
};

export { makeAnimated };

