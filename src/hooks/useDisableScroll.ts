import { useEffect } from "react";

export const useDisableScroll = (shouldDisable: boolean) => {
  useEffect(() => {
    document.body.style.overflow = shouldDisable ? "hidden" : "auto";
  }, [shouldDisable]);
};
