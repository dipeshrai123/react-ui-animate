import { useRef, useState } from 'react';
import { Presence, animate, useOutsideClick, withSpring, withTiming } from 'react-ui-animate';
import { ExampleLayout } from '../animations/shared';

const Modal = ({
  onClose,
}: {
  onClose: () => void;
}) => {
  const ref = useRef(null);
  useOutsideClick(ref, onClose);

  return (
    <animate.div
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0)',
        opacity: 0,
      }}
      animate={{
        backgroundColor: withTiming('rgba(0,0,0,0.2)', { duration: 200 }),
        opacity: withTiming(1, { duration: 200 }),
      }}
      exit={{
        backgroundColor: withTiming('rgba(0,0,0,0)', { duration: 200 }),
        opacity: withTiming(0, { duration: 200 }),
      }}
    >
      <animate.div
        ref={ref}
        style={{
          width: '60%',
          height: 300,
          backgroundColor: 'white',
          borderRadius: 4,
          padding: 20,
          scale: 0.5,
          translateY: -100,
        }}
        animate={{
          scale: withSpring(1, { stiffness: 200, damping: 20 }),
          translateY: withSpring(0, { stiffness: 200, damping: 20 }),
        }}
        exit={{
          scale: withSpring(0.5, { stiffness: 200, damping: 20 }),
          translateY: withSpring(-100, { stiffness: 200, damping: 20 }),
        }}
      >
        <button
          style={{
            position: 'absolute',
            right: 20,
            top: 20,
            padding: '8px 16px',
            fontSize: 14,
            fontWeight: 500,
            backgroundColor: '#f5f5f5',
            color: '#333',
            border: '1px solid #ddd',
            borderRadius: 6,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onClick={onClose}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#e0e0e0';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#f5f5f5';
          }}
        >
          Close
        </button>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#1a1a1a' }}>
            Modal Title
          </h2>
          <p style={{ margin: 0, fontSize: 16, color: '#666', textAlign: 'center' }}>
            This is a beautifully animated modal with smooth spring animations.
          </p>
        </div>
      </animate.div>
    </animate.div>
  );
};

const Example = () => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <ExampleLayout
      title="Modal Animation"
      description="A beautiful modal with smooth enter/exit animations using Presence and animate components. Click outside or close button to dismiss."
      onRestart={() => setModalOpen(false)}
      showRestartButton={false}
    >
      <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
        <button
          onClick={() => setModalOpen(true)}
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
          Open Modal
        </button>
      </div>
      <Presence>
        {modalOpen && <Modal key="modal" onClose={() => setModalOpen(false)} />}
      </Presence>
    </ExampleLayout>
  );
};

export default Example;
