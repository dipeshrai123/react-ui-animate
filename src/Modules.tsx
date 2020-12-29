import * as React from "react";
import { animated, AnimatedProps } from "react-spring";
import { useAnimatedValue } from "./Animation";

// Animated Block - can receive all props from useAnimatedValue() hook
export const AnimatedBlock = React.forwardRef(
  (
    { children, ...rest }: AnimatedProps<any>,
    ref: React.RefObject<HTMLDivElement>
  ) => (
    <animated.div ref={ref} {...rest}>
      {children}
    </animated.div>
  )
);

// TODO: REFACTOR ScrollableBlock
// ScrollableBlock
interface UseAnimatedValueConfig {
  onAnimationEnd?: (value: number) => void;
  listener?: (value: number) => void;
  animationType?: "ease" | "elastic";
  duration?: number;
  [prop: string]: any;
}

interface ScrollableBlockProps {
  children?: (animation: any) => React.ReactNode;
  direction?: "single" | "both";
  animationConfig?: UseAnimatedValueConfig;
}

export const ScrollableBlock: React.FC<ScrollableBlockProps> = (props) => {
  const { children, direction = "single", animationConfig } = props;
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
          if (direction === "both") animation.value = 0;
        }
      },
      {
        root: null, // FOR VIEWPORT ONLY
        rootMargin: "0px",
        threshold: [0, 0.8],
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

  return <div ref={scrollableBlockRef}>{children && children(animation)}</div>;
};
