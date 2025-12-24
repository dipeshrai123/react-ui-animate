import { withSpring } from './descriptors';
import type { AnimateProp } from './components/types';

/**
 * Animation Recipes - Pre-built, tested animations for common use cases
 */

// ============================================================================
// Fade Animations
// ============================================================================

export const fadeIn: AnimateProp = {
  opacity: withSpring(1, { stiffness: 100, damping: 15 }),
};

export const fadeOut: AnimateProp = {
  opacity: withSpring(0, { stiffness: 100, damping: 15 }),
};

export const fadeInUp: AnimateProp = {
  opacity: withSpring(1, { stiffness: 100, damping: 15 }),
  translateY: withSpring(0, { stiffness: 100, damping: 15 }),
};

export const fadeInDown: AnimateProp = {
  opacity: withSpring(1, { stiffness: 100, damping: 15 }),
  translateY: withSpring(0, { stiffness: 100, damping: 15 }),
};

export const fadeInLeft: AnimateProp = {
  opacity: withSpring(1, { stiffness: 100, damping: 15 }),
  translateX: withSpring(0, { stiffness: 100, damping: 15 }),
};

export const fadeInRight: AnimateProp = {
  opacity: withSpring(1, { stiffness: 100, damping: 15 }),
  translateX: withSpring(0, { stiffness: 100, damping: 15 }),
};

// ============================================================================
// Slide Animations
// ============================================================================

export const slideInUp: AnimateProp = {
  translateY: withSpring(0, { stiffness: 100, damping: 15 }),
};

export const slideInDown: AnimateProp = {
  translateY: withSpring(0, { stiffness: 100, damping: 15 }),
};

export const slideInLeft: AnimateProp = {
  translateX: withSpring(0, { stiffness: 100, damping: 15 }),
};

export const slideInRight: AnimateProp = {
  translateX: withSpring(0, { stiffness: 100, damping: 15 }),
};

export const slideOutUp: AnimateProp = {
  translateY: withSpring(-100, { stiffness: 100, damping: 15 }),
};

export const slideOutDown: AnimateProp = {
  translateY: withSpring(100, { stiffness: 100, damping: 15 }),
};

export const slideOutLeft: AnimateProp = {
  translateX: withSpring(-100, { stiffness: 100, damping: 15 }),
};

export const slideOutRight: AnimateProp = {
  translateX: withSpring(100, { stiffness: 100, damping: 15 }),
};

// ============================================================================
// Scale Animations
// ============================================================================

export const scaleIn: AnimateProp = {
  scale: withSpring(1, { stiffness: 200, damping: 20 }),
  opacity: withSpring(1, { stiffness: 100, damping: 15 }),
};

export const scaleOut: AnimateProp = {
  scale: withSpring(0, { stiffness: 200, damping: 20 }),
  opacity: withSpring(0, { stiffness: 100, damping: 15 }),
};

export const scaleUp: AnimateProp = {
  scale: withSpring(1.1, { stiffness: 150, damping: 15 }),
};

export const scaleDown: AnimateProp = {
  scale: withSpring(0.9, { stiffness: 150, damping: 15 }),
};

// ============================================================================
// Bounce Animations
// ============================================================================

export const bounceIn: AnimateProp = {
  scale: withSpring(1, { stiffness: 300, damping: 10 }),
  opacity: withSpring(1, { stiffness: 100, damping: 15 }),
};

export const bounceOut: AnimateProp = {
  scale: withSpring(0, { stiffness: 300, damping: 10 }),
  opacity: withSpring(0, { stiffness: 100, damping: 15 }),
};

// ============================================================================
// Rotate Animations
// ============================================================================

export const rotateIn: AnimateProp = {
  rotate: withSpring(0, { stiffness: 100, damping: 15 }),
  opacity: withSpring(1, { stiffness: 100, damping: 15 }),
};

export const rotateOut: AnimateProp = {
  rotate: withSpring(180, { stiffness: 100, damping: 15 }),
  opacity: withSpring(0, { stiffness: 100, damping: 15 }),
};

export const spin: AnimateProp = {
  rotate: withSpring(360, { stiffness: 50, damping: 10 }),
};

// ============================================================================
// Zoom Animations
// ============================================================================

export const zoomIn: AnimateProp = {
  scale: withSpring(1, { stiffness: 200, damping: 20 }),
  opacity: withSpring(1, { stiffness: 100, damping: 15 }),
};

