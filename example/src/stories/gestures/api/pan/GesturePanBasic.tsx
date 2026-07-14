import { useRef } from 'react';
import { animate, Gesture, useGesture, useValue, withSpring } from 'react-ui-animate';
import { ExampleLayout } from '../../../animations/shared';

function Example() {
  const boxRef = useRef<HTMLDivElement>(null);
  const [x, setX] = useValue(0);
  const [y, setY] = useValue(0);
  const [scale, setScale] = useValue(1);

  useGesture(
    boxRef,
    Gesture.Pan()
      .minDistance(4)
      .onStart(() => {
        setScale(withSpring(1.05, { stiffness: 400, damping: 25 }));
      })
      .onUpdate(({ offset }) => {
        setX(offset.x);
        setY(offset.y);
      })
      .onEnd((e) => {
        setX(withSpring(0, { stiffness: 300, damping: 30 }));
        setY(withSpring(0, { stiffness: 300, damping: 30 }));
        setScale(withSpring(1, { stiffness: 300, damping: 30 }));
      })
  );

  return (
    <ExampleLayout
      title="Gesture.Pan()"
      description="The new composable gesture primitive: useGesture(ref, Gesture.Pan().onStart(...).onUpdate(...).onEnd(...)) driving useValue/withSpring directly, instead of useDrag's down-conditional callback shape. A plain click doesn't trigger onStart at all — the gesture only activates past minDistance."
      onRestart={() => {
        setX(0);
        setY(0);
        setScale(1);
      }}
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
            backgroundColor: '#3399ff',
            boxShadow: '0 10px 30px rgba(51, 153, 255, 0.35)',
            cursor: 'grab',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 600,
            fontSize: 14,
            textAlign: 'center',
            translateX: x,
            translateY: y,
            scale,
          }}
        >
          Drag me
        </animate.div>
      </div>
    </ExampleLayout>
  );
}

export default Example;
