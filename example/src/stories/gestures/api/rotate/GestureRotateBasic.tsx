import { useRef } from 'react';
import { animate, Gesture, useGesture, useValue, withSpring } from 'react-ui-animate';
import { ExampleLayout } from '../../../animations/shared';

function Example() {
  const boxRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useValue(0);
  const startRotationRef = useRef(0);

  useGesture(
    boxRef,
    Gesture.Rotate()
      .threshold(1)
      .onStart(() => {
        startRotationRef.current = rotate.current;
      })
      .onUpdate(({ rotation }) => {
        setRotate(startRotationRef.current + rotation);
      })
      .onEnd(() => {
        // Snap to the nearest 90 degrees.
        const snapped = Math.round(rotate.current / 90) * 90;
        setRotate(withSpring(snapped, { stiffness: 250, damping: 26 }));
      })
  );

  return (
    <ExampleLayout
      title="Gesture.Rotate()"
      description="Two-finger rotation. rotation is cumulative degrees from when the gesture began — like Pinch's scale, add it onto the box's existing rotation (not assign directly) so repeated rotations accumulate instead of resetting."
      onRestart={() => setRotate(withSpring(0))}
    >
      <div
        style={{
          width: '100%',
          height: 320,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px solid #e0e0e0',
          borderRadius: 12,
          backgroundColor: '#fafafa',
          touchAction: 'none',
        }}
      >
        <animate.div
          ref={boxRef}
          style={{
            width: 140,
            height: 140,
            borderRadius: 20,
            backgroundColor: '#51cf66',
            boxShadow: '0 10px 30px rgba(81, 207, 102, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 600,
            fontSize: 14,
            textAlign: 'center',
            rotate,
          }}
        >
          Rotate me
        </animate.div>
      </div>
      <p style={{ marginTop: 10, fontSize: 12, color: '#999' }}>
        Needs a touch-capable device/emulator — rotate is two-pointer and
        can't be simulated with a single mouse cursor.
      </p>
    </ExampleLayout>
  );
}

export default Example;
