import React from 'react';
import { animate, useNewValue, withSpring } from 'react-ui-animate';

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
          width.value = withSpring(200, {
            onStart: (v) => console.log('start', v),
            onChange: (v) => console.log('change', v),
            onRest: (v) => console.log('rest', v),
          });
        }}
      >
        Increase
      </button>
    </>
  );
};
