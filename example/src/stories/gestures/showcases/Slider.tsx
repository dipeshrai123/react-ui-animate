import { useRef } from 'react';
import {
  animate,
  useValue,
  Gesture,
  useGesture,
  clamp,
  withSpring,
  interpolate,
} from 'react-ui-animate';
import { ExampleLayout, theme } from '../../animations/shared';

export default function Example() {
  const ref = useRef(null);
  const balloonRef = useRef<HTMLDivElement>(null);
  const offsetLeft = useRef(0);
  const [left, setLeft] = useValue(0);
  const [isDown, setIsDown] = useValue(0);
  const [balloonLeft, setBalloonLeft] = useValue(0);
  const [velocity, setVelocity] = useValue(0);

  const updateBalloonLabel = (ballX: number) => {
    if (balloonRef.current) {
      balloonRef.current.innerHTML = `${Number(
        interpolate(ballX, [0, 190], [0, 100])
      ).toFixed(0)}%`;
    }
  };

  useGesture(
    ref,
    Gesture.Pan()
      .onStart(() => {
        setIsDown(withSpring(1));
      })
      .onUpdate(({ movement, velocity: v }) => {
        setVelocity(v.x);
        const ballX = clamp(offsetLeft.current + movement.x, 0, 190);
        setLeft(ballX);
        setBalloonLeft(withSpring(ballX));
        updateBalloonLabel(ballX);
      })
      .onEnd(({ movement, velocity: v }) => {
        setIsDown(withSpring(0));
        setVelocity(v.x);
        const ballX = clamp(offsetLeft.current + movement.x, 0, 190);
        offsetLeft.current = ballX;
        updateBalloonLabel(ballX);
      })
  );

  return (
    <ExampleLayout
      title="Interactive Slider"
      description="A beautiful interactive slider with drag support. The balloon follows the slider with spring animation and shows the current percentage."
      onRestart={() => {
        setLeft(0);
        setBalloonLeft(0);
        setVelocity(0);
        setIsDown(0);
        offsetLeft.current = 0;
        if (balloonRef.current) {
          balloonRef.current.innerHTML = '0%';
        }
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          padding: '60px 0',
          width: '100%',
        }}
      >
        <div
          style={{
            width: 200,
            height: 100,
            position: 'relative',
          }}
        >
          <animate.div
            ref={balloonRef}
            style={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              border: `5px solid ${theme.color.accent}`,
              backgroundColor: theme.color.surfaceRaised,
              position: 'absolute',
              left: balloonLeft,
              translateX: -20,
              top: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              translateY: isDown.to([0, 1], [80, 20]),
              scale: isDown,
              opacity: isDown,
              rotate: velocity.to([-2, 2], [30, -30]),
              color: theme.color.text,
              fontWeight: 600,
            }}
          />

          <div style={{ position: 'relative', height: 20, marginTop: 100 }}>
            <animate.div
              ref={ref}
              style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                border: `5px solid ${theme.color.accent}`,
                backgroundColor: theme.color.text,
                cursor: 'grab',
                position: 'absolute',
                top: 0,
                left: left,
                zIndex: 2,
                scale: isDown.to([0, 1], [1, 1.3]),
              }}
            />

            <div
              style={{
                width: 200,
                height: 4,
                backgroundColor: theme.color.border,
                position: 'absolute',
                bottom: 8,
                left: 0,
                userSelect: 'none',
              }}
            />
          </div>
        </div>
      </div>
    </ExampleLayout>
  );
}
