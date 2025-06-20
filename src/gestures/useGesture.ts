import * as React from 'react';
import {
  DragGesture,
  MouseMoveGesture,
  ScrollGesture,
  WheelGesture,
} from './controllers';
import {
  DragEventType,
  WheelEventType,
  ScrollEventType,
  MouseMoveEventType,
} from './types';
import { useRecognizer } from './useRecognizer';

export function useGesture({
  onDrag,
  onWheel,
  onScroll,
  onMouseMove,
}: {
  onDrag?: (event: DragEventType) => void;
  onWheel?: (event: WheelEventType) => void;
  onScroll?: (event: ScrollEventType) => void;
  onMouseMove?: (event: MouseMoveEventType) => void;
}) {
  const dragGesture = React.useRef(new DragGesture()).current;
  const wheelGesture = React.useRef(new WheelGesture()).current;
  const scrollGesture = React.useRef(new ScrollGesture()).current;
  const mouseMoveGesture = React.useRef(new MouseMoveGesture()).current;

  return useRecognizer([
    ['drag', dragGesture, onDrag],
    ['wheel', wheelGesture, onWheel],
    ['scroll', scrollGesture, onScroll],
    ['move', mouseMoveGesture, onMouseMove],
  ]);
}
