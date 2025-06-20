import React, { useRef, useState } from 'react';
import {
  useValue,
  animate,
  __experimental__,
  withSpring,
} from 'react-ui-animate';

const { useDrag, useScroll, useWheel } = __experimental__;

export const Draggable = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [translateX, setTranslateX] = useValue(0);
  const [enabled, setEnabled] = useState(true);

  // useDrag(
  //   ref,
  //   ({ down, movement }) => {
  //     if (enabled) {
  //       setTranslateX(down ? withSpring(movement.x) : withSpring(0));
  //     }
  //   },
  //   { threshold: 100 }
  // );

  // useScroll(
  //   ref,
  //   ({ velocity }) => {
  //     console.log(velocity);
  //   },
  //   { velocityLimit: 20 }
  // );

  useWheel(ref, (obj) => {
    console.log(obj);
  });

  return (
    <>
      <button onClick={() => setEnabled((p) => !p)}>
        {enabled ? 'Enabled' : 'Disabled'}
      </button>
      <animate.div
        ref={ref}
        style={{
          width: 100,
          height: 100,
          backgroundColor: '#3399ff',
          translateX,
          overflowY: 'scroll',
        }}
      >
        <div style={{ height: 1000 }} />
      </animate.div>
    </>
  );
};
