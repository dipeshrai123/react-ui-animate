import * as React from 'react';
import {
  makeAnimatedComponent as animated,
  TransitionValue,
} from '@raidipesh78/re-motion';
import { useAnimatedValue, UseAnimatedValueConfig } from './useAnimatedValue';
import { useMountedValue, UseMountedValueConfig } from './useMountedValue';

/**
 * Make any component animatable
 */
export function makeAnimatedComponent(
  WrappedComponent: React.ElementType<any>
) {
  return animated(WrappedComponent);
}

/**
 * AnimatedBlock : Animated Div
 */
export const AnimatedBlock = animated('div');
/**
 * AnimatedInline : Animated Span
 */
export const AnimatedInline = animated('span');
/**
 * AnimatedImage : Animated Image
 */
export const AnimatedImage = animated('img');
interface ScrollableBlockProps {
  children?: (animation: any) => React.ReactNode;
  direction?: 'single' | 'both';
  threshold?: number;
  animationConfig?: UseAnimatedValueConfig;
}

/**
 * ScrollableBlock
 * Used to animate element when enter into viewport
 * Render props pattern with children accepts animation node
 * animated value goes from 0 to 1 when appear on viewport & vice versa.
 */
export const ScrollableBlock: React.FC<ScrollableBlockProps> = (props) => {
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

  return <div ref={scrollableBlockRef}>{children && children(animation)}</div>;
};

interface MountedBlockProps {
  state: boolean;
  children: (animation: { value: TransitionValue }) => React.ReactNode;
  config: UseMountedValueConfig;
}

/**
 * MountedBlock handles mounting and unmounting of a component
 * @props - state: boolean, config: InnerUseMountedValueConfig
 * @children -  (animation: { value: TransitionValue }) => React.ReactNode
 */
export const MountedBlock = ({
  state,
  children,
  config,
}: MountedBlockProps) => {
  const open = useMountedValue(state, config);

  return <>{open((animation, mounted) => mounted && children(animation))}</>;
};
