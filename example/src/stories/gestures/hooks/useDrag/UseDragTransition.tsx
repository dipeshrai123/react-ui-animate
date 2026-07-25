import { useRef, useState } from 'react';
import { animate, useDrag, withSpring, withTiming } from 'react-ui-animate';
import type { LayoutOptions } from 'react-ui-animate';

const PRESETS: Record<string, { label: string; transition: LayoutOptions }> = {
  snappy: {
    label: 'Snappy spring (default)',
    transition: withSpring({ stiffness: 158, damping: 20 }),
  },
  bouncy: {
    label: 'Bouncy spring',
    transition: withSpring({ stiffness: 300, damping: 10 }),
  },
  soft: {
    label: 'Soft spring',
    transition: withSpring({ stiffness: 80, damping: 16 }),
  },
  timing: {
    label: 'Linear timing (400ms)',
    transition: withTiming({ duration: 400 }),
  },
};

const Example = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const [preset, setPreset] = useState<keyof typeof PRESETS>('snappy');

  const { x, y, isDragging } = useDrag(boxRef, {
    bounds: containerRef,
    momentum: false,
    transition: PRESETS[preset].transition,
  });

  return (
    <div style={{ padding: 40 }}>
      <h1 style={{ marginBottom: 10 }}>useDrag — custom transition</h1>
      <p style={{ marginBottom: 20, color: '#666', maxWidth: 520 }}>
        <code>transition</code> controls how the box settles back within{' '}
        <code>bounds</code> (or snaps to a <code>snapPoints</code> target) on
        release — same descriptor helpers as <code>Reorder.Group</code>'s{' '}
        <code>transition</code> prop (<code>withSpring</code>,{' '}
        <code>withTiming</code>, or a raw spring config object).
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
          Drag me
        </animate.div>
      </div>

      <p style={{ marginTop: 10, fontSize: 12, color: '#999' }}>
        Drag past the container's edge and let go — watch how the release
        settle changes with each preset.
      </p>
    </div>
  );
};

export default Example;
