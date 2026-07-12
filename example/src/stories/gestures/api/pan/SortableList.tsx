import { useRef, useMemo } from 'react';
import { animate, Gesture, useGesture, useValue, withSpring, move, clamp } from 'react-ui-animate';

interface Task {
  id: number;
  title: string;
  completed: boolean;
}

const TASKS: Task[] = [
  { id: 1, title: 'Design new landing page', completed: false },
  { id: 2, title: 'Implement user authentication', completed: false },
  { id: 3, title: 'Write API documentation', completed: false },
  { id: 4, title: 'Optimize database queries', completed: false },
  { id: 5, title: 'Deploy to production', completed: false },
];

const ROW_HEIGHT = 76;

const Example = () => {
  // Tasks themselves never reorder — only their visual slot does, via
  // `order.current[slot] = original task index`. This is what lets every
  // other item smoothly slide into place *while* dragging (a live preview),
  // instead of only snapping into a new position on drop.
  const order = useRef(TASKS.map((_, i) => i));
  const refs = useRef(TASKS.map(() => ({ current: null as HTMLDivElement | null }))).current;

  const [positionY, setPositionY] = useValue(TASKS.map((_, i) => i * ROW_HEIGHT));
  const [scale, setScale] = useValue(TASKS.map(() => 1));
  const [zIndex, setZIndex] = useValue(TASKS.map(() => 0));

  const applyDrag = (i: number, movementY: number, down: boolean) => {
    const slot = order.current.indexOf(i);
    const newSlot = clamp(
      Math.round((slot * ROW_HEIGHT + movementY) / ROW_HEIGHT),
      0,
      TASKS.length - 1
    );
    const newOrder = move(order.current, slot, newSlot);

    if (!down) {
      order.current = newOrder;
    }

    const positions: number[] = [];
    const scales: number[] = [];
    const zs: number[] = [];

    for (let j = 0; j < TASKS.length; j++) {
      const isActive = down && j === i;
      positions[j] = isActive ? slot * ROW_HEIGHT + movementY : newOrder.indexOf(j) * ROW_HEIGHT;
      scales[j] = isActive ? 1.05 : 1;
      zs[j] = isActive ? 1 : 0;
    }

    setPositionY(withSpring(positions, { stiffness: 500, damping: 40 }));
    setScale(withSpring(scales, { stiffness: 400, damping: 25 }));
    setZIndex(zs);
  };

  useGesture(refs, (i) =>
    Gesture.Pan()
      .onUpdate(({ movement }) => applyDrag(i, movement.y, true))
      .onEnd(({ movement }) => applyDrag(i, movement.y, false))
  );

  const shadows = useMemo(
    () =>
      zIndex.map((z) =>
        z.to((v) => (v === 1 ? '0 10px 30px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.1)'))
      ),
    [zIndex]
  );

  return (
    <div
      style={{
        width: '100%',
        minHeight: '100vh',
        padding: 40,
        backgroundColor: '#f5f5f5',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <h1 style={{ marginBottom: 32, fontSize: 32, fontWeight: 700, color: '#333' }}>
        Sortable Task List
      </h1>
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 600,
          height: TASKS.length * ROW_HEIGHT - 12,
        }}
      >
        {TASKS.map((task, i) => (
          <animate.div
            key={task.id}
            ref={refs[i]}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              backgroundColor: 'white',
              borderRadius: 12,
              padding: 20,
              boxShadow: shadows[i],
              cursor: 'grab',
              userSelect: 'none',
              translateY: positionY[i],
              scale: scale[i],
              zIndex: zIndex[i].to((v) => (v === 1 ? 1000 : 1)),
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 6,
                  border: '2px solid #ddd',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {task.completed && <span style={{ fontSize: 16 }}>✓</span>}
              </div>
              <span
                style={{
                  fontSize: 16,
                  color: task.completed ? '#999' : '#333',
                  textDecoration: task.completed ? 'line-through' : 'none',
                  flex: 1,
                }}
              >
                {task.title}
              </span>
              <div
                style={{
                  width: 20,
                  height: 20,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#999',
                  cursor: 'grab',
                }}
              >
                ⋮⋮
              </div>
            </div>
          </animate.div>
        ))}
      </div>
      <p style={{ marginTop: 24, color: '#666', fontSize: 14 }}>
        Drag items up or down to reorder them
      </p>
    </div>
  );
};

export default Example;
