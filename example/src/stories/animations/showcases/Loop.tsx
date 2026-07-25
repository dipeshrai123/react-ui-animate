import {
  animate,
  useValue,
  withTiming,
  withLoop,
  withSequence,
} from 'react-ui-animate';
import { ExampleLayout } from '../animations/shared';

const Example = () => {
  const [translateX, setTranslateX] = useValue(0);

  const handleClick = () => {
    setTranslateX(
      withSequence([
        withTiming(-20, { duration: 50 }),
        withLoop(
          withSequence([
            withTiming(20, {
              duration: 100,
            }),
            withTiming(-20, {
              duration: 100,
            }),
          ]),
          5
        ),
        withTiming(0, { duration: 50 }),
      ])
    );
  };

  return (
    <ExampleLayout
      title="Shake Animation Loop"
      description="Click the box to trigger a shake animation that loops 5 times. Demonstrates withLoop and withSequence for creating complex animation patterns."
      onRestart={() => setTranslateX(0)}
    >
      <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
        <animate.div
          onClick={handleClick}
          style={{
            width: 120,
            height: 120,
            backgroundColor: '#3399ff',
            borderRadius: 12,
            rotate: translateX,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(51, 153, 255, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          Click Me!
        </animate.div>
      </div>
    </ExampleLayout>
  );
};

export default Example;
