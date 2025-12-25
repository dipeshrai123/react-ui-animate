import React, { useState, useEffect } from 'react';
import { animate, Presence, usePresence, useIsPresent, withTiming } from 'react-ui-animate';

/**
 * Example: Using usePresence for manual exit control
 * 
 * usePresence() returns [isPresent, onExitComplete]:
 * - isPresent: boolean indicating if component is present (not exiting)
 * - onExitComplete: function to manually call when exit animation completes
 * 
 * Use this when you need to:
 * - Manually control when exit completes (e.g., for async operations)
 * - Access both the presence state and the completion callback
 * - Implement custom exit logic
 */
const AnimatedNotification: React.FC<{ message: string }> = ({ message }) => {
  const [isPresent, onExitComplete] = usePresence();
  const [shouldRender, setShouldRender] = useState(true);

  // Example: Custom exit logic - delay removal after animation
  useEffect(() => {
    if (!isPresent && shouldRender) {
      // Wait a bit before actually removing from DOM
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
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        opacity: 0,
        translateX: 300,
      }}
      animate={{
        opacity: withTiming(1, { duration: 300 }),
        translateX: withTiming(0, { duration: 300 }),
      }}
      exit={{
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

/**
 * Example: Using usePresence in nested components
 * 
 * When you have nested components inside Presence, you can use usePresence
 * or useIsPresent to access presence state from any level of nesting.
 */
const NestedComponent: React.FC = () => {
  const isPresent = useIsPresent();

  // Example: Log presence state changes
  useEffect(() => {
    console.log('Presence state changed:', isPresent);
  }, [isPresent]);

  return (
    <div style={{ padding: 8, background: 'rgba(255,255,255,0.1)', borderRadius: 4 }}>
      <p style={{ margin: 0, fontSize: 12 }}>
        Nested component - Present: {isPresent ? 'Yes' : 'No'}
      </p>
    </div>
  );
};

const AnimatedPanel: React.FC = () => {
  const [isPresent] = usePresence();

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
      exit={{
        opacity: withTiming(0, { duration: 200 }),
        scale: withTiming(0.9, { duration: 200 }),
      }}
    >
      <h3 style={{ margin: '0 0 12px' }}>Animated Panel</h3>
      <p style={{ margin: '0 0 12px', fontSize: 14 }}>
        This panel uses usePresence to access presence state.
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Notification example */}
      <div>
        <h3 style={{ margin: '0 0 12px' }}>Notifications with usePresence</h3>
        <button
          onClick={addNotification}
          style={{
            padding: '8px 16px',
            backgroundColor: '#4caf50',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            marginBottom: 12,
          }}
        >
          Add Notification
        </button>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Presence>
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => removeNotification(notification.id)}
                style={{ cursor: 'pointer' }}
              >
                <AnimatedNotification message={notification.message} />
              </div>
            ))}
          </Presence>
        </div>
      </div>

      {/* Panel example */}
      <div>
        <h3 style={{ margin: '0 0 12px' }}>Panel with usePresence</h3>
        <button
          onClick={() => setShowPanel((prev) => !prev)}
          style={{
            padding: '8px 16px',
            backgroundColor: '#673ab7',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
          }}
        >
          {showPanel ? 'Hide Panel' : 'Show Panel'}
        </button>
        <Presence>
          {showPanel && <AnimatedPanel key="panel" />}
        </Presence>
      </div>
    </div>
  );
};

export default Example;

