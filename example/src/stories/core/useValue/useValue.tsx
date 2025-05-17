import React from 'react';
import {
  animate,
  useValue,
  withSpring,
  withTiming,
  withSequence,
} from 'react-ui-animate';

export const UseValue: React.FC = () => {
  const width = useValue<number>(100);

  return (
    <>
      <button
        onClick={() => {
          width.value = withSequence([withTiming(100), withSpring(0)]);
        }}
      >
        SEQUENCE ( 100 to 0 )
      </button>
      <button
        onClick={() => {
          width.value = withSpring(200);
        }}
      >
        SPRING ( to 200 )
      </button>
      <button
        onClick={() => {
          width.value = 400;
        }}
      >
        NATIVE UPDATE
      </button>

      <button
        onClick={() => {
          width.value = withSpring(width.currentValue + 100);
        }}
      >
        UPDATING PREVIOUS VALUE
      </button>

      <animate.div
        style={{
          width: width.value,
          height: 100,
          backgroundColor: 'red',
          left: 0,
          top: 0,
        }}
      />
    </>
  );
};
