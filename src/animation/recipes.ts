import { withSpring } from './descriptors';
import type { AnimateProp } from './components/types';

// Shared spring configs, reused across recipes below (deduped so the
// minifier can collapse repeated `{ stiffness, damping }` literals into a
// single shared reference instead of ~40 structurally-identical copies).
const SOFT = { stiffness: 100, damping: 15 };
const SCALE = { stiffness: 200, damping: 20 };
const BOUNCE = { stiffness: 300, damping: 10 };
const SPIN = { stiffness: 50, damping: 10 };
const FLIP = { stiffness: 150, damping: 15 };
const HOVER = { stiffness: 300, damping: 20 };
const PRESS = { stiffness: 400, damping: 25 };

const soft = (to: number) => /*#__PURE__*/ withSpring(to, SOFT);
const scale = (to: number) => /*#__PURE__*/ withSpring(to, SCALE);

export const fadeIn: AnimateProp = { opacity: soft(1) };
export const fadeOut: AnimateProp = { opacity: soft(0) };
export const fadeInUp: AnimateProp = { opacity: soft(1), translateY: soft(0) };
export const fadeInDown: AnimateProp = { opacity: soft(1), translateY: soft(0) };
export const fadeInLeft: AnimateProp = { opacity: soft(1), translateX: soft(0) };
export const fadeInRight: AnimateProp = { opacity: soft(1), translateX: soft(0) };

export const slideInUp: AnimateProp = { translateY: soft(0) };
export const slideInDown: AnimateProp = { translateY: soft(0) };
export const slideInLeft: AnimateProp = { translateX: soft(0) };
export const slideInRight: AnimateProp = { translateX: soft(0) };
export const slideOutUp: AnimateProp = { translateY: soft(-100) };
export const slideOutDown: AnimateProp = { translateY: soft(100) };
export const slideOutLeft: AnimateProp = { translateX: soft(-100) };
export const slideOutRight: AnimateProp = { translateX: soft(100) };

export const scaleIn: AnimateProp = { scale: scale(1), opacity: soft(1) };
export const scaleOut: AnimateProp = { scale: scale(0), opacity: soft(0) };
export const scaleUp: AnimateProp = {
  scale: /*#__PURE__*/ withSpring(1.1, { stiffness: 150, damping: 15 }),
};
export const scaleDown: AnimateProp = {
  scale: /*#__PURE__*/ withSpring(0.9, { stiffness: 150, damping: 15 }),
};

export const bounceIn: AnimateProp = {
  scale: /*#__PURE__*/ withSpring(1, BOUNCE),
  opacity: soft(1),
};
export const bounceOut: AnimateProp = {
  scale: /*#__PURE__*/ withSpring(0, BOUNCE),
  opacity: soft(0),
};

export const rotateIn: AnimateProp = { rotate: soft(0), opacity: soft(1) };
export const rotateOut: AnimateProp = { rotate: soft(180), opacity: soft(0) };
export const spin: AnimateProp = {
  rotate: /*#__PURE__*/ withSpring(360, SPIN),
};

export const zoomIn: AnimateProp = { scale: scale(1), opacity: soft(1) };
export const zoomOut: AnimateProp = { scale: scale(0), opacity: soft(0) };

export const flipX: AnimateProp = {
  rotateX: /*#__PURE__*/ withSpring(0, FLIP),
};
export const flipY: AnimateProp = {
  rotateY: /*#__PURE__*/ withSpring(0, FLIP),
};

export const slideFadeIn: AnimateProp = { opacity: soft(1), translateY: soft(0) };
export const slideFadeOut: AnimateProp = { opacity: soft(0), translateY: soft(20) };
export const scaleFadeIn: AnimateProp = { scale: scale(1), opacity: soft(1) };
export const scaleFadeOut: AnimateProp = {
  scale: /*#__PURE__*/ withSpring(0.8, SCALE),
  opacity: soft(0),
};

export const hoverScale: AnimateProp = {
  scale: /*#__PURE__*/ withSpring(1.05, HOVER),
};
export const hoverLift: AnimateProp = {
  translateY: /*#__PURE__*/ withSpring(-5, HOVER),
  scale: /*#__PURE__*/ withSpring(1.02, HOVER),
};
export const hoverGlow: AnimateProp = {
  scale: /*#__PURE__*/ withSpring(1.05, HOVER),
  opacity: /*#__PURE__*/ withSpring(0.9, HOVER),
};

export const pressScale: AnimateProp = {
  scale: /*#__PURE__*/ withSpring(0.95, PRESS),
};
export const pressDown: AnimateProp = {
  translateY: /*#__PURE__*/ withSpring(2, PRESS),
  scale: /*#__PURE__*/ withSpring(0.98, PRESS),
};

export const unmountFade: AnimateProp = { opacity: soft(0) };
export const unmountSlideUp: AnimateProp = { opacity: soft(0), translateY: soft(-20) };
export const unmountSlideDown: AnimateProp = { opacity: soft(0), translateY: soft(20) };
export const unmountScale: AnimateProp = {
  scale: /*#__PURE__*/ withSpring(0.8, SCALE),
  opacity: soft(0),
};

export const recipes = {
  fadeIn,
  fadeOut,
  fadeInUp,
  fadeInDown,
  fadeInLeft,
  fadeInRight,

  slideInUp,
  slideInDown,
  slideInLeft,
  slideInRight,
  slideOutUp,
  slideOutDown,
  slideOutLeft,
  slideOutRight,

  scaleIn,
  scaleOut,
  scaleUp,
  scaleDown,

  bounceIn,
  bounceOut,

  rotateIn,
  rotateOut,
  spin,

  zoomIn,
  zoomOut,

  flipX,
  flipY,

  slideFadeIn,
  slideFadeOut,
  scaleFadeIn,
  scaleFadeOut,

  hoverScale,
  hoverLift,
  hoverGlow,

  pressScale,
  pressDown,

  unmountFade,
  unmountSlideUp,
  unmountSlideDown,
  unmountScale,
} as const;
