import React, { useState, useEffect } from 'react';
import {
  animate,
  Unmount,
  useUnmount,
  useIsUnmounting,
  withTiming,
} from 'react-ui-animate';
import { ExampleLayout, Section, ExampleCard, Button } from '../../shared';

const AnimatedNotification: React.FC<{ message: string }> = ({ message }) => {
  const [isPresent, onExitComplete] = useUnmount();
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    if (!isPresent && shouldRender) {
      const timer = setTimeout(() => {
        setShouldRender(false);
        onExitComplete();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isPresent, shouldRender, onExitComplete]);

  if (!shouldRender) return null;

  return (
    <animate.div
      style={{
        padding: '12px 20px',
        backgroundColor: '#4caf50',
        color: 'white',
        borderRadius: 8,
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        opacity: 0,
        translateX: 300,
      }}
      animate={{
        opacity: withTiming(1, { duration: 300 }),
        translateX: withTiming(0, { duration: 300 }),
      }}
      unmount={{
        opacity: withTiming(0, { duration: 200 }),
        translateX: withTiming(300, { duration: 200 }),
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span>{message}</span>
        <span style={{ fontSize: 12, opacity: 0.8 }}>
          {isPresent ? '✓ Present' : '→ Exiting'}
        </span>
      </div>
    </animate.div>
  );
};

const NestedComponent: React.FC = () => {
  const isUnmounting = useIsUnmounting();

  return (
    <div style={{ padding: 8, background: 'rgba(255,255,255,0.1)', borderRadius: 4 }}>
      <p style={{ margin: 0, fontSize: 12 }}>
        Nested component — present: {isUnmounting ? 'No' : 'Yes'}
      </p>
    </div>
  );
};

const AnimatedPanel: React.FC = () => {
  const [isPresent] = useUnmount();

  return (
    <animate.div
      style={{
        width: 300,
        padding: 20,
        backgroundColor: '#673ab7',
        borderRadius: 12,
        color: 'white',
        opacity: 0,
        scale: 0.9,
      }}
      animate={{
        opacity: withTiming(1, { duration: 300 }),
        scale: withTiming(1, { duration: 300 }),
      }}
      unmount={{
        opacity: withTiming(0, { duration: 200 }),
        scale: withTiming(0.9, { duration: 200 }),
      }}
    >
      <h3 style={{ margin: '0 0 12px' }}>Animated panel</h3>
      <p style={{ margin: '0 0 12px', fontSize: 14 }}>
        This panel uses useUnmount to access unmount state.
      </p>
      <NestedComponent />
      {isPresent && (
        <div style={{ marginTop: 12, padding: 8, background: 'rgba(255,255,255,0.1)', borderRadius: 4 }}>
          This content only renders when present
        </div>
      )}
    </animate.div>
  );
};

interface Notification {
  id: number;
  message: string;
}

let notificationId = 0;

const Example: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showPanel, setShowPanel] = useState(false);

  const addNotification = () => {
    notificationId++;
    setNotifications((prev) => [
      ...prev,
      { id: notificationId, message: `Notification ${notificationId}` },
    ]);
  };

  const removeNotification = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <ExampleLayout
      tag="MODULE"
      title="useUnmount"
      description={
        <>
          Access unmount state — and a manual <code>onExitComplete</code> signal — from inside the
          exiting component, for cases where the unmount needs to wait on more than just its own
          animation, like an async cleanup step before removal.
        </>
      }
      showRestartButton={false}
    >
      <Section title="Notifications with useUnmount">
        <ExampleCard>
          <div style={{ marginBottom: 12 }}>
            <Button accent="#4caf50" onClick={addNotification}>
              Add notification
            </Button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Unmount>
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => removeNotification(notification.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <AnimatedNotification message={notification.message} />
                </div>
              ))}
            </Unmount>
          </div>
        </ExampleCard>
      </Section>

      <Section title="Panel with useUnmount">
        <ExampleCard>
          <div style={{ marginBottom: 16 }}>
            <Button accent="#673ab7" onClick={() => setShowPanel((prev) => !prev)}>
              {showPanel ? 'Hide panel' : 'Show panel'}
            </Button>
          </div>
          <Unmount>{showPanel && <AnimatedPanel key="panel" />}</Unmount>
        </ExampleCard>
      </Section>
    </ExampleLayout>
  );
};

export default Example;
