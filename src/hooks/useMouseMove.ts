import * as React from "react";
import { MouseMoveEventType, Vector2 } from "../Types";
import { clamp } from "../Math";
import { useConst } from ".";
import { attachEvents } from "../controllers";

export function useMouseMove(callback: (event: MouseMoveEventType) => void) {
  const _VELOCITY_LIMIT = 20;

  const ref = React.useRef<any>(null);

  const callbackRef = useConst<(event: MouseMoveEventType) => void>(callback);
  const isMoving = React.useRef<boolean>(false);
  const _isMoving = React.useRef<number>(-1);
  const mouseXY = React.useRef<Vector2>({ x: 0, y: 0 });
  const prevMouseXY = React.useRef<Vector2>({ x: 0, y: 0 });
  const directionXY = React.useRef<Vector2>({ x: 0, y: 0 });
  const velocityXY = React.useRef<Vector2>({ x: 0, y: 0 });
  const currentEvent = React.useRef<MouseEvent>();
  const lastTimeStamp = React.useRef<number>(0);

  const handleCallback = () => {
    if (callbackRef) {
      callbackRef({
        target: currentEvent.current?.target,
        isMoving: isMoving.current,
        mouseX: mouseXY.current.x,
        mouseY: mouseXY.current.y,
        velocityX: velocityXY.current.x,
        velocityY: velocityXY.current.y,
        directionX: directionXY.current.x,
        directionY: directionXY.current.y,
      });
    }
  };

  React.useEffect(() => {
    const _refElement = ref.current;

    const mouseMove = (e: MouseEvent) => {
      const now: number = Date.now();
      const deltaTime = Math.min(now - lastTimeStamp.current, 64);
      lastTimeStamp.current = now;
      const t = deltaTime / 1000; // seconds

      mouseXY.current = { x: e.clientX, y: e.clientY };
      currentEvent.current = e;

      if (_isMoving.current !== -1) {
        isMoving.current = true;
        clearTimeout(_isMoving.current);
      }

      _isMoving.current = setTimeout(() => {
        isMoving.current = false;
        directionXY.current = { x: 0, y: 0 };
        velocityXY.current = { x: 0, y: 0 };

        handleCallback();
      }, 250); // Debounce 250 milliseconds

      const diffX = mouseXY.current.x - prevMouseXY.current.x;
      const diffY = mouseXY.current.y - prevMouseXY.current.y;

      directionXY.current = {
        x: Math.sign(diffX),
        y: Math.sign(diffY),
      };

      velocityXY.current = {
        x: clamp(diffX / t / 1000, -_VELOCITY_LIMIT, _VELOCITY_LIMIT),
        y: clamp(diffY / t / 1000, -_VELOCITY_LIMIT, _VELOCITY_LIMIT),
      };

      prevMouseXY.current = { x: mouseXY.current.x, y: mouseXY.current.y };

      handleCallback();
    };

    var subscribe: any;

    if (_refElement) {
      subscribe = attachEvents(_refElement, [["mousemove", mouseMove, false]]);
    } else {
      subscribe = attachEvents(window, [["mousemove", mouseMove, false]]);
    }

    return () => subscribe && subscribe();
  }, []);

  return () => ({ ref }); // ...bind()
}
