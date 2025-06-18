import React from 'react';
import { animate, __experimental } from 'react-ui-animate';

const {
  useValue,
  withSpring,
  withTiming,
  withDecay,
  withSequence,
  withLoop,
  withDelay,
} = __experimental;

export const UseValue: React.FC = () => {
  const [x, setX] = useValue(0);
  const [bg, setBg] = useValue('red');
  const [values, setValues] = useValue([100, 200, 300]);
  const [obj, setObj] = useValue({ x: 0, y: 0, width: 100, height: 100 });

  return (
    <>
      <button onClick={() => setX(withSpring(100))}>Spring 100</button>
      <button onClick={() => setX(withTiming(0))}>Timing 0</button>
      <button onClick={() => setX(withLoop(withSpring(100), 5))}>
        Loop 0 to 100
      </button>
      <button onClick={() => setX(withDecay(1))}>Decay</button>
      <button
        onClick={() =>
          setX(
            withSequence([
              withSpring(100),
              withDelay(2000),
              withTiming(200),
              withDecay(1),
            ])
          )
        }
      >
        Sequence
      </button>
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
      <button onClick={() => setValues(withLoop(withSpring([0, 100, 200]), 3))}>
        Loop Values
      </button>
      <button onClick={() => setValues(withDecay(1))}>Decay Values</button>
      <button
        onClick={() =>
          setValues(
            withSequence([
              withTiming([100, 200, 300]),
              withSpring([0, 0, 0]),
              withDecay(0.5),
            ])
          )
        }
      >
        Sequence Values
      </button>
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
          setObj(
            withSpring(
              { x: 100, y: 100, width: 200, height: 200 },
              {
                onStart: () => console.log('START'),
                onComplete: () => console.log('Animation complete'),
              }
            )
          )
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
                onComplete: () => console.log('Animation complete'),
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
              onComplete: () => console.log('Animation complete'),
            })
          )
        }
      >
        Decay
      </button>
      <button
        onClick={() =>
          setObj(
            withSequence([
              withSpring({ x: 100, y: 100 }),
              withTiming({ width: 200, height: 200 }),
              withDelay(4000),
              withTiming({ x: 0, y: 0 }, { duration: 3000 }),
              withDecay(0.5),
            ])
          )
        }
      >
        Sequence
      </button>
      <button
        onClick={() =>
          setObj(
            withLoop(
              withSequence([
                withTiming({ x: 100 }),
                withTiming({ y: 100 }),
                withTiming({ x: 0 }),
                withTiming({ y: 0 }),
              ]),
              5
            )
          )
        }
      >
        Loop
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
