import * as React from "react";
import { WheelEventType, Vector2 } from "../Types";
// import { clamp } from "../Math";
import { attachEvents } from "../controllers";

export function useWheel(
  callback: (event: WheelEventType) => void,
  deps?: React.DependencyList
) {
  const ref = React.useRef<any>(null);

  const isWheeling = React.useRef<boolean>(false);
  const isWheelingID = React.useRef<number>(-1);
  const movementXY = React.useRef<Vector2>({
    x: 0,
    y: 0,
  });
  //   const previousMovementXY = React.useRef<Vector2>({
  //     x: 0,
  //     y: 0,
  //   });
  const deltaXY = React.useRef<Vector2>({
    x: 0,
    y: 0,
  });
  //   const direction = React.useRef<Vector2>({ x: 0, y: 0 });

  //   const lastTimeStamp = React.useRef<number>(0);
  //   const velocity = React.useRef<Vector2>({ x: 0, y: 0 });

  const callbackRef = React.useRef<(event: WheelEventType) => void>(callback);

  const handleCallback: () => void = () => {
    if (callbackRef) {
      callbackRef.current({
        isWheeling: isWheeling.current,
        deltaX: deltaXY.current.x,
        deltaY: deltaXY.current.y,
        directionX: 0,
        directionY: 0,
        movementX: movementXY.current.x,
        movementY: movementXY.current.y,
        offsetX: 0,
        offsetY: 0,
        velocityX: 0,
        velocityY: 0,
      });
    }
  };

  // Reinitiate callback when dependency change
  React.useEffect(() => {
    callbackRef.current = callback;

    return () => {
      callbackRef.current = () => false;
    };
  }, deps);

  React.useEffect(() => {
    const _refElement = ref.current;

    const wheelListener = (event: React.WheelEvent) => {
      const { deltaX, deltaY } = event;

      if (isWheelingID.current !== -1) {
        isWheeling.current = true;
        clearTimeout(isWheelingID.current);
      }

      isWheelingID.current = setTimeout(() => {
        isWheeling.current = false;
        handleCallback();
      }, 250);

      deltaXY.current = { x: deltaX, y: deltaY };
      movementXY.current = {
        x: movementXY.current.x + deltaX,
        y: movementXY.current.y + deltaY,
      };

      handleCallback();
    };

    var subscribe: any;
    if (_refElement) {
      subscribe = attachEvents(_refElement, [["wheel", wheelListener, false]]);
    }

    return () => subscribe && subscribe();
  }, []);

  return () => ({ ref }); // ...bind()
}
