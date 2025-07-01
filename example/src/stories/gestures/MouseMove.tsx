import { createRef, useMemo, useState } from 'react';
import { animate, useValue, useMove } from 'react-ui-animate';

export const MouseMove = () => {
  const [open, setOpen] = useState(true);
  const [x, setX] = useValue(0);
  const [y, setY] = useValue(0);
  const refs = useMemo(
    () => Array.from({ length: 5 }, () => createRef<HTMLDivElement>()),
    []
  );

  useMove(refs, function ({ event, index }) {
    if (open) {
      setX(event.clientX);
      setY(event.clientY);
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

      <animate.div
        style={{
          width: 100,
          height: 100,
          backgroundColor: '#ff0000',
          translateX: x,
          translateY: y,
          position: 'fixed',
          top: 0,
          left: 0,
          pointerEvents: 'none',
        }}
      />
      <div style={{ height: 2000 }} />

      {refs.map((r, i) => (
        <div
          key={i}
          ref={r}
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
