import React from 'react';
import { useAnimatedValue, animate } from 'react-ui-animate';

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
          opacity: 0.4,
        }}
      />
      <button onClick={() => (width.value = 100)}>MAKE BOX ABSOLUTE</button>
      {/* <button onClick={() => (bg.value = '#00ff00')}>Green</button> */}

      {/* <div style={{ perspective: 200 }}>
        <animate.div
          style={{
            perspective: 400,
            width: width.value,
            height: 100,
            backgroundColor: interpolate(
              width.value,
              [100, 500],
              ['#3399ff', 'red']
            ),
            translateX: interpolate(width.value, [100, 500], [0, 200]),
            rotateX: interpolate(width.value, [100, 500], [0, 45]),
          }}
        />
      </div>

      <button
        onClick={() => {
          width.value = 100;
        }}
      >
        LEFT
      </button>
      <button
        onClick={() => {
          width.value = 500;
        }}
      >
        RIGHT
      </button> */}
    </>
  );
};
