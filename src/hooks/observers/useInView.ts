import { RefObject, useEffect, useState } from 'react';

import { useValue, withSpring } from '../../animation';
import { type Descriptor } from '../../animation/types';

export interface UseInViewOptions extends IntersectionObserverInit {
  once?: boolean;
  animate?: boolean;
  toDescriptor?: (t: number) => Descriptor;
}

export function useInView(
  ref: RefObject<Element>,
  options: UseInViewOptions = {}
) {
  const {
    root,
    rootMargin,
    threshold,
    once = false,
    animate = true,
    toDescriptor = (v: number) => withSpring(v),
  } = options;
  const [inView, setInView] = useState(false);
  const [inViewProgress, setInViewProgress] = useValue(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          setInViewProgress(animate ? toDescriptor(1) : 1);
          if (once) {
            observer.unobserve(entry.target);
            observer.disconnect();
          }
        } else if (!once) {
          setInView(false);
          setInViewProgress(animate ? toDescriptor(0) : 0);
        }
      },
      { root: root ?? null, rootMargin, threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, root, rootMargin, threshold, once]);

  return { inView, inViewProgress };
}
