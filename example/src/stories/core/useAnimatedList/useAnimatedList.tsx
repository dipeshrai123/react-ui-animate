import React, { useState } from 'react';
import {
  animate,
  withSpring,
  useAnimatedList,
  withTiming,
  withSequence,
} from 'react-ui-animate';

type Item = {
  id: string;
  name: string;
};

export const UseAnimatedList: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);

  const animatedList = useAnimatedList<
    Item,
    { opacity: number; translateX: number }
  >(items, (item) => item.id, {
    from: {
      opacity: 0,
      translateX: 0,
    },
    enter: {
      opacity: withSpring(1),
      translateX: withSpring(100),
    },
    exit: {
      translateX: withSequence([
        withSpring(50),
        withTiming(0, { duration: 2000 }),
      ]),
      opacity: withSpring(1),
    },
  });

  const addItem = () => {
    const id = Math.random().toString(36).slice(2, 7);
    setItems([...items, { id, name: `Item ${id.toUpperCase()}` }]);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <>
      <button onClick={() => addItem()}>ADD NEW ITEM</button>
      {animatedList
        .map(({ animation: { opacity, translateX }, item }) => (
          <animate.div
            key={item.id}
            onClick={() => removeItem(item.id)}
            style={{
              opacity,
              translateX,
              height: opacity.to([0, 1], [0, 100]),
              width: 100,
              backgroundColor: 'red',
              left: 0,
              top: 0,
              border: '1px solid black',
            }}
          />
        ))
        .reverse()}
    </>
  );
};
