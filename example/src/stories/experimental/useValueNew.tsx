import React from 'react';
import { animate, __experimental } from 'react-ui-animate';

const { useValue, withSpring, withTiming, withDecay } = __experimental;

export const UseValue: React.FC = () => {
  const [x, setX] = useValue(0);
  const [bg, setBg] = useValue('red');
  const [values, setValues] = useValue([100, 200, 300]);
  const [obj, setObj] = useValue({ x: 0, y: 0, width: 100, height: 100 });

  return (
    <>
      <button onClick={() => setX(withSpring(100))}>Spring 100</button>
      <button onClick={() => setX(withTiming(0))}>Timing 0</button>
      <button onClick={() => setX(withDecay(1))}>Decay</button>
      <button onClick={() => setX(200)}>Immediate</button>
      <animate.div
        style={{
          width: 100,
          height: 100,
          backgroundColor: 'red',
          left: 0,
          top: 0,
          translateX: x,
        }}
      />

      <button onClick={() => setBg(withSpring('blue'))}>Spring Blue</button>
      <button onClick={() => setBg(withTiming('red', { duration: 2000 }))}>
        Timing Red
      </button>
      <button onClick={() => setBg('yellow')}>Immediate Yellow</button>
      <animate.div
        style={{
          width: 100,
          height: 100,
          backgroundColor: bg,
          left: 0,
          top: 0,
        }}
      />

      <button onClick={() => setValues(withSpring([0, 100, 200]))}>
        Spring Values
      </button>
      <button onClick={() => setValues(withTiming([100, 200, 300]))}>
        Timing Values
      </button>
      <button onClick={() => setValues(withDecay(1))}>Decay Values</button>
      <button onClick={() => setValues([0, 0, 0])}>Immediate</button>
      {values.map((value, index) => (
        <animate.div
          key={index}
          style={{
            width: 100,
            height: 100,
            backgroundColor: 'red',
            left: 0,
            top: 0,
            translateX: value,
          }}
        />
      ))}

      <button
        onClick={() =>
          setObj(withSpring({ x: 100, y: 100, width: 200, height: 200 }))
        }
      >
        Spring
      </button>
      <button
        onClick={() =>
          setObj(
            withTiming(
              { x: 0, y: 0, width: 300, height: 100 },
              {
                onStart: () => console.log('START'),
                onRest: () => console.log('Animation complete'),
              }
            )
          )
        }
      >
        Timing
      </button>
      <button
        onClick={() =>
          setObj(
            withDecay(1, {
              onStart: () => console.log('START'),
              onRest: () => console.log('Animation complete'),
            })
          )
        }
      >
        Decay
      </button>
      <button onClick={() => setObj({ x: 0, y: 0, width: 100, height: 100 })}>
        Immediate
      </button>
      <animate.div
        style={{
          width: obj.width,
          height: 100,
          backgroundColor: 'red',
          left: 0,
          top: 0,
          translateX: obj.x,
          translateY: obj.y,
        }}
      />
    </>
  );
};
