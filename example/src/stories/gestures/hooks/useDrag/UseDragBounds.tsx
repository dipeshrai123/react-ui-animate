import { useRef } from 'react';
import { animate, useDrag } from 'react-ui-animate';

const Example = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  const elastic = useDrag(boxRef, {
    bounds: containerRef,
    elastic: true,
  });

  return (
    <div style={{ padding: 40 }}>
      <h1 style={{ marginBottom: 10 }}>useDrag with Bounds</h1>
      <p style={{ marginBottom: 30, color: '#666' }}>
        <code>bounds</code> can be a container ref — the drag is constrained
        to it, with a rubber-band feel past the edges (<code>elastic</code>).
        Momentum on release is clamped to the same bounds.
      </p>

      <div
        ref={containerRef}
        style={{
          position: 'relative',
          width: '100%',
          height: 280,
          border: '2px dashed #ddd',
          borderRadius: 12,
          overflow: 'hidden',
          backgroundColor: '#fafafa',
        }}
      >
        <animate.div
          ref={boxRef}
          style={{
            position: 'absolute',
            left: 20,
            top: 20,
            width: 100,
            height: 100,
            backgroundColor: elastic.isDragging ? '#2980d9' : '#3399ff',
            borderRadius: 12,
            boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
            cursor: elastic.isDragging ? 'grabbing' : 'grab',
            translateX: elastic.x,
            translateY: elastic.y,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: 13,
            fontWeight: 600,
            userSelect: 'none',
          }}
        >
          Elastic
        </animate.div>
      </div>

      <p style={{ marginTop: 10, fontSize: 12, color: '#999' }}>
        Try dragging past the container's edge — it resists instead of
        stopping dead, then springs back when you let go.
      </p>
    </div>
  );
};

export default Example;
