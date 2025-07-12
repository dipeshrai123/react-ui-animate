import { useRef } from 'react';
import { useScroll, animate } from 'react-ui-animate';

export default function IntersectionExample() {
  const boxRef = useRef(null);
  const { scrollYProgress } = useScroll(window, {
    target: boxRef,
    offset: ['center', 'start'],
  });

  return (
    <div>
      <div style={{ height: '300vh', paddingTop: '100vh' }}>
        <animate.div
          ref={boxRef}
          style={{
            width: 150,
            height: 150,
            margin: '0 auto',
            background: 'teal',
            borderRadius: 8,
            // position: 'sticky',
            // top: 0,
            // opacity: scrollYProgress,
            rotate: scrollYProgress.to([0, 1], [0, 180]),
          }}
        />
      </div>
    </div>
  );
}
