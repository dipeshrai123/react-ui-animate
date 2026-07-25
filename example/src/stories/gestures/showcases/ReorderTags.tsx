import { useState } from 'react';
import { Reorder } from 'react-ui-animate';

const INITIAL_TAGS = ['react', 'typescript', 'animation', 'gestures', 'ui'];

const Example = () => {
  const [tags, setTags] = useState(INITIAL_TAGS);

  return (
    <div style={{ padding: 40 }}>
      <h1 style={{ marginBottom: 10 }}>Reorder — horizontal axis</h1>
      <p style={{ marginBottom: 30, color: '#666', maxWidth: 500 }}>
        Same <code>Reorder.Group</code>/<code>Reorder.Item</code> API with{' '}
        <code>axis="x"</code> — useful for tag/chip lists, priority rankings
        laid out as a row, or step-order pickers.
      </p>

      <Reorder.Group
        values={tags}
        onReorder={setTags}
        axis="x"
        style={{ display: 'flex', flexWrap: 'wrap', gap: 10, maxWidth: 500 }}
      >
        {tags.map((tag) => (
          <Reorder.Item
            key={tag}
            value={tag}
            style={{
              padding: '8px 16px',
              borderRadius: 999,
              backgroundColor: '#1a1a1a',
              color: 'white',
              fontSize: 13,
              fontWeight: 600,
              userSelect: 'none',
            }}
          >
            #{tag}
          </Reorder.Item>
        ))}
      </Reorder.Group>
    </div>
  );
};

export default Example;
