import React from 'react';
import {
  animate,
  useValue,
  withSpring,
  withTiming,
  withSequence,
} from 'react-ui-animate';

export const UseValue: React.FC = () => {
  const [width, setWidth] = useValue(100);
  const [backgroundColor, setBackgroundColor] = useValue('black');

  return (
    <>
      <button onClick={() => setBackgroundColor(withSpring('red'))}>
        Change to Red
      </button>
      <button
        onClick={() =>
          setBackgroundColor(withTiming('#3399ff', { duration: 5000 }))
        }
      >
        Change to #3399ff
      </button>

      <animate.div
        style={{
          width: 100,
          height: 100,
          backgroundColor: backgroundColor,
        }}
      />

      <button
        onClick={() => {
          setWidth(withSequence([withTiming(100), withSpring(0)]));
        }}
      >
        SEQUENCE ( 100 to 0 )
      </button>
      <button
        onClick={() => {
          setWidth(withSpring(200));
        }}
      >
        SPRING ( to 200 )
      </button>
      <button
        onClick={() => {
          setWidth(400);
        }}
      >
        IMMEDIATE UPDATE (400)
      </button>

      <animate.div
        style={{
          width,
          height: 100,
          backgroundColor: 'red',
          left: 0,
          top: 0,
        }}
      />
    </>
  );
};
