import React, { useCallback, useState } from 'react';
import {
  animate,
  MountedBlock,
  withEase,
  withSequence,
  withTiming,
} from 'react-ui-animate';

const Toast = ({ id, onEnd }: any) => {
  const [visible, setVisible] = useState(true);

  return (
    <MountedBlock
      state={visible}
      enter={withSequence([
        withEase(1),
        withEase(2),
        withTiming(3, { duration: 2000, onRest: () => setVisible(false) }),
      ])}
      exit={withEase(4, { onRest: () => onEnd(id) })}
    >
      {(a) => {
        return (
          <animate.div
            style={{
              position: 'relative',
              width: 240,
              backgroundColor: '#3399ff',
              borderRadius: 4,
              height: a.value.to([0, 1, 2], [0, 100, 100]),
              opacity: a.value.to([2, 3, 4], [1, 1, 0]),
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
                width: a.value.to([2, 3], ['0%', '100%'], {
                  extrapolate: 'clamp',
                }),
              }}
            />
          </animate.div>
        );
      }}
    </MountedBlock>
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
