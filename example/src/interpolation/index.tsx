import { useState } from 'react';
import { AnimatedBlock, useAnimatedValue } from 'react-ui-animate';

export const Interpolation = () => {
  const [open, setOpen] = useState(false);
  const x = useAnimatedValue(open ? 500 : 0);
  return (
    <>
      <AnimatedBlock
        style={{
          width: 100,
          height: 100,
          backgroundColor: 'red',
          translateX: x.value,
        }}
      />

      <button onClick={() => setOpen((prev) => !prev)}>ANIMATE ME</button>
    </>
  );
};
