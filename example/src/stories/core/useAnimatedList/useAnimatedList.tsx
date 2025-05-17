import React, { useState } from 'react';
import { animate, withSpring, useAnimatedList } from 'react-ui-animate';

type Item = {
  id: string;
  name: string;
};

export const UseAnimatedList: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);

  const animatedList = useAnimatedList(items, (item) => item.id, {
    from: 0,
    enter: withSpring(1),
    exit: withSpring(0),
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
        .map(({ animation, item }) => (
          <animate.div
            key={item.id}
            onClick={() => removeItem(item.id)}
            style={{
              opacity: animation,
              scale: animation.to([0, 1], [0, 1]),
              height: animation.to([0, 1], [0, 100]),
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
