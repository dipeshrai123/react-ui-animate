import { useRef, useState } from 'react';
import { animate, useDrag } from 'react-ui-animate';
import { ExampleLayout, ExampleCard, theme } from '../../../animations/shared';

const PRESETS: Record<string, { label: string; decay: number }> = {
  low: { label: 'Low friction (default)', decay: 0.998 },
  medium: { label: 'Medium friction', decay: 0.96 },
  high: { label: 'High friction', decay: 0.85 },
};

const Example = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const [preset, setPreset] = useState<keyof typeof PRESETS>('low');

  const { x, y, isDragging } = useDrag(boxRef, {
    bounds: containerRef,
    decay: PRESETS[preset].decay,
  });

  return (
    <ExampleLayout
      tag="useDrag"
      title="Custom momentum friction"
      description={
        <>
          <code>decay</code> tunes the deceleration constant used for the momentum fling on
          release — lower means more friction, so it coasts a shorter distance and stops sooner.
          It doesn't affect the bounds-settle spring/timing (see <code>transition</code>).
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
          Flick it hard and release — compare how far it coasts across the three friction
          presets.
        </p>
      </ExampleCard>
    </ExampleLayout>
  );
};

export default Example;
