import { useState } from 'react';
import { Reorder } from 'react-ui-animate';

const INITIAL_ITEMS = ['Design review', 'Write tests', 'Ship the release', 'Update docs'];

const Example = () => {
  const [items, setItems] = useState(INITIAL_ITEMS);

  return (
    <div style={{ padding: 40 }}>
      <h1 style={{ marginBottom: 10 }}>Reorder</h1>
      <p style={{ marginBottom: 30, color: '#666' }}>
        Drag an item up or down to reorder the list. Displaced items animate
        out of the way automatically.
      </p>

      <Reorder.Group
        values={items}
        onReorder={setItems}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          maxWidth: 360,
        }}
      >
        {items.map((item) => (
          <Reorder.Item
            key={item}
            value={item}
            style={{
              padding: '16px 20px',
              borderRadius: 10,
              backgroundColor: '#f0f9ff',
              border: '2px solid #3399ff',
              fontSize: 15,
              fontWeight: 500,
              color: '#1a1a1a',
              userSelect: 'none',
              boxShadow: '0 2px 8px rgba(51, 153, 255, 0.15)',
            }}
          >
            {item}
          </Reorder.Item>
        ))}
      </Reorder.Group>
    </div>
  );
};

export default Example;
