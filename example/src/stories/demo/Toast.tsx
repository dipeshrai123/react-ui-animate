import React, { useCallback, useState } from 'react';
import { animate, __experimental } from 'react-ui-animate';

const { useMount, withSpring, withSequence, withTiming } = __experimental;

const Toast = ({ id, onEnd }: any) => {
  const [visible, setVisible] = useState(true);

  const mount = useMount(visible, {
    from: { opacity: 0, height: 0, progress: 0 },
    enter: withSequence([
      withSpring(
        {
          opacity: 1,
          height: 100,
        },
        { damping: 14 }
      ),
      withTiming(
        { progress: 1 },
        { duration: 2000, onComplete: () => setVisible(false) }
      ),
    ]),
    exit: withSpring({ opacity: 0 }, { onComplete: () => onEnd(id) }),
  });

  return (
    <>
      {mount(
        ({ height, opacity, progress }, m) =>
          m && (
            <animate.div
              style={{
                position: 'relative',
                width: 240,
                backgroundColor: '#3399ff',
                borderRadius: 4,
                height,
                opacity,
                scale: height.to([0, 100], [0.8, 1]),
              }}
            >
              <animate.div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  backgroundColor: '#333',
                  height: 5,
                  borderRadius: 4,
                  width: progress.to([0, 1], ['0%', '100%']),
                }}
              />
            </animate.div>
          )
      )}
    </>
  );
};

var uniqueId = 0;

export const ToastComp = () => {
  const [elements, setElements] = useState<{ id: number }[]>([]);

  const generateToast = () => {
    setElements((prev) => [...prev, { id: uniqueId++ }]);
  };

  const handleEnd = useCallback((id: number) => {
    setElements((els) => els.filter((e) => e.id !== id));
  }, []);

  return (
    <>
      <button
        onClick={generateToast}
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
        {elements.map((e) => {
          return <Toast key={e.id} id={e.id} onEnd={handleEnd} />;
        })}
      </div>
    </>
  );
};
