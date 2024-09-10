import { useState } from 'react';
import { TransitionBlock, animate, bInterpolate } from 'react-ui-animate';

export function TBExample() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen((prev) => !prev)}>ANIMTE</button>
      <TransitionBlock state={open}>
        {(animation) => {
          return (
            <>
              <animate.div
                style={{
                  width: 100,
                  height: 100,
                  backgroundColor: 'red',
                  translateX: bInterpolate(animation.value, 0, 500),
                }}
              />
              <animate.div
                style={{
                  width: 100,
                  height: 100,
                  backgroundColor: 'red',
                  translateX: bInterpolate(animation.value, 0, 400),
                  marginTop: 10,
                }}
              />
            </>
          );
        }}
      </TransitionBlock>
    </>
  );
}
