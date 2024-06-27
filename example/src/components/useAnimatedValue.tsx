import React from 'react';
import {
  useAnimatedValue,
  AnimatedBlock,
  AnimationConfigUtils,
  interpolate,
} from 'react-ui-animate';

export const UseAnimatedValue: React.FC = () => {
  const width = useAnimatedValue(100);

  return (
    <>
      <AnimatedBlock
        style={{
          width: width.value,
          height: 100,
          backgroundColor: '#3399ff',
          translateX: interpolate(width.value, [100, 500], [0, 100]),
        }}
      />

      <button
        onClick={() => {
          width.value = {
            toValue: 100,
            config: { ...AnimationConfigUtils.BOUNCE },
          };
        }}
      >
        LEFT
      </button>
      <button
        onClick={() => {
          width.value = {
            toValue: 500,
            config: { ...AnimationConfigUtils.POWER4 },
          };
        }}
      >
        RIGHT
      </button>
    </>
  );
};
