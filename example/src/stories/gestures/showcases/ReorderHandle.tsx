import { useState } from 'react';
import { Reorder } from 'react-ui-animate';

const INITIAL_ITEMS = ['Design review', 'Write tests', 'Ship the release', 'Update docs'];

const GripIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    {[4, 8, 12].map((y) =>
      [5, 11].map((x) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={1.4} fill="#94a3b8" />
      ))
    )}
  </svg>
);

const Example = () => {
  const [items, setItems] = useState(INITIAL_ITEMS);

  return (
    <div style={{ padding: 40 }}>
      <h1 style={{ marginBottom: 10 }}>Reorder with a drag handle</h1>
      <p style={{ marginBottom: 30, color: '#666', maxWidth: 500 }}>
        Only the grip icon starts a drag — the "Remove" button stays clickable
        instead of every pointerdown on the row being a potential drag.
      </p>

      <Reorder.Group
        values={items}
        onReorder={setItems}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          maxWidth: 380,
        }}
      >
        {items.map((item) => (
          <Reorder.Item
            key={item}
            value={item}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 16px',
              borderRadius: 10,
              backgroundColor: '#f0f9ff',
              border: '2px solid #3399ff',
              boxShadow: '0 2px 8px rgba(51, 153, 255, 0.15)',
            }}
          >
            <Reorder.Handle style={{ display: 'flex', padding: 4 }}>
              <GripIcon />
            </Reorder.Handle>

            <span style={{ flex: 1, fontSize: 15, fontWeight: 500, color: '#1a1a1a' }}>
              {item}
            </span>

            <button
              onClick={() => setItems((prev) => prev.filter((i) => i !== item))}
              style={{
                border: 'none',
                background: 'transparent',
                color: '#ff6b6b',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Remove
            </button>
          </Reorder.Item>
        ))}
      </Reorder.Group>
    </div>
  );
};

export default Example;
