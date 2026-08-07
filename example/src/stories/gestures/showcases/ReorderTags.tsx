import { useState } from 'react';
import { Reorder } from 'react-ui-animate';
import { theme } from '../../animations/shared';

const INITIAL_TAGS = ['react', 'typescript', 'animation', 'gestures', 'ui'];

const Example = () => {
  const [tags, setTags] = useState(INITIAL_TAGS);

  return (
    <div style={{ padding: 40, fontFamily: theme.font.sans, color: theme.color.text }}>
      <h1 style={{ marginBottom: 10, fontSize: 26, fontWeight: 700 }}>
        Reorder — horizontal axis
      </h1>
      <p style={{ marginBottom: 30, color: theme.color.textMuted, maxWidth: 500, lineHeight: 1.6 }}>
        Same <code>Reorder.Group</code>/<code>Reorder.Item</code> API with{' '}
        <code>axis="x"</code> — useful for tag/chip lists, priority rankings
        laid out as a row, or step-order pickers. Drag a tag to reorder it.
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
              backgroundColor: theme.color.accentSoft,
              border: `1px solid ${theme.color.accent}`,
              color: theme.color.text,
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
