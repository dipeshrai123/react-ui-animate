import React from 'react';
import {
  useAnimatedValue,
  AnimatedBlock,
  ValueType,
  AnimationConfigUtils,
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
          // translateX: width.value,
        }}
      />

      <button
        onClick={() => {
          const value: ValueType = {
            toValue: Math.random() * 500 + 100,
            config: {
              ...AnimationConfigUtils.BOUNCE,
            },
          };

          width.value = value;
        }}
      >
        ANIMATE ME
      </button>
    </>
  );
};
