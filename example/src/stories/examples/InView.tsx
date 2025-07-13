import { useEffect, useRef } from 'react';
import {
  useInView,
  useValue,
  animate,
  withSpring,
  useScroll,
} from 'react-ui-animate';

const COLORS = [
  '#e4a3f1',
  '#0b7c2d',
  '#ff1a5b',
  '#3f2d9e',
  '#aacb47',
  '#d01e8f',
  '#5b9df4',
  '#f4c610',
  '#7e3a21',
  '#12d8c3',
];

const Card = ({ i, color }: { i: number; color: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref);
  const { scrollYProgress } = useScroll(window, {
    target: ref,
    offset: ['start center', 'start start'],
  });
  const [progress, setProgress] = useValue(0);

  useEffect(() => {
    setProgress(withSpring(isInView ? 1 : 0));
  }, [isInView, setProgress]);

  return (
    <animate.div style={{ scale: scrollYProgress.to([0, 1], [1, 2]) }}>
      <animate.div
        ref={ref}
        style={{
          height: 300,
          width: 300,
          backgroundColor: color,
          opacity: progress,
          scale: progress,
          rotate: progress.to([0, 1], [-180, 0]),
        }}
      />
    </animate.div>
  );
};

const Example = () => {
  return (
    <div>
      <h1>In View Example</h1>
      <div style={{ height: '100vh' }} />
      {COLORS.map((color, i) => (
        <div
          key={i}
          style={{
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'sticky',
            top: 0,
            zIndex: 1,
          }}
        >
          <Card i={i} color={color} />
        </div>
      ))}
    </div>
  );
};

export default Example;
