import { makeAnimatedComponent } from '@raidipesh78/re-motion';

/**
 * AnimatedInline - A higher order component built upon `span` element
 * which can accept `AnimatedValue`. It also exposes some extra style properties like
 * translateX, translateY, rotateX, rotateY, scaleX, etc.
 */
export const AnimatedInline = makeAnimatedComponent('span');
