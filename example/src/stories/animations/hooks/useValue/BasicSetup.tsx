import React from 'react';
import {
  animate,
  useValue,
  withSpring,
  withTiming,
  withDecay,
  withSequence,
  withLoop,
  withDelay,
} from 'react-ui-animate';

const Example: React.FC = () => {
  const [x, setX] = useValue(0);

  return (
    <>
      <div className="button-group mb">
        <button onClick={() => setX(withTiming(0))}>Timing to 0</button>
        <button onClick={() => setX(withSpring(100))}>Spring to 100</button>
        <button
          onClick={() =>
            setX(
              withLoop(withSpring(100), 5, {
                onStart() {
                  console.log('Loop started');
                },
                onComplete() {
                  console.log('Loop completed');
                },
              })
            )
          }
        >
          Loop 0 to 100
        </button>
        <button onClick={() => setX(withDecay(1))}>Decay</button>
        <button
          onClick={() =>
            setX(
              withSequence(
                [
                  withSpring(100),
                  withDelay(2000),
                  withTiming(200),
                  withDecay(1),
                ],
                {
                  onStart() {
                    console.log('primitive sequence started');
                  },
                  onComplete() {
                    console.log('Primitive sequence completed');
                  },
                }
              )
            )
          }
        >
          Sequence
        </button>
        <button onClick={() => setX(0)}>Immediate to 0</button>
      </div>
      <animate.div
        style={{
          width: 100,
          height: 100,
          backgroundColor: 'teal',
          left: 0,
          top: 0,
          translateX: x,
          borderRadius: 4,
        }}
      />
    </>
  );
};

export default Example;
