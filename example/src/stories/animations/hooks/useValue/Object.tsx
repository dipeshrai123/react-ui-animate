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
  const [obj, setObj] = useValue({ x: 0, y: 0, width: 100, height: 100 });

  return (
    <>
      <div className="button-group mb">
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
              withDecay(0.5, {
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
              withSequence(
                [
                  withSpring({ x: 100, y: 100 }),
                  withTiming({ width: 200, height: 200 }),
                  withDelay(1000),
                  withTiming({ x: 0, y: 0 }, { duration: 3000 }),
                  withDecay(0.5),
                ],
                {
                  onStart() {
                    console.log('obj sequence started');
                  },
                  onComplete() {
                    console.log('obj sequence completed');
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
            setObj(
              withLoop(
                withSequence([
                  withTiming({ x: 100 }),
                  withTiming({ y: 100 }),
                  withTiming({ x: 0 }),
                  withTiming({ y: 0 }),
                ]),
                5,
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
          Loop sequence
        </button>
        <button onClick={() => setObj({ x: 0, y: 0, width: 100, height: 100 })}>
          Immediate
        </button>
      </div>

      <animate.div
        style={{
          width: obj.width,
          height: 100,
          backgroundColor: 'teal',
          left: 0,
          top: 0,
          translateX: obj.x,
          translateY: obj.y,
          borderRadius: 4,
        }}
      />
    </>
  );
};

export default Example;
