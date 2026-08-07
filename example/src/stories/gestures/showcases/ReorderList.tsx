import { useState } from 'react';
import { Reorder } from 'react-ui-animate';
import { theme } from '../../animations/shared';

const INITIAL_ITEMS = ['Design review', 'Write tests', 'Ship the release', 'Update docs'];

const Example = () => {
  const [items, setItems] = useState(INITIAL_ITEMS);

  return (
    <div style={{ padding: 40, fontFamily: theme.font.sans, color: theme.color.text }}>
      <h1 style={{ marginBottom: 10, fontSize: 26, fontWeight: 700 }}>Reorder</h1>
      <p style={{ marginBottom: 30, color: theme.color.textMuted, lineHeight: 1.6 }}>
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
              backgroundColor: theme.color.accentSoft,
              border: `1px solid ${theme.color.accent}`,
              fontSize: 15,
              fontWeight: 500,
              color: theme.color.text,
              userSelect: 'none',
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
