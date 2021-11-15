import * as React from "react";

import { WheelEventType } from "../types";
import { WheelGesture } from "../controllers";
import { useRecognizer } from "./useRecognizer";

export function useWheel(callback: (event: WheelEventType) => void) {
  const gesture = React.useRef(new WheelGesture()).current;

  return useRecognizer(gesture, callback);
}
