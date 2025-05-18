import { useLayoutEffect, useState } from 'react';
import { animate, useValue, withSpring } from 'react-ui-animate';

export const Interpolation = () => {
  const [open, setOpen] = useState(false);
  const [x, setX] = useValue(0);

  useLayoutEffect(() => {
    setX(withSpring(open ? 500 : 0));
  }, [open, setX]);

  return (
    <>
      <animate.div
        style={{
          width: 100,
          height: 100,
          backgroundColor: x.to([0, 500], ['red', 'blue']),
          translateX: x,
        }}
      />

      <button onClick={() => setOpen((p) => !p)}>ANIMATE ME</button>
    </>
  );
};
