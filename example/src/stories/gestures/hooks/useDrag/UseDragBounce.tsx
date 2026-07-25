import { useRef, useState } from 'react';
import { animate, useDrag } from 'react-ui-animate';

const PRESETS: Record<string, { label: string; bounce: number }> = {
  soft: {
    label: 'Soft bounce (0.35)',
    bounce: 0.35,
  },
  medium: {
    label: 'Medium bounce (0.6, default is 0.5)',
    bounce: 0.6,
  },
  bouncy: {
    label: 'Bouncy (0.85)',
    bounce: 0.85,
  },
  off: {
    label: 'No bounce (hard stop)',
    bounce: 0,
  },
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
    <div style={{ padding: 40 }}>
      <h1 style={{ marginBottom: 10 }}>useDrag — bounce off bounds</h1>
      <p style={{ marginBottom: 20, color: '#666', maxWidth: 520 }}>
        <code>bounce</code> reflects the momentum fling off <code>bounds</code>{' '}
        instead of hard-stopping at the edge — a real bounce, velocity
        reverses and dampens on impact, then keeps decaying. <code>true</code>{' '}
        uses a default restitution of 0.5; a number sets a custom one (0 =
        absorbs on contact, 1 = perfectly elastic).
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
        Flick it hard toward an edge — it bounces off instead of stopping
        dead, losing a bit of speed each bounce until it settles.
      </p>
    </div>
  );
};

export default Example;
