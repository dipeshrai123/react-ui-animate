import { makeAnimatedComponent } from '../core';

/**
 * AnimatedImage - A higher order component built upon `img` element
 * which can accept `AnimatedValue`. It also exposes some extra style properties like
 * translateX, translateY, rotateX, rotateY, scaleX, etc.
 */
export const AnimatedImage = makeAnimatedComponent('img');
