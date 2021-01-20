import * as React from "react";
import { ScrollEventType, Vector2 } from "../Types";
import { clamp } from "../Math";
import { useConst } from "./useConst";
import { attachEvents } from "../controllers";

export function useScroll(callback: (event: ScrollEventType) => void) {
  const ref = React.useRef<any>(null);

  const scrollXY = React.useRef<Vector2>({
    x: 0,
    y: 0,
  });
  const previousScrollXY = React.useRef<Vector2>({
    x: 0,
    y: 0,
  });
  const isScrolling = React.useRef<boolean>(false);
  const scrollDirection = React.useRef<Vector2>({ x: 0, y: 0 });
  const _isScrolling = React.useRef<number>(-1); // For checking scrolling and add throttle

  const lastTimeStamp = React.useRef<number>(0);
  const velocity = React.useRef<Vector2>({ x: 0, y: 0 });

  const callbackRef = useConst<(event: ScrollEventType) => void>(callback);

  const handleCallback: () => void = () => {
    if (callbackRef) {
      callbackRef({
        isScrolling: isScrolling.current,
        scrollX: scrollXY.current.x,
        scrollY: scrollXY.current.y,
        velocityX: velocity.current.x,
        velocityY: velocity.current.y,
        directionX: scrollDirection.current.x,
        directionY: scrollDirection.current.y,
      });
    }
  };

  React.useEffect(() => {
    const _refElement = ref.current;

    const scrollCallback = ({ x, y }: Vector2) => {
      const now: number = Date.now();
      const deltaTime = Math.min(now - lastTimeStamp.current, 64);
      lastTimeStamp.current = now;
      const t = deltaTime / 1000; // seconds

      scrollXY.current = { x, y };

      // Clear if scrolling
      if (_isScrolling.current !== -1) {
        isScrolling.current = true;
        clearTimeout(_isScrolling.current);
      }

      _isScrolling.current = setTimeout(() => {
        isScrolling.current = false;
        scrollDirection.current = { x: 0, y: 0 };

        // Reset Velocity
        velocity.current = { x: 0, y: 0 };

        handleCallback(); // Debounce 250milliseconds
      }, 250);

      const diffX = scrollXY.current.x - previousScrollXY.current.x;
      const diffY = scrollXY.current.y - previousScrollXY.current.y;

      scrollDirection.current = {
        x: Math.sign(diffX),
        y: Math.sign(diffY),
      };

      velocity.current = {
        x: clamp(diffX / t / 1000, -5, 5),
        y: clamp(diffY / t / 1000, -5, 5),
      };

      previousScrollXY.current = {
        x: scrollXY.current.x,
        y: scrollXY.current.y,
      };

      handleCallback();
    };

    const scrollListener: () => void = () => {
      const { pageYOffset: y, pageXOffset: x } = window;
      scrollCallback({ x, y });
    };

    const scrollElementListener: () => void = () => {
      const x = _refElement?.scrollLeft || 0;
      const y = _refElement?.scrollTop || 0;
      scrollCallback({ x, y });
    };

    var subscribe: any;
    if (_refElement) {
      subscribe = attachEvents(_refElement, [
        ["scroll", scrollElementListener, false],
      ]);
    } else {
      subscribe = attachEvents(window, [["scroll", scrollListener, false]]);
    }

    return () => subscribe && subscribe();
  }, []);

  return () => ({ ref }); // ...bind()
}
