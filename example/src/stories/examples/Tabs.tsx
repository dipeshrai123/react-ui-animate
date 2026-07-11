import { useState } from 'react';
import { animate } from 'react-ui-animate';
import { ExampleLayout } from '../animations/shared';

const TABS = ['Overview', 'Features', 'Pricing', 'FAQ'];

function Example() {
  const [activeTab, setActiveTab] = useState(TABS[0]);

  return (
    <ExampleLayout
      title="Shared Layout Transition (layoutId)"
      description="The indicator is a different element under each tab. Setting the same layoutId on all of them makes it morph smoothly from wherever it last was to the newly active tab — no manual coordinate math required."
      onRestart={() => setActiveTab(TABS[0])}
      showRestartButton={false}
    >
      <div
        style={{
          display: 'inline-flex',
          gap: 4,
          padding: 4,
          backgroundColor: '#f0f0f0',
          borderRadius: 12,
        }}
      >
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            style={{
              position: 'relative',
              appearance: 'none',
              WebkitAppearance: 'none',
              border: 'none',
              background: 'none',
              padding: '10px 20px',
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer',
              color: tab === activeTab ? '#1a1a1a' : '#888',
              zIndex: 1,
            }}
          >
            {tab === activeTab && (
              <animate.div
                layoutId="tab-indicator"
                layoutOptions={{ stiffness: 400, damping: 32 }}
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: 'white',
                  borderRadius: 8,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  zIndex: -1,
                }}
              />
            )}
            {tab}
          </button>
        ))}
      </div>
    </ExampleLayout>
  );
}

export default Example;
