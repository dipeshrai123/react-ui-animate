import React from 'react';
import { useAnimatedValue, AnimatedBlock } from 'react-ui-animate';

export const UseAnimatedValue: React.FC = () => {
  // const width = useAnimatedValue(100);
  const bg = useAnimatedValue('position');

  return (
    <>
      <AnimatedBlock
        style={{
          width: 100,
          height: 100,
          backgroundColor: 'red',
          position: bg.value,
          left: 0,
          top: 0,
          opacity: 0.4,
        }}
      />
      <button onClick={() => (bg.value = 'absolute')}>MAKE BOX ABSOLUTE</button>
      {/* <button onClick={() => (bg.value = '#00ff00')}>Green</button> */}

      {/* <div style={{ perspective: 200 }}>
        <AnimatedBlock
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
