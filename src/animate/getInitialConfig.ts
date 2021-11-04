export type InitialConfigType =
  | "ease"
  | "elastic"
  | "stiff"
  | "wooble"
  | undefined;

export const getInitialConfig = (
  animationType: InitialConfigType
): {
  mass: number;
  friction: number;
  tension: number;
} => {
  switch (animationType) {
    case "elastic":
      return { mass: 1, friction: 18, tension: 250 };

    case "stiff":
      return { mass: 1, friction: 18, tension: 350 };

    case "wooble":
      return { mass: 1, friction: 8, tension: 250 };

    case "ease":
    default:
      return { mass: 1, friction: 26, tension: 170 };
  }
};
