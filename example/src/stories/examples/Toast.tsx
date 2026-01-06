import { useCallback, useState } from 'react';
import {
  animate,
  Presence,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
} from 'react-ui-animate';
import { ExampleLayout } from '../animations/shared';

const Toast = ({ id, onEnd }: { id: number; onEnd: (id: number) => void }) => {
  return (
    <animate.div
      style={{
        position: 'relative',
        width: 300,
        backgroundColor: '#3399ff',
        borderRadius: 12,
        height: 0,
        opacity: 0,
        scale: 0.8,
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
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
          padding: 20,
          color: 'white',
          fontWeight: 600,
          fontSize: 15,
        }}
      >
        🎉 Toast Notification #{id}
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
    <ExampleLayout
      title="Toast Notifications"
      description="Beautiful toast notifications with smooth animations and auto-dismiss. Each toast has a progress bar that indicates remaining time."
      onRestart={() => setToasts([])}
      showRestartButton={false}
    >
      <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
        <button
          onClick={addToast}
          style={{
            padding: '12px 24px',
            fontSize: 16,
            fontWeight: 600,
            backgroundColor: '#3399ff',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(51, 153, 255, 0.3)',
            transition: 'transform 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          Show Toast
        </button>
      </div>

      <div
        style={{
          position: 'fixed',
          right: 20,
          bottom: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          zIndex: 1000,
        }}
      >
        <Presence>
          {toasts.map((t) => (
            <Toast key={t.id} id={t.id} onEnd={removeToast} />
          ))}
        </Presence>
      </div>
    </ExampleLayout>
  );
};

export default Example;
