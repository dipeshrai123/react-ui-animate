import { Easing } from "@raidipesh78/re-motion";
import { GenericAnimationConfig } from "./useAnimatedValue";
export type InitialConfigType =
  | "ease"
  | "elastic"
  | "stiff"
  | "wooble"
  | "bounce"
  | undefined;

export const getInitialConfig = (
  animationType: InitialConfigType
): GenericAnimationConfig => {
  switch (animationType) {
    case "elastic":
      return { mass: 1, friction: 18, tension: 250 };

    case "stiff":
      return { mass: 1, friction: 18, tension: 350 };

    case "wooble":
      return { mass: 1, friction: 8, tension: 250 };

    case "bounce":
      return { duration: 500, easing: Easing.bounce };

    case "ease":
    default:
      return { mass: 1, friction: 26, tension: 170 };
  }
};
