import { useRef } from 'react';
import { animate, Gesture, useGesture, useValue, withSpring } from 'react-ui-animate';
import { ExampleLayout } from '../../../animations/shared';

function Example() {
  const boxRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useValue(1);
  const startScaleRef = useRef(1);

  useGesture(
    boxRef,
    Gesture.Pinch()
      .threshold(0.02)
      .onStart(() => {
        startScaleRef.current = scale.current;
      })
      .onUpdate(({ scale: gestureScale }) => {
        setScale(startScaleRef.current * gestureScale);
      })
      .onEnd(() => {
        // Snap back within a sane range instead of letting it shrink to
        // nothing or grow without bound.
        const clamped = Math.min(Math.max(scale.current, 0.5), 3);
        setScale(withSpring(clamped, { stiffness: 300, damping: 30 }));
      })
  );

  return (
    <ExampleLayout
      title="Gesture.Pinch()"
      description="Two-finger pinch/zoom. scale is the pointer-pair distance divided by the distance when the gesture began — multiply it onto whatever scale the box already had (rather than assigning it directly) so repeated pinches compound instead of resetting each time."
      onRestart={() => setScale(withSpring(1))}
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
            backgroundColor: '#845ef7',
            boxShadow: '0 10px 30px rgba(132, 94, 247, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 600,
            fontSize: 14,
            textAlign: 'center',
            scale,
          }}
        >
          Pinch me
        </animate.div>
      </div>
      <p style={{ marginTop: 10, fontSize: 12, color: '#999' }}>
        Needs a touch-capable device/emulator — pinch is two-pointer and
        can't be simulated with a single mouse cursor.
      </p>
    </ExampleLayout>
  );
}

export default Example;
