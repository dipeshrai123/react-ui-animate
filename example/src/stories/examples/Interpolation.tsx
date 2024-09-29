import { useState } from 'react';
import { animate, interpolate, useValue } from 'react-ui-animate';

export const Interpolation = () => {
  const [open, setOpen] = useState(true);
  const x = useValue(open ? 500 : 0);

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
