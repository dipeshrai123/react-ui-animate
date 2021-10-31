import * as React from "react";
import { WheelEventType, Vector2 } from "../Types";
import { clamp } from "../Math";
import { attachEvents } from "../controllers";

const LINE_HEIGHT = 40;
const PAGE_HEIGHT = 800;

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
  const previousMovementXY = React.useRef<Vector2>({
    x: 0,
    y: 0,
  });
  const deltaXY = React.useRef<Vector2>({
    x: 0,
    y: 0,
  });
  const direction = React.useRef<Vector2>({ x: 0, y: 0 });

  const lastTimeStamp = React.useRef<number>(0);
  const velocity = React.useRef<Vector2>({ x: 0, y: 0 });

  // Holds offsets
  const offset = React.useRef<Vector2>({ x: 0, y: 0 });
  const translation = React.useRef<Vector2>({ x: 0, y: 0 });

  const callbackRef = React.useRef<(event: WheelEventType) => void>(callback);

  const handleCallback: () => void = () => {
    if (callbackRef) {
      callbackRef.current({
        target: ref.current,
        isWheeling: isWheeling.current,
        deltaX: deltaXY.current.x,
        deltaY: deltaXY.current.y,
        directionX: direction.current.x,
        directionY: direction.current.y,
        movementX: movementXY.current.x,
        movementY: movementXY.current.y,
        offsetX: offset.current.x,
        offsetY: offset.current.y,
        velocityX: velocity.current.x,
        velocityY: velocity.current.y,
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
      let { deltaX, deltaY, deltaMode } = event;

      const now: number = Date.now();
      const deltaTime = Math.min(now - lastTimeStamp.current, 64);
      lastTimeStamp.current = now;
      const t = deltaTime / 1000; // seconds

      isWheeling.current = true;

      if (isWheelingID.current !== -1) {
        isWheeling.current = true;
        clearTimeout(isWheelingID.current);
      }

      isWheelingID.current = setTimeout(() => {
        isWheeling.current = false;
        translation.current = { x: offset.current.x, y: offset.current.y };
        handleCallback();

        velocity.current = { x: 0, y: 0 }; // Reset Velocity
        movementXY.current = { x: 0, y: 0 };
      }, 200);

      // normalize wheel values, especially for Firefox
      if (deltaMode === 1) {
        deltaX *= LINE_HEIGHT;
        deltaY *= LINE_HEIGHT;
      } else if (deltaMode === 2) {
        deltaX *= PAGE_HEIGHT;
        deltaY *= PAGE_HEIGHT;
      }

      deltaXY.current = { x: deltaX, y: deltaY };
      movementXY.current = {
        x: movementXY.current.x + deltaX,
        y: movementXY.current.y + deltaY,
      };
      offset.current = {
        x: translation.current.x + movementXY.current.x,
        y: translation.current.y + movementXY.current.y,
      };

      const diffX = movementXY.current.x - previousMovementXY.current.x;
      const diffY = movementXY.current.y - previousMovementXY.current.y;

      direction.current = {
        x: Math.sign(diffX),
        y: Math.sign(diffY),
      };

      velocity.current = {
        x: clamp(diffX / t / 1000, -20, 20),
        y: clamp(diffY / t / 1000, -20, 20),
      };

      previousMovementXY.current = {
        x: movementXY.current.x,
        y: movementXY.current.y,
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
