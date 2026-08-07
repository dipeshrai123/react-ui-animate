import React, { useState } from 'react';
import { animate, Unmount, withTiming, withSpring } from 'react-ui-animate';
import { ExampleLayout, ExampleCard, Button } from '../../shared';

interface Item {
  id: number;
  text: string;
}

const Example: React.FC = () => {
  const [items, setItems] = useState<Item[]>([
    { id: 1, text: 'Item 1' },
    { id: 2, text: 'Item 2' },
    { id: 3, text: 'Item 3' },
  ]);

  const addItem = () => {
    const id = Math.max(0, ...items.map((i) => i.id)) + 1;
    setItems([...items, { id, text: `Item ${id}` }]);
  };

  const removeItem = (id: number) => {
    setItems(items.filter((item) => item.id !== id));
  };

  return (
    <ExampleLayout
      tag="MODULE"
      title="Unmount with a list"
      description="Each list item gets its own unmount animation when removed, so items animate out individually instead of the list just snapping to its new length."
      showRestartButton={false}
    >
      <ExampleCard>
        <div style={{ width: 300 }}>
          <div style={{ marginBottom: 16 }}>
            <Button variant="primary" onClick={addItem}>
              Add item
            </Button>
          </div>

          <Unmount>
            {items.map((item) => (
              <animate.div
                key={item.id}
                style={{
                  padding: 16,
                  marginBottom: 8,
                  backgroundColor: '#3399ff',
                  borderRadius: 8,
                  color: 'white',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  opacity: 0,
                  translateX: -50,
                }}
                animate={{
                  opacity: withTiming(1, { duration: 300 }),
                  translateX: withSpring(0, { stiffness: 200, damping: 20 }),
                }}
                unmount={{
                  opacity: withTiming(0, { duration: 200 }),
                  translateX: withSpring(50, { stiffness: 200, damping: 20 }),
                }}
              >
                <span>{item.text}</span>
                <button
                  onClick={() => removeItem(item.id)}
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    border: 'none',
                    borderRadius: 4,
                    padding: '4px 8px',
                    color: 'white',
                    cursor: 'pointer',
                  }}
                >
                  Remove
                </button>
              </animate.div>
            ))}
          </Unmount>
        </div>
      </ExampleCard>
    </ExampleLayout>
  );
};

export default Example;
