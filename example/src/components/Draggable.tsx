import React from 'react';
import { useAnimatedValue, AnimatedBlock, useDrag } from 'react-ui-animate';

export const Draggable = () => {
  const [open, setOpen] = React.useState(true);
  const translateX = useAnimatedValue(0);

  const bind = useDrag(function ({ down, movementX }) {
    if (open) {
      translateX.value = down ? movementX : 0;
    }
  });

  return (
    <>
      <button onClick={() => setOpen((prev) => !prev)}>
        {open ? 'disable' : 'enable'}
      </button>

      <AnimatedBlock
        {...bind()}
        style={{
          width: 100,
          height: 100,
          backgroundColor: '#3399ff',
          translateX: translateX.value,
        }}
      />
    </>
  );
};
