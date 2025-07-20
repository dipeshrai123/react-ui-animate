import { RefObject, useEffect, useState } from 'react';

export interface UseInViewOptions extends IntersectionObserverInit {
  once?: boolean;
}

export function useInView(
  ref: RefObject<Element>,
  options: UseInViewOptions = {}
) {
  const { root, rootMargin, threshold, once = false } = options;
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          if (once) {
            observer.unobserve(entry.target);
            observer.disconnect();
          }
        } else if (!once) {
          setIsInView(false);
        }
      },
      { root: root ?? null, rootMargin, threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, root, rootMargin, threshold, once]);

  return isInView;
}
