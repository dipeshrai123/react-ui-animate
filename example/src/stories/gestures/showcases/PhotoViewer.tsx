import { useRef } from 'react';
import { animate, Gesture, useGesture, useValue, withSpring } from 'react-ui-animate';
import { ExampleLayout, Section, ExampleCard } from '../../animations/shared';

// Demonstrates the gesture arbitration this session's Tier 2 work landed:
// one finger pans the photo, two fingers pinch/rotate it — Pan gets
// automatically cancelled the instant a second pointer joins (handing off
// to Pinch/Rotate), and Pinch/Rotate run simultaneously off the same
// two-pointer stream without any manual coordination.
function Example() {
  const boxRef = useRef<HTMLDivElement>(null);
  const [x, setX] = useValue(0);
  const [y, setY] = useValue(0);
  const [scale, setScale] = useValue(1);
  const [rotate, setRotate] = useValue(0);

  const dragStart = useRef({ x: 0, y: 0 });
  const pinchStart = useRef(1);
  const rotateStart = useRef(0);

  useGesture(
    boxRef,
    Gesture.Pan()
      .minDistance(4)
      .onStart(() => {
        dragStart.current = { x: x.current, y: y.current };
      })
      .onUpdate(({ movement }) => {
        setX(dragStart.current.x + movement.x);
        setY(dragStart.current.y + movement.y);
      })
  );

  useGesture(
    boxRef,
    Gesture.Pinch()
      .threshold(0.02)
      .onStart(() => {
        pinchStart.current = scale.current;
      })
      .onUpdate(({ scale: gestureScale }) => {
        setScale(pinchStart.current * gestureScale);
      })
      .onEnd(() => {
        setScale(withSpring(Math.min(Math.max(scale.current, 0.5), 3)));
      })
  );

  useGesture(
    boxRef,
    Gesture.Rotate()
      .threshold(1)
      .onStart(() => {
        rotateStart.current = rotate.current;
      })
      .onUpdate(({ rotation }) => {
        setRotate(rotateStart.current + rotation);
      })
  );

  const reset = () => {
    setX(withSpring(0));
    setY(withSpring(0));
    setScale(withSpring(1));
    setRotate(withSpring(0));
  };

  return (
    <ExampleLayout
      title="Photo Viewer — Pan + Pinch + Rotate"
      description="All three gestures registered on the same element. One finger drags (Pan); a second finger joining mid-drag cancels Pan and hands off to Pinch/Rotate, which run together off the same two-pointer stream."
      onRestart={reset}
    >
      <Section
        title="Try it"
        description="Drag with one finger. Pinch and twist with two."
      >
        <ExampleCard>
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: 360,
              overflow: 'hidden',
              border: '2px solid #e0e0e0',
              borderRadius: 12,
              backgroundColor: '#1a1a1a',
              touchAction: 'none',
            }}
          >
            <animate.div
              ref={boxRef}
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                width: 200,
                height: 200,
                marginLeft: -100,
                marginTop: -100,
                borderRadius: 16,
                background: 'linear-gradient(135deg, #3399ff, #845ef7 50%, #51cf66)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 600,
                cursor: 'grab',
                translateX: x,
                translateY: y,
                scale,
                rotate,
              }}
            >
              Drag / Pinch / Rotate
            </animate.div>
          </div>
        </ExampleCard>
      </Section>
      <p style={{ marginTop: 10, fontSize: 12, color: '#999' }}>
        Pinch/rotate need a touch-capable device/emulator — single-mouse
        input can only exercise the Pan half of this example.
      </p>
    </ExampleLayout>
  );
}

export default Example;
