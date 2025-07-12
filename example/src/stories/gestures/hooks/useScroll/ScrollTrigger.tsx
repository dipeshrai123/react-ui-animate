import { useEffect, useRef } from 'react';
import { useScroll, animate } from 'react-ui-animate';

export default function IntersectionExample() {
  const containerRef = useRef(null);
  const targetRef = useRef(null);
  const { scrollXProgress } = useScroll(containerRef, {
    axis: 'x',
    target: targetRef,
    offset: ['start end', 'start start'],
  });

  useEffect(() => {
    scrollXProgress.subscribe((v) => console.log(v));
  }, [scrollXProgress]);

  return (
    <div
      style={{
        // display: 'flex',
        // width: '100vw',
        // height: 400,
        // outline: '10px solid red',
        padding: '0 200px',
      }}
    >
      <div
        ref={containerRef}
        style={{
          display: 'flex',
          flexWrap: 'nowrap',
          backgroundColor: '#3399ff',
          maxWidth: '100vw',
          overflowX: 'scroll',
          height: 400,
          padding: '20px 0',
        }}
      >
        <div style={{ width: '100vw', flexShrink: 0 }} />
        <animate.div
          ref={targetRef}
          style={{ width: '400px', backgroundColor: 'red', flexShrink: 0 }}
        />
        <div style={{ width: '100vw', flexShrink: 0 }} />
      </div>
    </div>
  );
}
