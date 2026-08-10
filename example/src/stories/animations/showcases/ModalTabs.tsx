import { useRef, useState } from 'react';
import { Unmount, animate, useOutsideClick, withSpring, withTiming } from 'react-ui-animate';
import { ExampleLayout } from '../shared';

const TABS = ['Overview', 'Features', 'Pricing', 'FAQ'];

function randomTab() {
  return TABS[Math.floor(Math.random() * TABS.length)];
}

const TabBar = ({
  activeTab,
  onSelect,
}: {
  activeTab: string;
  onSelect: (tab: string) => void;
}) => (
  <div style={{ display: 'flex', gap: 24, borderBottom: '1px solid #eee' }}>
    {TABS.map((tab) => (
      <button
        key={tab}
        type="button"
        onClick={() => onSelect(tab)}
        style={{
          position: 'relative',
          appearance: 'none',
          WebkitAppearance: 'none',
          border: 'none',
          background: 'none',
          padding: '0 0 12px',
          fontSize: 15,
          fontWeight: 600,
          cursor: 'pointer',
          color: tab === activeTab ? '#1a1a1a' : '#888',
        }}
      >
        {tab}
        {tab === activeTab && (
          <animate.div
            flipId="modal-tab-indicator"
            flipOptions={withSpring({ stiffness: 260, damping: 26 })}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: -1,
              height: 2,
              backgroundColor: '#3399ff',
              borderRadius: 2,
            }}
          />
        )}
      </button>
    ))}
  </div>
);

const Modal = ({ activeTab, onSelect, onClose }: {
  activeTab: string;
  onSelect: (tab: string) => void;
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
      unmount={{
        backgroundColor: withTiming('rgba(0,0,0,0)', { duration: 200 }),
        opacity: withTiming(0, { duration: 200 }),
      }}
    >
      <animate.div
        ref={ref}
        style={{
          width: '60%',
          minHeight: 260,
          backgroundColor: 'white',
          borderRadius: 4,
          padding: 24,
          scale: 0.5,
          translateY: -100,
        }}
        animate={{
          scale: withSpring(1, { stiffness: 200, damping: 20 }),
          translateY: withSpring(0, { stiffness: 200, damping: 20 }),
        }}
        unmount={{
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
          }}
          onClick={onClose}
        >
          Close
        </button>

        <TabBar activeTab={activeTab} onSelect={onSelect} />

        <div style={{ padding: '24px 0', fontSize: 15, color: '#555' }}>
          Content for the <strong>{activeTab}</strong> tab.
        </div>
      </animate.div>
    </animate.div>
  );
};

const Example = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(TABS[0]);

  const openModal = () => {
    setActiveTab(randomTab());
    setModalOpen(true);
  };

  return (
    <ExampleLayout
      title="Modal with Tabs (flipId)"
      description="Opening the modal picks a random starting tab. The bottom-border indicator uses flipId to slide smoothly between tabs whenever the active tab changes."
      onRestart={() => setModalOpen(false)}
      showRestartButton={false}
    >
      <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
        <button
          onClick={openModal}
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
          }}
        >
          Open Modal
        </button>
      </div>
      <Unmount>
        {modalOpen && (
          <Modal
            key="modal"
            activeTab={activeTab}
            onSelect={setActiveTab}
            onClose={() => setModalOpen(false)}
          />
        )}
      </Unmount>
    </ExampleLayout>
  );
};

export default Example;
