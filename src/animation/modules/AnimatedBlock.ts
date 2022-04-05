import { makeAnimatedComponent } from '@raidipesh78/re-motion';

/**
 * AnimatedBlock - A higher order component built upon `div` element
 * which can accept `AnimatedValue`. It also exposes some extra style properties like
 * translateX, translateY, rotateX, rotateY, scaleX, etc.
 */
export const AnimatedBlock = makeAnimatedComponent('div');
