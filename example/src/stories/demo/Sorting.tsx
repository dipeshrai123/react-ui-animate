import { useRef } from 'react';
import {
  animate,
  useDrag,
  clamp,
  move,
  withEase,
  useValue,
} from 'react-ui-animate';

const ITEMS = ['Please!', 'Can you', 'order', 'me ?'];

export const Sorting = () => {
  const originalIndex = useRef(ITEMS.map((_, i) => i));
  const [animationY, setAnimationY] = useValue(ITEMS.map((_, i) => i * 70));
  const [zIndex, setZIndex] = useValue(ITEMS.map(() => 0));

  const bind = useDrag(({ args: [i], down, movementY: my, movementX: mx }) => {
    const index = originalIndex.current.indexOf(i!);
    const newIndex = clamp(
      Math.round((index * 70 + my) / 70),
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
      a[j] = withEase(isActive ? index * 70 + my : newOrder.indexOf(j) * 70);
      v[j] = isActive ? 1 : 0;
    }

    setAnimationY(a);
    setZIndex(v);
  });

  return (
    <div style={{ position: 'relative', width: 300, margin: '40px auto' }}>
      {animationY.map((y, i) => (
        <animate.div
          key={i}
          {...bind(i)}
          style={{
            padding: 20,
            marginBottom: 20,
            position: 'absolute',
            backgroundColor: '#fff',
            fontWeight: 'bold',
            fontSize: 20,
            height: 60,
            userSelect: 'none',
            color: '#353535',
            left: 0,
            top: 0,
            right: 0,
            boxShadow: '0px 2px 4px rgba(0,0,0,0.2)',
            border: '1px solid #e1e1e1',
            borderRadius: 4,
            translateY: y,
            cursor: 'grabbing',
            zIndex: zIndex[i],
          }}
        >
          {ITEMS[i]}
        </animate.div>
      ))}
    </div>
  );
};
