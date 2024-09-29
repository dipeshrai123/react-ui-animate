import React from 'react';
import {
  animate,
  useNewValue,
  withSpring,
  withTiming,
  withSequence,
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
          width.value = withSequence([
            withTiming(50, {
              duration: 5000,
              onStart: () => console.log('timing start'),
              onChange: () => console.log('timing change'),
              onRest: () => console.log('timing rest'),
            }),
            withSpring(0, {
              onStart: () => console.log('spring start'),
              onChange: () => console.log('spring change'),
              onRest: () => console.log('spring rest'),
            }),
          ]);
        }}
      >
        TIMING
      </button>
      <button
        onClick={() => {
          width.value = withSpring(200, { onRest: () => console.log('ok') });
        }}
      >
        SPRING
      </button>
    </>
  );
};