export const zoomOut: AnimateProp = {
  scale: withSpring(0, { stiffness: 200, damping: 20 }),
  opacity: withSpring(0, { stiffness: 100, damping: 15 }),
};

// ============================================================================
// Flip Animations
// ============================================================================

export const flipX: AnimateProp = {
  rotateX: withSpring(0, { stiffness: 150, damping: 15 }),
};

export const flipY: AnimateProp = {
  rotateY: withSpring(0, { stiffness: 150, damping: 15 }),
};

// ============================================================================
// Combined Animations
// ============================================================================

export const slideFadeIn: AnimateProp = {
  opacity: withSpring(1, { stiffness: 100, damping: 15 }),
  translateY: withSpring(0, { stiffness: 100, damping: 15 }),
};

export const slideFadeOut: AnimateProp = {
  opacity: withSpring(0, { stiffness: 100, damping: 15 }),
  translateY: withSpring(20, { stiffness: 100, damping: 15 }),
};

export const scaleFadeIn: AnimateProp = {
  scale: withSpring(1, { stiffness: 200, damping: 20 }),
  opacity: withSpring(1, { stiffness: 100, damping: 15 }),
};

export const scaleFadeOut: AnimateProp = {
  scale: withSpring(0.8, { stiffness: 200, damping: 20 }),
  opacity: withSpring(0, { stiffness: 100, damping: 15 }),
};

// ============================================================================
// Hover Animations (for state animations)
// ============================================================================

export const hoverScale: AnimateProp = {
  scale: withSpring(1.05, { stiffness: 300, damping: 20 }),
};

export const hoverLift: AnimateProp = {
  translateY: withSpring(-5, { stiffness: 300, damping: 20 }),
  scale: withSpring(1.02, { stiffness: 300, damping: 20 }),
};

export const hoverGlow: AnimateProp = {
  scale: withSpring(1.05, { stiffness: 300, damping: 20 }),
  opacity: withSpring(0.9, { stiffness: 300, damping: 20 }),
};

// ============================================================================
// Press Animations (for state animations)
// ============================================================================

export const pressScale: AnimateProp = {
  scale: withSpring(0.95, { stiffness: 400, damping: 25 }),
};

export const pressDown: AnimateProp = {
  translateY: withSpring(2, { stiffness: 400, damping: 25 }),
  scale: withSpring(0.98, { stiffness: 400, damping: 25 }),
};

// ============================================================================
// Exit Animations (for exit prop)
// ============================================================================

export const exitFade: AnimateProp = {
  opacity: withSpring(0, { stiffness: 100, damping: 15 }),
};

export const exitSlideUp: AnimateProp = {
  opacity: withSpring(0, { stiffness: 100, damping: 15 }),
  translateY: withSpring(-20, { stiffness: 100, damping: 15 }),
};

export const exitSlideDown: AnimateProp = {
  opacity: withSpring(0, { stiffness: 100, damping: 15 }),
  translateY: withSpring(20, { stiffness: 100, damping: 15 }),
};

export const exitScale: AnimateProp = {
  scale: withSpring(0.8, { stiffness: 200, damping: 20 }),
  opacity: withSpring(0, { stiffness: 100, damping: 15 }),
};

// ============================================================================
// Recipe Collections
// ============================================================================

export const recipes = {
  // Fade
  fadeIn,
  fadeOut,
  fadeInUp,
  fadeInDown,
  fadeInLeft,
  fadeInRight,

  // Slide
  slideInUp,
  slideInDown,
  slideInLeft,
  slideInRight,
  slideOutUp,
  slideOutDown,
  slideOutLeft,
  slideOutRight,

  // Scale
  scaleIn,
  scaleOut,
  scaleUp,
  scaleDown,

  // Bounce
  bounceIn,
  bounceOut,

  // Rotate
  rotateIn,
  rotateOut,
  spin,

  // Zoom
  zoomIn,
  zoomOut,

  // Flip
  flipX,
  flipY,

  // Combined
  slideFadeIn,
  slideFadeOut,
  scaleFadeIn,
  scaleFadeOut,

  // Hover
  hoverScale,
  hoverLift,
  hoverGlow,

  // Press
  pressScale,
  pressDown,

  // Exit
  exitFade,
  exitSlideUp,
  exitSlideDown,
  exitScale,
} as const;
