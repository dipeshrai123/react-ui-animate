import * as React from "react";
import { DragEventType, Vector2 } from "../Types";
import { clamp } from "../Math";
import { useConst } from "./useConst";
import { attachEvents } from "../controllers";

export function useDrag(callback: (event: DragEventType) => void) {
  const _VELOCITY_LIMIT = 20;

  const currentIndex = React.useRef<number | undefined>(undefined);
  const ref = React.useRef<any>(null);
  const elementRefs = React.useRef<Array<any>>([]);

  const callbackRef = useConst<(event: DragEventType) => void>(callback);

  const cancelRef = React.useRef<() => void>();

  const isGestureActive = React.useRef<boolean>(false);

  // Holds only movement - always starts from 0
  const movement = React.useRef<Vector2>({ x: 0, y: 0 });
  const movementStart = React.useRef<Vector2>({ x: 0, y: 0 });
  const previousMovement = React.useRef<Vector2>({ x: 0, y: 0 });

  // Holds offsets
  const translation = React.useRef<Vector2>({ x: 0, y: 0 });
  const offset = React.useRef<Vector2>({ x: 0, y: 0 });

  const lastTimeStamp = React.useRef<number>(0);
  const velocity = React.useRef<Vector2>({ x: 0, y: 0 });

  const handleCallback = () => {
    if (callbackRef) {
      callbackRef({
        args: [currentIndex.current],
        down: isGestureActive.current,
        movementX: movement.current.x,
        movementY: movement.current.y,
        offsetX: translation.current.x,
        offsetY: translation.current.y,
        velocityX: velocity.current.x,
        velocityY: velocity.current.y,
        distanceX: Math.abs(movement.current.x),
        distanceY: Math.abs(movement.current.y),
        directionX: Math.sign(movement.current.x),
        directionY: Math.sign(movement.current.y),
        cancel: function () {
          cancelRef.current && cancelRef.current();
        },
      });
    }
  };

  React.useEffect(() => {
    const _elemRef = ref.current;
    const _refElementsMultiple = elementRefs.current;

    var reSubscribe: any;

    const _initEvents = () => {
      if (_elemRef || _refElementsMultiple.length > 0) {
        reSubscribe = attachEvents(window, [
          ["mousedown", pointerDown, false],
          ["mousemove", pointerMove, false],
          ["touchstart", pointerDown, false],
          ["touchmove", pointerMove, false],
        ]);
      }
    };

    const _cancelEvents = () => {
      if (reSubscribe) {
        reSubscribe();
      }
    };

    const pointerDown = (e: any) => {
      if (e.type === "touchstart") {
        movementStart.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        };
      } else {
        movementStart.current = { x: e.clientX, y: e.clientY };
      }

      movement.current = { x: 0, y: 0 };
      offset.current = { x: translation.current.x, y: translation.current.y };
      previousMovement.current = { x: 0, y: 0 };
      velocity.current = { x: 0, y: 0 };

      // find current selected element
      const currElem = _refElementsMultiple.find(
        (elem) => elem.current === e.target
      );

      if (e.target === _elemRef || currElem) {
        isGestureActive.current = true;

        // set args
        if (currElem) {
          currentIndex.current = _refElementsMultiple.indexOf(currElem);
        }

        handleCallback();
      }
    };

    const pointerMove = (e: any) => {
      if (isGestureActive.current) {
        const now = Date.now();
        const deltaTime = Math.min(now - lastTimeStamp.current, 64);
        lastTimeStamp.current = now;

        const t = deltaTime / 1000;

        if (e.type === "touchmove") {
          movement.current = {
            x: e.touches[0].clientX - movementStart.current.x,
            y: e.touches[0].clientY - movementStart.current.y,
          };
        } else {
          movement.current = {
            x: e.clientX - movementStart.current.x,
            y: e.clientY - movementStart.current.y,
          };
        }

        translation.current = {
          x: offset.current.x + movement.current.x,
          y: offset.current.y + movement.current.y,
        };

        velocity.current = {
          x: clamp(
            (movement.current.x - previousMovement.current.x) / t / 1000,
            -_VELOCITY_LIMIT,
            _VELOCITY_LIMIT
          ),
          y: clamp(
            (movement.current.y - previousMovement.current.y) / t / 1000,
            -_VELOCITY_LIMIT,
            _VELOCITY_LIMIT
          ),
        };
        previousMovement.current = {
          x: movement.current.x,
          y: movement.current.y,
        };

        handleCallback();
      }
    };

    const pointerUp = () => {
      if (isGestureActive.current) {
        isGestureActive.current = false;
        velocity.current = { x: 0, y: 0 };
        handleCallback();
        _initEvents();
      }
    };

    var subscribe: any;
    if (_elemRef || _refElementsMultiple.length > 0) {
      subscribe = attachEvents(window, [
        ["mousedown", pointerDown, false],
        ["mousemove", pointerMove, false],
        ["mouseup", pointerUp, false],
        ["touchstart", pointerDown, false],
        ["touchmove", pointerMove, false],
        ["touchend", pointerUp, false],
      ]);
    }

    cancelRef.current = _cancelEvents;

    return () => subscribe && subscribe();
  }, []);

  return (index?: number) => {
    if (index === null || index === undefined) {
      return { ref };
    } else {
      elementRefs.current[index] =
        elementRefs.current[index] || React.createRef();

      return { ref: elementRefs.current[index] };
    }
  };
}
