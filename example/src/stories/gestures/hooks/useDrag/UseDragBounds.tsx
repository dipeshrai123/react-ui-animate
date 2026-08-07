import { useRef } from 'react';
import { animate, useDrag } from 'react-ui-animate';
import { ExampleLayout, ExampleCard, theme } from '../../../animations/shared';

const Example = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  const elastic = useDrag(boxRef, {
    bounds: containerRef,
    elastic: true,
  });

  return (
    <ExampleLayout
      tag="useDrag"
      title="Constrained with bounds"
      description={
        <>
          <code>bounds</code> can be a container ref — the drag is constrained to it, with a
          rubber-band feel past the edges (<code>elastic</code>). Momentum on release is clamped
          to the same bounds.
        </>
      }
      showRestartButton={false}
    >
      <ExampleCard>
        <div
          ref={containerRef}
          style={{
            position: 'relative',
            width: '100%',
            height: 280,
            border: `2px dashed ${theme.color.border}`,
            borderRadius: theme.radius.md,
            overflow: 'hidden',
            backgroundColor: theme.color.bg,
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
              backgroundColor: elastic.isDragging ? '#9186ff' : theme.color.accent,
              borderRadius: 12,
              boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
              cursor: elastic.isDragging ? 'grabbing' : 'grab',
              translateX: elastic.x,
              translateY: elastic.y,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0a0a0d',
              fontSize: 13,
              fontWeight: 600,
              userSelect: 'none',
            }}
          >
            Elastic
          </animate.div>
        </div>

        <p style={{ marginTop: 16, fontSize: 12, color: theme.color.textFaint }}>
          Try dragging past the container's edge — it resists instead of stopping dead, then
          springs back when you let go.
        </p>
      </ExampleCard>
    </ExampleLayout>
  );
};

export default Example;
