import { useRef } from 'react';
import { useInView, animate, useScroll } from 'react-ui-animate';

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
  const { inViewProgress } = useInView(ref);
  const { scrollYProgress } = useScroll(window, {
    target: ref,
    offset: ['start center', 'start start'],
  });

  return (
    <animate.div style={{ scale: scrollYProgress.to([0, 1], [1, 2]) }}>
      <animate.div
        ref={ref}
        style={{
          height: 300,
          width: 300,
          backgroundColor: color,
          opacity: inViewProgress,
          scale: inViewProgress,
          rotate: inViewProgress.to([0, 1], [-180, 0]),
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
