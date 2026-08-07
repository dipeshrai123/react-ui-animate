import { createRef, useMemo, useRef } from 'react';
import {
  animate,
  Gesture,
  useGesture,
  clamp,
  move,
  useValue,
  withSpring,
} from 'react-ui-animate';
import { ExampleLayout, theme } from '../../animations/shared';

const ITEMS = ['Please!', 'Can you', 'order', 'me ?'];

const Example = () => {
  const originalIndex = useRef(ITEMS.map((_, i) => i));
  const [animationY, setAnimationY] = useValue(ITEMS.map((_, i) => i * 70));
  const [zIndex, setZIndex] = useValue(ITEMS.map(() => 0));
  const boxes = useRef(
    ITEMS.map((_, i) => createRef<HTMLDivElement>())
  ).current;

  const applyDrag = (i: number, movementY: number, down: boolean) => {
    const index = originalIndex.current.indexOf(i);

    const newIndex = clamp(
      Math.round((index * 70 + movementY) / 70),
      0,
      ITEMS.length - 1
    );
    const newOrder = move(originalIndex.current, index, newIndex);

    if (!down) {
      originalIndex.current = newOrder;
    }

    const a = [];
    const v = [];
    for (let j = 0; j < ITEMS.length; j++) {
      const isActive = down && j === i;
      a[j] = isActive ? index * 70 + movementY : newOrder.indexOf(j) * 70;
      v[j] = isActive ? 1 : 0;
    }

    setAnimationY(withSpring(a));
    setZIndex(v);
  };

  useGesture(boxes, (i) =>
    Gesture.Pan()
      .onUpdate(({ movement }) => applyDrag(i, movement.y, true))
      .onEnd(({ movement }) => applyDrag(i, movement.y, false))
  );

  const boxShadows = useMemo(
    () =>
      zIndex.map((z) =>
        z.to((v) => (v === 1 ? '0 8px 16px rgba(0,0,0,0.12)' : 'none'))
      ),
    [zIndex]
  );

  return (
    <ExampleLayout
      title="Sortable List"
      description="Drag and drop items to reorder them. Items smoothly animate to their new positions with spring physics."
      onRestart={() => {
        originalIndex.current = ITEMS.map((_, i) => i);
        setAnimationY(ITEMS.map((_, i) => i * 70));
        setZIndex(ITEMS.map(() => 0));
      }}
    >
      <div style={{ position: 'relative', width: 300, margin: '40px auto' }}>
        {animationY.map((y, i) => (
          <animate.div
            key={i}
            ref={boxes[i]}
            style={{
              padding: 20,
              marginBottom: 20,
              position: 'absolute',
              backgroundColor: theme.color.surface,
              fontSize: 18,
              fontWeight: 500,
              height: 60,
              userSelect: 'none',
              left: 0,
              top: 0,
              right: 0,
              border: `1px solid ${theme.color.accent}`,
              borderRadius: theme.radius.sm,
              translateY: y,
              cursor: 'grabbing',
              zIndex: zIndex[i],
              boxShadow: boxShadows[i],
              transition: 'box-shadow 0.4s ease',
              display: 'flex',
              alignItems: 'center',
              color: theme.color.text,
            }}
          >
            {ITEMS[i]}
          </animate.div>
        ))}
      </div>
    </ExampleLayout>
  );
};

export default Example;
