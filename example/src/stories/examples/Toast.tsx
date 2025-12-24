import { useCallback, useState } from 'react';
import {
  animate,
  Presence,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
} from 'react-ui-animate';

const Toast = ({ id, onEnd }: { id: number; onEnd: (id: number) => void }) => {
  return (
    <animate.div
      style={{
        position: 'relative',
        width: 240,
        backgroundColor: '#3399ff',
        borderRadius: 4,
        height: 0,
        opacity: 0,
        scale: 0.8,
        overflow: 'hidden',
      }}
      animate={{
        height: withSpring(100, { damping: 14 }),
        opacity: withSpring(1, { damping: 14 }),
        scale: withSpring(1, { damping: 14 }),
      }}
      exit={{
        height: withSpring(0, { damping: 14 }),
        opacity: withSpring(0, { damping: 14 }),
        scale: withSpring(0.8, { damping: 14 }),
      }}
    >
      <div
        style={{
          padding: 16,
          color: 'white',
          fontWeight: 500,
        }}
      >
        Toast #{id}
      </div>
      <animate.div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          backgroundColor: '#333',
          height: 5,
          borderRadius: 4,
          width: '0%',
        }}
        animate={{
          width: withSequence([
            withDelay(500),
            withTiming('0%', { duration: 0 }),
            withTiming('100%', {
              duration: 3000,
              onComplete: () => onEnd(id),
            }),
          ]),
        }}
      />
    </animate.div>
  );
};

var uniqueId = 0;

const Example = () => {
  const [toasts, setToasts] = useState<{ id: number }[]>([]);

  const addToast = () => {
    setToasts((prev) => [...prev, { id: uniqueId++ }]);
  };

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <>
      <button
        onClick={addToast}
        style={{
          padding: 10,
          border: '2px solid #ddd',
          borderRadius: 4,
          margin: 10,
          cursor: 'pointer',
        }}
      >
        TOAST ME!
      </button>

      <div
        style={{
          position: 'fixed',
          right: 10,
          bottom: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        <Presence>
          {toasts.map((t) => (
            <Toast key={t.id} id={t.id} onEnd={removeToast} />
          ))}
        </Presence>
      </div>
    </>
  );
};

export default Example;
