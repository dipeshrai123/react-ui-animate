import * as React from "react";
import ResizeObserver from "resize-observer-polyfill";
import {
  MeasurementType,
  WindowDimensionType,
  ScrollEventType,
  DragEventType,
  Vector2,
} from "./Types";
import { clamp } from "./Math";

export const useOutsideClick = (
  elementRef: React.RefObject<HTMLElement>,
  callback: (event: MouseEvent) => void
) => {
  const callbackRef = React.useRef<(e: MouseEvent) => void>();

  if (!callbackRef.current) {
    callbackRef.current = callback;
  }

  React.useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        !elementRef?.current?.contains(e.target as Element) &&
        callbackRef.current
      ) {
        callbackRef.current(e);
      }
    };

    if (callbackRef.current) {
      document.addEventListener("click", handleOutsideClick, true);
    }

    return () => {
      if (callbackRef.current) {
        document.addEventListener("click", handleOutsideClick, true);
      }
    };
  }, [callbackRef.current, elementRef]);
};

export const useMeasure = (callback: (event: MeasurementType) => void) => {
  const ref = React.useRef(null);
  const elementRefs = React.useRef([]);
  const callbackRef = React.useRef<(event: MeasurementType) => void>();

  if (!callbackRef.current) {
    callbackRef.current = callback;
  }

  React.useEffect(() => {
    const _refElement = ref.current || document.documentElement;
    const _refElementsMultiple = elementRefs.current;

    const resizeObserver = new ResizeObserver(([entry]) => {
      const { left, top, width, height } = entry.target.getBoundingClientRect();
      const { pageXOffset, pageYOffset } = window;

      if (callbackRef.current) {
        callbackRef.current({
          left: left + pageXOffset,
          top: top + pageYOffset,
          width,
          height,
          vLeft: left,
          vTop: top,
        });
      }
    });

    const resizeObserverMultiple = new ResizeObserver((entries) => {
      const left: Array<number> = [];
      const top: Array<number> = [];
      const width: Array<number> = [];
      const height: Array<number> = [];
      const vLeft: Array<number> = [];
      const vTop: Array<number> = [];

      entries.forEach((entry) => {
        const {
          left: _left,
          top: _top,
          width: _width,
          height: _height,
        } = entry.target.getBoundingClientRect();
        const { pageXOffset, pageYOffset } = window;
        const _pageLeft = _left + pageXOffset;
        const _pageTop = _top + pageYOffset;

        left.push(_pageLeft);
        top.push(_pageTop);
        width.push(_width);
        height.push(_height);
        vLeft.push(_left);
        vTop.push(_top);
      });

      if (callbackRef.current) {
        callbackRef.current({
          left,
          top,
          width,
          height,
          vLeft,
          vTop,
        });
      }
    });

    if (_refElement) {
      if (
        _refElement === document.documentElement &&
        _refElementsMultiple.length > 0
      ) {
        _refElementsMultiple.forEach((element: any) => {
          resizeObserverMultiple.observe(element.current);
        });
      } else {
        resizeObserver.observe(_refElement);
      }
    }

    return () => {
      if (_refElement) {
        if (
          _refElement === document.documentElement &&
          _refElementsMultiple.length > 0
        ) {
          _refElementsMultiple.forEach((element: any) => {
            resizeObserverMultiple.unobserve(element.current);
          });
        } else {
          resizeObserver.unobserve(_refElement);
        }
      }
    };
  }, []);

  return (index: number) => {
    if (index === null || index === undefined) {
      return { ref };
    } else {
      elementRefs.current[index] =
        elementRefs.current[index] || React.createRef();

      return { ref: elementRefs.current[index] };
    }
  }; // ...bind() or ...bind(index) for multiple
};

export const useWindowDimension = (
  callback: (event: WindowDimensionType) => void
) => {
  const windowDimensionsRef = React.useRef<WindowDimensionType>({
    width: 0,
    height: 0,
  });
  const callbackRef = React.useRef<(event: WindowDimensionType) => void>();

  if (!callbackRef.current) {
    callbackRef.current = callback;
  }

  const handleCallback: () => void = () => {
    if (callbackRef.current) {
      callbackRef.current({
        ...windowDimensionsRef.current,
      });
    }
  };

  React.useEffect(() => {
    const resizeObserver = new ResizeObserver(([entry]) => {
      const { clientWidth, clientHeight } = entry.target;

      windowDimensionsRef.current = {
        width: clientWidth,
        height: clientHeight,
      };

      handleCallback();
    });

    resizeObserver.observe(document.documentElement);

    return () => resizeObserver.unobserve(document.documentElement);
  }, []);
};

export const useScroll = (callback: (event: ScrollEventType) => void) => {
  const ref = React.useRef<HTMLElement>(null);

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

  const callbackRef = React.useRef<(event: ScrollEventType) => void>();

  if (!callbackRef.current) {
    callbackRef.current = callback;
  }

  const handleCallback: () => void = () => {
    if (callbackRef.current) {
      callbackRef.current({
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

        handleCallback(); // Throttle 250milliseconds
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

    if (_refElement) {
      _refElement.addEventListener("scroll", scrollElementListener);
    } else {
      window.addEventListener("scroll", scrollListener);
    }

    return () => {
      if (_refElement) {
        _refElement.removeEventListener("scroll", scrollElementListener);
      } else {
        window.removeEventListener("scroll", scrollListener);
      }
    };
  }, []);

  return () => ({ ref }); // ...bind()
};

export const useDrag = (callback: (event: DragEventType) => void) => {
  const _VELOCITY_LIMIT = 10;

  const elemRef = React.useRef(null);

  const callbackRef = React.useRef<(event: DragEventType) => void>();
  if (!callbackRef.current) {
    callbackRef.current = callback;
  }

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
    if (callbackRef.current) {
      callbackRef.current({
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
    const _elemRef = elemRef.current;

    const _initEvents = () => {
      if (_elemRef) {
        window.addEventListener("mousedown", pointerDown, false);
        window.addEventListener("mousemove", pointerMove, false);

        window.addEventListener("touchstart", pointerDown, false);
        window.addEventListener("touchmove", pointerMove, false);
      }
    };

    const _cancelEvents = () => {
      if (_elemRef) {
        window.removeEventListener("mousedown", pointerDown, false);
        window.removeEventListener("mousemove", pointerMove, false);

        window.removeEventListener("touchstart", pointerDown, false);
        window.removeEventListener("touchmove", pointerMove, false);
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

      if (e.target === _elemRef) {
        isGestureActive.current = true;
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

    if (_elemRef) {
      window.addEventListener("mousedown", pointerDown, false);
      window.addEventListener("mousemove", pointerMove, false);
      window.addEventListener("mouseup", pointerUp, false);

      window.addEventListener("touchstart", pointerDown, false);
      window.addEventListener("touchmove", pointerMove, false);
      window.addEventListener("touchend", pointerUp, false);
    }

    cancelRef.current = _cancelEvents;

    return () => {
      if (_elemRef) {
        window.removeEventListener("mousedown", pointerDown, false);
        window.removeEventListener("mousemove", pointerMove, false);
        window.removeEventListener("mouseup", pointerUp, false);

        window.removeEventListener("touchstart", pointerDown, false);
        window.removeEventListener("touchmove", pointerMove, false);
        window.removeEventListener("touchend", pointerUp, false);
      }
    };
  }, []);

  return () => {
    return {
      ref: elemRef,
    };
  };
};
