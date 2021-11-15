import * as React from "react";

import { DragEventType, UseDragConfig } from "../types";
import { DragGesture } from "../controllers";
import { useRecognizer } from "./useRecognizer";

export function useDrag(
  callback: (event: DragEventType) => void,
  config?: UseDragConfig
) {
  const gesture = React.useRef(new DragGesture()).current;

  return useRecognizer([["drag", gesture, callback, config]]);
}
