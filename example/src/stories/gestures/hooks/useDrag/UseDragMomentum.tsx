import { useRef, useState } from 'react';
import { animate, useDrag } from 'react-ui-animate';

const PRESETS: Record<string, { label: string; decay: number }> = {
  low: {
    label: 'Low friction (0.998, default)',
    decay: 0.998,
  },
  medium: {
    label: 'Medium friction (0.96)',
    decay: 0.96,
  },
  high: {
    label: 'High friction (0.85)',
    decay: 0.85,
  },
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
    <div style={{ padding: 40 }}>
      <h1 style={{ marginBottom: 10 }}>useDrag — custom momentum friction</h1>
      <p style={{ marginBottom: 20, color: '#666', maxWidth: 520 }}>
        <code>decay</code> tunes the deceleration constant used for the
        momentum fling on release — lower means more friction, so it coasts a
        shorter distance and stops sooner. Doesn't affect the bounds-settle
        spring/timing (see <code>transition</code>).
      </p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {(Object.keys(PRESETS) as Array<keyof typeof PRESETS>).map((key) => (
          <button
            key={key}
            onClick={() => setPreset(key)}
            style={{
              padding: '8px 14px',
              borderRadius: 8,
              border: '2px solid #3399ff',
              backgroundColor: preset === key ? '#3399ff' : 'white',
              color: preset === key ? 'white' : '#3399ff',
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
            fontSize: 13,
            fontWeight: 600,
            userSelect: 'none',
          }}
        >
          Flick me
        </animate.div>
      </div>

      <p style={{ marginTop: 10, fontSize: 12, color: '#999' }}>
        Flick it hard and release — compare how far it coasts across the
        three friction presets.
      </p>
    </div>
  );
};

export default Example;
