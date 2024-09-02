import React from 'react';
import { useValue, animate, withSpring } from 'react-ui-animate';

export const UseValue: React.FC = () => {
  const width = useValue(100);

  return (
    <>
      <animate.div
        style={{
          width: width.value,
          height: 100,
          backgroundColor: 'red',
          left: 0,
          top: 0,
        }}
      />
      <button
        onClick={() => {
          width.value = withSpring(200);
        }}
      >
        Increase
      </button>
    </>
  );
};
