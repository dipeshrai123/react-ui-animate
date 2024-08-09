import React from 'react';
import { useAnimatedValue, animate, withSpring } from 'react-ui-animate';

export const UseAnimatedValue: React.FC = () => {
  const width = useAnimatedValue(100);

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
