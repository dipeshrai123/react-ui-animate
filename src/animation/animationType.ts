import { Easing, UseFluidValueConfig } from '@raidipesh78/re-motion';

type InitialConfigType =
  | 'linear'
  | 'easein'
  | 'easeout'
  | 'easeinout'
  | 'ease'
  | 'power1'
  | 'power2'
  | 'power3'
  | 'power4'
  | 'elastic'
  | 'stiff'
  | 'wooble'
  | 'bounce';

const getInitialConfig = (
  animationType?: InitialConfigType
): UseFluidValueConfig => {
  switch (animationType) {
    case 'elastic':
      return { mass: 1, friction: 18, tension: 250 };

    case 'stiff':
      return { mass: 1, friction: 18, tension: 350 };

    case 'wooble':
      return { mass: 1, friction: 8, tension: 250 };

    case 'bounce':
      return { duration: 500, easing: Easing.bounce };

    case 'power1':
      return { duration: 500, easing: Easing.bezier(0.17, 0.42, 0.51, 0.97) };

    case 'power2':
      return { duration: 500, easing: Easing.bezier(0.07, 0.11, 0.13, 1) };

    case 'power3':
      return { duration: 500, easing: Easing.bezier(0.09, 0.7, 0.16, 1.04) };

    case 'power4':
      return { duration: 500, easing: Easing.bezier(0.05, 0.54, 0, 1.03) };

    case 'linear':
      return { duration: 500, easing: Easing.linear };

    case 'easein':
      return { duration: 500, easing: Easing.in(Easing.ease) };

    case 'easeout':
      return { duration: 500, easing: Easing.out(Easing.ease) };

    case 'easeinout':
      return { duration: 500, easing: Easing.inOut(Easing.ease) };

    case 'ease':
    default:
      return { mass: 1, friction: 34, tension: 290 };
  }
};

export const AnimationConfigUtils = {
  ELASTIC: getInitialConfig('elastic'),
  BOUNCE: getInitialConfig('bounce'),
  EASE: getInitialConfig('ease'),
  STIFF: getInitialConfig('stiff'),
  WOOBLE: getInitialConfig('wooble'),
  EASE_IN: getInitialConfig('easein'),
  EASE_OUT: getInitialConfig('easeout'),
  EASE_IN_OUT: getInitialConfig('easeinout'),
  POWER1: getInitialConfig('power1'),
  POWER2: getInitialConfig('power2'),
  POWER3: getInitialConfig('power3'),
  POWER4: getInitialConfig('power4'),
  LINEAR: getInitialConfig('linear'),
};
