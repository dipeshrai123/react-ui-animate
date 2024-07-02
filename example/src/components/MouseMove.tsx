import React from 'react';
import {
  AnimatedBlock,
  useAnimatedValue,
  useMouseMove,
} from 'react-ui-animate';

export const MouseMove = () => {
  const [open, setOpen] = React.useState(true);
  const x = useAnimatedValue(0);
  const y = useAnimatedValue(0);

  const bind = useMouseMove(function ({ mouseX, mouseY }) {
    if (open) {
      x.value = mouseX;
      y.value = mouseY;
    }
  });

  return (
    <>
      <button
        style={{ position: 'fixed', right: 0, bottom: 0 }}
        onClick={() => setOpen((prev) => !prev)}
      >
        {open ? 'disable' : 'enable'}
      </button>

      <AnimatedBlock
        style={{
          width: 100,
          height: 100,
          backgroundColor: '#ff0000',
          translateX: x.value,
          translateY: y.value,
          position: 'fixed',
          top: 0,
          left: 0,
        }}
      />
      <div style={{ height: 2000 }} />

      {Array(5)
        .fill(null)
        .map((_, i) => (
          <div
            key={i}
            {...bind(i)}
            style={{
              width: 100,
              height: 100,
              backgroundColor: '#3399ff',
              marginBottom: 10,
            }}
          />
        ))}
    </>
  );
};
