import { useRef } from 'react';
import { useScroll, animate } from 'react-ui-animate';

export default function IntersectionExample() {
  const boxRef = useRef<HTMLDivElement>(null);

  const { scrollXProgress, scrollYProgress } = useScroll(window, {
    target: boxRef,
    offset: ['start end', 'start start'],
  });

  return (
    <div style={{ height: '200vh', paddingTop: '100vh' }}>
      <animate.div
        ref={boxRef}
        style={{
          width: 150,
          height: 150,
          margin: '0 auto',
          background: 'teal',
          borderRadius: 8,
          opacity: scrollYProgress,
          // opacity: scrollXProgress,
        }}
      />
    </div>
  );
}
