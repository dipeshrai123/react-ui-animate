import React, { useRef, useState } from 'react';
import { useValue, animate, useDrag, withSpring } from 'react-ui-animate';

export const Draggable = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [translateX, setTranslateX] = useValue(0);
  const [enabled, setEnabled] = useState(true);

  useDrag(ref, ({ down, movement }) => {
    if (enabled) {
      setTranslateX(down ? withSpring(movement.x) : withSpring(0));
    }
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
        <div
          onClick={() => {
            console.log('clicked');
          }}
          style={{ height: 1000 }}
        />
      </animate.div>
    </>
  );
};
