import React from 'react';
import { animate, useValues, withSpring } from 'react-ui-animate';

export const UseValues: React.FC = () => {
  const widths = useValues<number>([100, 200, 300]);

  return (
    <>
      <button
        onClick={() => {
          widths.values = widths.values.map((width) =>
            withSpring(width.current + 100)
          );
        }}
      >
        ANIMATE
      </button>
      {widths.values.map((width, index) => (
        <animate.div
          style={{
            width: width,
            height: 100,
            backgroundColor: 'red',
            left: 0,
            top: 0,
            border: '1px solid black',
          }}
        />
      ))}
    </>
  );
};
