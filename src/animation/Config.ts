import { Easing } from '@raidipesh78/re-motion';

export const Config = {
  Timing: {
    BOUNCE: { duration: 500, easing: Easing.bounce },
    EASE_IN: { duration: 500, easing: Easing.in(Easing.ease) },
    EASE_OUT: { duration: 500, easing: Easing.out(Easing.ease) },
    EASE_IN_OUT: { duration: 500, easing: Easing.inOut(Easing.ease) },
    POWER1: { duration: 500, easing: Easing.bezier(0.17, 0.42, 0.51, 0.97) },
    POWER2: { duration: 500, easing: Easing.bezier(0.07, 0.11, 0.13, 1) },
    POWER3: { duration: 500, easing: Easing.bezier(0.09, 0.7, 0.16, 1.04) },
    POWER4: { duration: 500, easing: Easing.bezier(0.05, 0.54, 0, 1.03) },
    LINEAR: { duration: 500, easing: Easing.linear },
  },
  Spring: {
    ELASTIC: { mass: 1, damping: 18, stiffness: 250 },
    EASE: { mass: 1, damping: 20, stiffness: 158 },
    STIFF: { mass: 1, damping: 18, stiffness: 350 },
    WOBBLE: { mass: 1, damping: 8, stiffness: 250 },
  },
};
