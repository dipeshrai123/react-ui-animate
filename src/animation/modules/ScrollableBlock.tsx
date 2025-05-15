import { ReactNode, useRef, useLayoutEffect } from 'react';
import { MotionValue } from '@raidipesh78/re-motion';

import { useValue } from '../hooks';
import { withEase } from '../controllers';

interface ScrollableBlockProps {
  children?: (animation: { value: MotionValue }) => ReactNode;
  direction?: 'single' | 'both';
  threshold?: number;
}

export const ScrollableBlock = (props: ScrollableBlockProps) => {
  const { children, direction = 'single', threshold = 0.2 } = props;
  const scrollableBlockRef = useRef<HTMLDivElement>(null);
  const animation = useValue(0); // 0: not intersecting | 1: intersecting

  useLayoutEffect(() => {
    const _scrollableBlock = scrollableBlockRef.current;

    const observer = new IntersectionObserver(
      function ([entry]) {
        const { isIntersecting } = entry;

        if (isIntersecting) {
          animation.value = withEase(1);
        } else {
          if (direction === 'both') animation.value = withEase(0);
        }
      },
      {
        root: null, // FOR VIEWPORT ONLY
        threshold,
      }
    );

    if (_scrollableBlock) {
      observer.observe(_scrollableBlock);
    }

    return () => {
      if (_scrollableBlock) {
        observer.unobserve(_scrollableBlock);
      }
    };
  }, []);

  return (
    <div ref={scrollableBlockRef}>
      {children && children({ value: animation.value })}
    </div>
  );
};
