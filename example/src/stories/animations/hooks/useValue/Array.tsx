import React from 'react';
import {
  animate,
  useValue,
  withSpring,
  withTiming,
  withDecay,
  withSequence,
  withLoop,
} from 'react-ui-animate';

const Example: React.FC = () => {
  const [values, setValues] = useValue([0, 100, 200]);

  return (
    <>
      <div className="button-group mb">
        <button onClick={() => setValues(withSpring([0, 100, 200]))}>
          Spring
        </button>
        <button onClick={() => setValues(withTiming([100, 200, 300]))}>
          Timing
        </button>
        <button onClick={() => setValues(withDecay(1))}>Decay</button>
        <button
          onClick={() =>
            setValues(
              withSequence(
                [
                  withTiming([100, 200, 300]),
                  withSpring([0, 0, 0]),
                  withDecay(0.5),
                ],
                {
                  onStart() {
                    console.log('array sequence started');
                  },
                  onComplete() {
                    console.log('array sequence completed');
                  },
                }
              )
            )
          }
        >
          Sequence
        </button>
        <button
          onClick={() =>
            setValues(
              withLoop(
                withSequence([
                  withTiming([0, 0, 0]),
                  withTiming([200, 100, 50]),
                  withDecay(0.5),
                ]),
                3,
                {
                  onStart() {
                    console.log('Loop started');
                  },
                  onComplete() {
                    console.log('Loop completed');
                  },
                }
              )
            )
          }
        >
          Sequence inside Loop
        </button>
        <button onClick={() => setValues([0, 0, 0])}>Immediate</button>
      </div>

      {values.map((value, index) => (
        <animate.div
          className="mb"
          key={index}
          style={{
            width: 100,
            height: 100,
            backgroundColor: 'teal',
            left: 0,
            top: 0,
            translateX: value,
            borderRadius: 4,
          }}
        />
      ))}
    </>
  );
};

export default Example;
