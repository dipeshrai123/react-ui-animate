import { useRef } from 'react';
import { animate, useDrag } from 'react-ui-animate';
import { ExampleLayout, ExampleCard, theme } from '../../../animations/shared';

const Example = () => {
  const cardRef = useRef<HTMLDivElement>(null);
  const { x, y, isDragging } = useDrag(cardRef);

  return (
    <ExampleLayout
      tag="useDrag"
      title="Drag + momentum, one hook"
      description="useDrag wires up pointer tracking and release momentum together. Position persists between drags — drop it and drag again, it continues from where it settled."
      showRestartButton={false}
    >
      <ExampleCard>
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: 320,
            border: `2px dashed ${theme.color.border}`,
            borderRadius: theme.radius.md,
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
              backgroundColor: isDragging ? '#9186ff' : theme.color.accent,
              borderRadius: 12,
              boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
              cursor: isDragging ? 'grabbing' : 'grab',
              translateX: x,
              translateY: y,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0a0a0d',
              fontWeight: 600,
              userSelect: 'none',
            }}
          >
            Drag + Fling
          </animate.div>
        </div>
        <p style={{ marginTop: 16, fontSize: 12, color: theme.color.textFaint }}>
          Flick it and release — momentum carries it on with the release velocity.
        </p>
      </ExampleCard>
    </ExampleLayout>
  );
};

export default Example;
