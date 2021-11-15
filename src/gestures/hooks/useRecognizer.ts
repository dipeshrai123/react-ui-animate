/* eslint-disable react-hooks/exhaustive-deps */
import * as React from "react";

export const useRecognizer = (gesture: any, callback: any, config?: any) => {
  const ref = React.useRef<any>();
  const elementRefs = React.useRef<Array<any>>([]);
  const subscribe = React.useRef<any>(null);

  React.useEffect(() => {
    gesture.applyCallback(callback);
  }, [callback]);

  React.useEffect(() => {
    subscribe.current = gesture.applyGesture({
      targetElement: ref.current,
      targetElements: elementRefs.current,
      callback,
      config,
    });

    return () => subscribe.current && subscribe.current();
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
};
