import { useEffect, useRef } from 'react';
import {
  useInView,
  animate,
  useValue,
  withSequence,
  withDelay,
  withSpring,
} from 'react-ui-animate';

const COLORS = ['#e4a3f1', '#0b7c2d', '#ff1a5b'];

const Card = ({ i, color }: { i: number; color: string }) => {
  const ref = useRef<HTMLDivElement>(null);

  const { inView } = useInView(ref);
  const [progress, setProgress] = useValue(0);

  useEffect(() => {
    if (inView) {
      setProgress(withSequence([withDelay(i * 100), withSpring(1)]));
    } else {
      setProgress(withSpring(0));
    }
  }, [i, inView, setProgress]);

  return (
    <animate.div
      ref={ref}
      style={{
        height: 300,
        backgroundColor: color,
        opacity: progress,
        translateY: progress.to([0, 1], [200, 0]),
      }}
    />
  );
};

const Example = () => {
  return (
    <div>
      <h1>In View Example</h1>
      <div style={{ height: '100vh' }} />
      <div
        style={{
          display: 'grid',
          gap: 20,
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        }}
      >
        {COLORS.map((color, i) => (
          <Card key={i} i={i} color={color} />
        ))}
      </div>
      <div style={{ height: '100vh' }} />
    </div>
  );
};

export default Example;
