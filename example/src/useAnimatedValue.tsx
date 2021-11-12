import React from "react";
import { useAnimatedValue, AnimatedBlock } from "react-ui-animate";

export const UseAnimatedValue: React.FC = () => {
  const width = useAnimatedValue(100);

  return (
    <>
      <AnimatedBlock
        style={{
          width: width.value,
          height: 100,
          backgroundColor: "#3399ff",
          translateX: width.value,
        }}
      />

      <button
        onClick={() => {
          width.value = 100 + Math.random() * 300;
        }}
      >
        ANIMATE ME
      </button>
    </>
  );
};
