import { createRef, useMemo, useState } from 'react';
import { animate, useValue, useMove } from 'react-ui-animate';

const Example = () => {
  const [open, setOpen] = useState(true);
  const [pos, setPos] = useValue({ x: 0, y: 0 });

  const refs = useMemo(
    () => Array.from({ length: 5 }, () => createRef<HTMLDivElement>()),
    []
  );

  useMove(refs, function ({ event }) {
    if (open) {
      setPos({ x: event.clientX, y: event.clientY });
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
          backgroundColor: 'teal',
          borderRadius: 4,
          translateX: pos.x,
          translateY: pos.y,
          position: 'fixed',
          top: 0,
          left: 0,
          pointerEvents: 'none',
        }}
      />

      {refs.map((r, i) => (
        <div
          key={i}
          ref={r}
          style={{
            width: 400,
            height: 100,
            backgroundColor: '#f1f1f1',
            borderRadius: 4,
            border: '1px solid #e1e1e1',
            marginBottom: 10,
          }}
        />
      ))}
    </>
  );
};

export default Example;
