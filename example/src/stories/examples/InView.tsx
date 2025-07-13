import { useEffect, useRef } from 'react';
import { useInView, useValue, animate, withSpring } from 'react-ui-animate';

const Card = ({ i }: { i: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref);
  const [progress, setProgress] = useValue(0);

  useEffect(() => {
    setProgress(withSpring(isInView ? 1 : 0));
  }, [isInView, setProgress]);

  return (
    <animate.div
      ref={ref}
      style={{
        height: 300,
        width: 300,
        backgroundColor: '#3399ff',
        opacity: progress,
        scale: progress,
        rotate: progress.to([0, 1], [-180, 0]),
      }}
    />
  );
};

const Example = () => {
  return (
    <div>
      <h1>In View Example</h1>
      <div style={{ height: '100vh' }} />
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          style={{
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Card i={i} />
        </div>
      ))}
    </div>
  );
};

export default Example;
