import { useRef } from 'react';
import { animate, Gesture, useGesture, useValue, withSpring } from 'react-ui-animate';
import { ExampleLayout } from '../../../animations/shared';

function Example() {
  const boxRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useValue(1);

  useGesture(
    boxRef,
    Gesture.Hover()
      .onStart(() => setScale(withSpring(1.15)))
      .onEnd(() => setScale(withSpring(1)))
  );

  return (
    <ExampleLayout
      title="Gesture.Hover()"
      description="A boolean pointer-over-target primitive, no press required: onStart fires on entry, onChange fires on every move while hovering, onEnd fires on leave. Unlike Gesture.Move(), it doesn't track movement/velocity — for that, use Move directly."
      onRestart={() => setScale(1)}
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
        }}
      >
        <animate.div
          ref={boxRef}
          style={{
            width: 140,
            height: 140,
            borderRadius: 20,
            backgroundColor: '#8e44ad',
            boxShadow: '0 10px 30px rgba(142, 68, 173, 0.35)',
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
          Hover me
        </animate.div>
      </div>
    </ExampleLayout>
  );
}

export default Example;
