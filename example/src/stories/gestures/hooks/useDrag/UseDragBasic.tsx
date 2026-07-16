import { useRef } from 'react';
import { animate, useDrag } from 'react-ui-animate';

const Example = () => {
  const cardRef = useRef<HTMLDivElement>(null);
  const { x, y, isDragging } = useDrag(cardRef);

  return (
    <div style={{ padding: 40 }}>
      <h1 style={{ marginBottom: 10 }}>useDrag Hook</h1>
      <p style={{ marginBottom: 30, color: '#666' }}>
        Wires up Pan + momentum in one hook. Position persists between drags
        — drop it and drag again, it continues from where it settled.
      </p>

      <div
        style={{
          position: 'relative',
          width: '100%',
          height: 320,
          border: '2px dashed #ddd',
          borderRadius: 12,
          overflow: 'hidden',
        }}
      >
        <animate.div
          ref={cardRef}
          style={{
            position: 'absolute',
            left: 40,
            top: 40,
            width: 140,
            height: 100,
            backgroundColor: isDragging ? '#2980d9' : '#3399ff',
            borderRadius: 12,
            boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
            cursor: isDragging ? 'grabbing' : 'grab',
            translateX: x,
            translateY: y,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 600,
            userSelect: 'none',
          }}
        >
          Drag + Fling
        </animate.div>
      </div>
      <p style={{ marginTop: 10, fontSize: 12, color: '#999' }}>
        Flick it and release — momentum carries it on with the release
        velocity.
      </p>
    </div>
  );
};

export default Example;
