import { useState } from 'react';
import { AnimatedBlock, bInterpolate, TransitionBlock } from 'react-ui-animate';

export function TBExample() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen((prev) => !prev)}>ANIMTE</button>
      <TransitionBlock state={open}>
        {(animation) => {
          return (
            <AnimatedBlock
              style={{
                width: 100,
                height: 100,
                backgroundColor: '#3399ff',
                translateX: bInterpolate(animation.value, 0, 500),
              }}
            />
          );
        }}
      </TransitionBlock>
    </>
  );
}
