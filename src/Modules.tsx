import * as React from "react";
import { animated } from "react-spring";
import { useAnimatedValue, UseAnimatedValueConfig } from "./Animation";

// Make animatable
export function makeAnimatedComponent(
  WrappedComponent: React.ElementType<any>
) {
  return animated(WrappedComponent);
}

// Default Animated Elements
export const AnimatedBlock = makeAnimatedComponent("div");
export const AnimatedInline = makeAnimatedComponent("span");
export const AnimatedImage = makeAnimatedComponent("img");

/**
 * ScrollableBlock
 * Used to animate element when enter into viewport
 * Render props pattern with children accepts animation node
 * animated value goes from 0 to 1 when appear on viewport & vice versa.
 *
 * Todo:
 * Should be able to define when the animation should start.
 * eg: 0 - 1 range value which part of vertical section on viewport.
 */
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
