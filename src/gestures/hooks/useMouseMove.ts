import * as React from "react";

import { MouseMoveEventType } from "../types";
import { MouseMoveGesture } from "../controllers";
import { useRecognizer } from "./useRecognizer";

export function useMouseMove(callback: (event: MouseMoveEventType) => void) {
  const gesture = React.useRef(new MouseMoveGesture()).current;

  return useRecognizer([["move", gesture, callback]]);
}
