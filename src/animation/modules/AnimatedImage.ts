import { makeFluid } from '@raidipesh78/re-motion';

/**
 * AnimatedImage - A higher order component built upon `img` element
 * which can accept `AnimatedValue`. It also exposes some extra style properties like
 * translateX, translateY, rotateX, rotateY, scaleX, etc.
 */
export const AnimatedImage = makeFluid('img');
