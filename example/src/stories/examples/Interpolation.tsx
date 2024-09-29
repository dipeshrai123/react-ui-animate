import { useLayoutEffect, useState } from 'react';
import { animate, interpolate, useValue, withSpring } from 'react-ui-animate';

export const Interpolation = () => {
  const [open, setOpen] = useState(false);
  const x = useValue(0);

  useLayoutEffect(() => {
    x.value = withSpring(open ? 500 : 0);
  }, [open]);

  return (
    <>
      <animate.div
        style={{
          width: 100,
          height: 100,
          backgroundColor: interpolate(x.value, [0, 500], ['red', 'blue']),
          translateX: x.value,
        }}
      />

      <button onClick={() => setOpen((p) => !p)}>ANIMATE ME</button>
    </>
  );
};
