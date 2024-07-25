import * as React from 'react';

import { useAnimatedValue, UseAnimatedValueConfig } from '../useAnimatedValue';

interface ScrollableBlockProps {
  children?: (animation: { value: any }) => React.ReactNode;
  direction?: 'single' | 'both';
  threshold?: number;
  animationConfig?: UseAnimatedValueConfig;
}

/**
 * ScrollableBlock - Higher order component to handle the entrance or exit animation
 * of a component when it enters or exit the viewport. Accepts child as a function with
 * `AnimatedValue` as its first argument which can be interpolated on input range [0, 1]
 * @prop { function } children - child as a function with `AnimatedValue` as its first argument.
 * @prop { 'single' | 'both' } direction - single applies animation on enter once, both applies on enter and exit.
 * @prop { number } threshold - should be in range 0 to 1 which equivalent to `IntersectionObserver` threshold.
 * @prop { UseAnimatedValueConfig } animationConfig - Animation config
 */
export const ScrollableBlock = (props: ScrollableBlockProps) => {
  const {
    children,
    direction = 'single',
    animationConfig,
    threshold = 0.2,
  } = props;
  const scrollableBlockRef = React.useRef<HTMLDivElement>(null);
  const animation = useAnimatedValue(0, animationConfig); // 0: not intersecting | 1: intersecting

  React.useEffect(() => {
    const _scrollableBlock = scrollableBlockRef.current;

    const observer = new IntersectionObserver(
      function ([entry]) {
        const { isIntersecting } = entry;

        if (isIntersecting) {
          animation.value = 1;
        } else {
          if (direction === 'both') animation.value = 0;
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
      {children && children({ value: animation.value as any })}
    </div>
  );
};
