import React from 'react';
import {
  animate,
  useNewValue,
  withSpring,
  withTiming,
  AnimationConfig,
} from 'react-ui-animate';

export const UseValue: React.FC = () => {
  const width = useNewValue(100);

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
          width.value = withTiming(50);
        }}
      >
        TIMING
      </button>
      <button
        onClick={() => {
          width.value = withSpring(200, AnimationConfig.Spring.ELASTIC);
        }}
      >
        SPRING
      </button>
    </>
  );
};
