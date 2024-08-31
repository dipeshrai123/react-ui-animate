import { Easing } from '@raidipesh78/re-motion';

export const ValueConfig = {
  ELASTIC: { mass: 1, friction: 18, tension: 250 },
  BOUNCE: { duration: 500, easing: Easing.bounce },
  EASE: { mass: 1, friction: 26, tension: 170 },
  STIFF: { mass: 1, friction: 18, tension: 350 },
  WOOBLE: { mass: 1, friction: 8, tension: 250 },
  EASE_IN: { duration: 500, easing: Easing.in(Easing.ease) },
  EASE_OUT: { duration: 500, easing: Easing.out(Easing.ease) },
  EASE_IN_OUT: { duration: 500, easing: Easing.inOut(Easing.ease) },
  POWER1: { duration: 500, easing: Easing.bezier(0.17, 0.42, 0.51, 0.97) },
  POWER2: { duration: 500, easing: Easing.bezier(0.07, 0.11, 0.13, 1) },
  POWER3: { duration: 500, easing: Easing.bezier(0.09, 0.7, 0.16, 1.04) },
  POWER4: { duration: 500, easing: Easing.bezier(0.05, 0.54, 0, 1.03) },
  LINEAR: { duration: 500, easing: Easing.linear },
};
