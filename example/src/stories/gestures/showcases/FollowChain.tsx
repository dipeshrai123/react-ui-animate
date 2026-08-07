import { useEffect, useRef } from 'react';
import { animate, Gesture, useGesture, useValue, withSpring } from 'react-ui-animate';
import { ExampleLayout, theme } from '../../animations/shared';

const START = { x: 60, y: 110 };

const LINKS = [
  { size: 26, color: '#ff6b6b' },
  { size: 22, color: '#ffa94d' },
  { size: 18, color: '#ffd43b' },
  { size: 14, color: '#51cf66' },
  { size: 10, color: '#3399ff' },
];

function Example() {
  const containerRef = useRef(null);

  const [x0, setX0] = useValue(START.x);
  const [y0, setY0] = useValue(START.y);
  const [x1, setX1] = useValue(START.x);
  const [y1, setY1] = useValue(START.y);
  const [x2, setX2] = useValue(START.x);
  const [y2, setY2] = useValue(START.y);
  const [x3, setX3] = useValue(START.x);
  const [y3, setY3] = useValue(START.y);
  const [x4, setX4] = useValue(START.x);
  const [y4, setY4] = useValue(START.y);

  // `movement` resets every drag — track the head's position so consecutive
  // drags accumulate instead of jumping back to the start each time.
  const dragStartRef = useRef({ x: START.x, y: START.y });

  useGesture(
    containerRef,
    Gesture.Pan()
      .onStart(() => {
        dragStartRef.current = { x: x0.current, y: y0.current };
      })
      .onUpdate(({ movement }) => {
        setX0(dragStartRef.current.x + movement.x);
        setY0(dragStartRef.current.y + movement.y);
      })
  );

  // Each link follows the AnimateValue of the link ahead of it — passing an
  // AnimateValue (instead of a number) as the target means this is wired up
  // once and keeps following forever, with no manual subscribe/set needed.
  useEffect(() => {
    setX1(withSpring(x0, { stiffness: 260, damping: 20 }));
    setY1(withSpring(y0, { stiffness: 260, damping: 20 }));
    setX2(withSpring(x1, { stiffness: 260, damping: 20 }));
    setY2(withSpring(y1, { stiffness: 260, damping: 20 }));
    setX3(withSpring(x2, { stiffness: 260, damping: 20 }));
    setY3(withSpring(y2, { stiffness: 260, damping: 20 }));
    setX4(withSpring(x3, { stiffness: 260, damping: 20 }));
    setY4(withSpring(y3, { stiffness: 260, damping: 20 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const links = [
    { x: x0, y: y0 },
    { x: x1, y: y1 },
    { x: x2, y: y2 },
    { x: x3, y: y3 },
    { x: x4, y: y4 },
  ];

  return (
    <ExampleLayout
      title="Follow Chain"
      description="Drag the red head. Every link's target is another link's live AnimateValue, wrapped in withSpring — set once, it keeps following without any manual subscribe/set wiring."
      onRestart={() => {
        setX0(START.x);
        setY0(START.y);
      }}
    >
      <div
        ref={containerRef}
        style={{
          position: 'relative',
          width: '100%',
          height: 260,
          border: `1px solid ${theme.color.border}`,
          borderRadius: theme.radius.md,
          backgroundColor: theme.color.surface,
          overflow: 'hidden',
        }}
      >
        {links.map((link, i) => {
          const { size, color } = LINKS[i];
          return (
            <animate.div
              key={i}
              style={{
                position: 'absolute',
                width: size,
                height: size,
                borderRadius: '50%',
                backgroundColor: color,
                left: link.x.to((v) => v - size / 2),
                top: link.y.to((v) => v - size / 2),
                cursor: i === 0 ? 'grab' : undefined,
                pointerEvents: i === 0 ? 'auto' : 'none',
                boxShadow: i === 0 ? '0 2px 8px rgba(255, 107, 107, 0.5)' : undefined,
              }}
            />
          );
        })}
      </div>
    </ExampleLayout>
  );
}

export default Example;
