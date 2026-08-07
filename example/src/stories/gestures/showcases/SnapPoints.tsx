import { useRef } from 'react';
import { animate, useDrag } from 'react-ui-animate';
import { theme } from '../../animations/shared';

const SNAP_COORDINATES = [
  { x: 0, y: 0 },
  { x: 200, y: 0 },
  { x: 400, y: 0 },
  { x: 600, y: 0 },
  { x: 0, y: 200 },
  { x: 200, y: 200 },
  { x: 400, y: 200 },
  { x: 600, y: 200 },
];

function Example() {
  const ref = useRef(null);
  const { x, y } = useDrag(ref, {
    snapPoints: { x: [0, 200, 400, 600], y: [0, 200] },
  });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: theme.color.bg }}>
      <div
        style={{
          position: 'fixed',
          top: 24,
          left: 24,
          fontFamily: theme.font.sans,
          color: theme.color.textMuted,
          fontSize: 14,
          maxWidth: 360,
          lineHeight: 1.6,
        }}
      >
        <div style={{ color: theme.color.text, fontWeight: 700, fontSize: 18, marginBottom: 6 }}>
          Snap points
        </div>
        Drag the box — it snaps to the nearest dashed cell on release via{' '}
        <code>useDrag</code>'s <code>snapPoints</code> option.
      </div>

      <animate.div
        ref={ref}
        style={{
          backgroundColor: theme.color.accent,
          width: 200,
          height: 200,
          position: 'fixed',
          left: x,
          top: y,
          borderRadius: theme.radius.md,
          cursor: 'grab',
        }}
      />

      {SNAP_COORDINATES.map((coord, index) => (
        <div
          key={index}
          style={{
            position: 'absolute',
            left: coord.x,
            top: coord.y,
            width: 200,
            height: 200,
            border: `1px dashed ${theme.color.borderStrong}`,
            borderRadius: theme.radius.md,
            zIndex: -1,
          }}
        />
      ))}
    </div>
  );
}

export default Example;
