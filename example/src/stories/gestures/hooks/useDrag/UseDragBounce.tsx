import { useRef, useState } from 'react';
import { animate, useDrag } from 'react-ui-animate';
import { ExampleLayout, ExampleCard, theme } from '../../../animations/shared';

const PRESETS: Record<string, { label: string; bounce: number }> = {
  soft: { label: 'Soft (0.35)', bounce: 0.35 },
  medium: { label: 'Medium (0.6)', bounce: 0.6 },
  bouncy: { label: 'Bouncy (0.85)', bounce: 0.85 },
  off: { label: 'No bounce', bounce: 0 },
};

const Example = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const [preset, setPreset] = useState<keyof typeof PRESETS>('soft');

  const { x, y, isDragging } = useDrag(boxRef, {
    bounds: containerRef,
    elastic: false,
    momentum: true,
    bounce: PRESETS[preset].bounce,
  });

  return (
    <ExampleLayout
      tag="useDrag"
      title="Bounce off bounds"
      description={
        <>
          <code>bounce</code> reflects the momentum fling off <code>bounds</code> instead of
          hard-stopping at the edge — velocity reverses and dampens on impact, then keeps
          decaying. <code>true</code> uses a default restitution of 0.5; a number sets a custom
          one (0 absorbs on contact, 1 is perfectly elastic).
        </>
      }
      showRestartButton={false}
    >
      <ExampleCard>
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          {(Object.keys(PRESETS) as Array<keyof typeof PRESETS>).map((key) => (
            <button
              key={key}
              onClick={() => setPreset(key)}
              style={{
                padding: '8px 14px',
                borderRadius: theme.radius.sm,
                border: `1px solid ${theme.color.accent}`,
                backgroundColor: preset === key ? theme.color.accent : 'transparent',
                color: preset === key ? '#0a0a0d' : theme.color.accent,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {PRESETS[key].label}
            </button>
          ))}
        </div>

        <div
          ref={containerRef}
          style={{
            position: 'relative',
            width: '100%',
            height: 320,
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
              fontSize: 13,
              fontWeight: 600,
              userSelect: 'none',
            }}
          >
            Flick me
          </animate.div>
        </div>

        <p style={{ marginTop: 16, fontSize: 12, color: theme.color.textFaint }}>
          Flick it hard toward an edge — it bounces off instead of stopping dead, losing a bit of
          speed each bounce until it settles.
        </p>
      </ExampleCard>
    </ExampleLayout>
  );
};

export default Example;
