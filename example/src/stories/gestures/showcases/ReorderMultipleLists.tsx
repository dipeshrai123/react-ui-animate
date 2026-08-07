import { useState } from 'react';
import { Reorder } from 'react-ui-animate';
import { theme } from '../../animations/shared';

const List = ({
  title,
  color,
  initialItems,
}: {
  title: string;
  color: string;
  initialItems: string[];
}) => {
  const [items, setItems] = useState(initialItems);

  return (
    <div style={{ flex: 1, minWidth: 220 }}>
      <h3 style={{ marginBottom: 12, fontSize: 15, color: theme.color.textMuted }}>{title}</h3>
      <Reorder.Group
        values={items}
        onReorder={setItems}
        style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
      >
        {items.map((item) => (
          <Reorder.Item
            key={item}
            value={item}
            style={{
              padding: '10px 14px',
              borderRadius: 8,
              backgroundColor: theme.color.surface,
              border: `1px solid ${color}`,
              fontSize: 14,
              fontWeight: 500,
              color: theme.color.text,
            }}
          >
            {item}
          </Reorder.Item>
        ))}
      </Reorder.Group>
    </div>
  );
};

/**
 * Each `Reorder.Group` is fully self-contained (its own context, its own
 * element registry) — rendering several on one page, each with its own
 * `values`/`onReorder`, works with no extra setup. Dragging is scoped to
 * the list an item started in; it can't be dropped into a different group's
 * list (that's a separate, larger feature — cross-list drag-and-drop).
 */
const Example = () => {
  return (
    <div style={{ padding: 40, fontFamily: theme.font.sans, color: theme.color.text }}>
      <h1 style={{ marginBottom: 10, fontSize: 26, fontWeight: 700 }}>
        Multiple independent lists
      </h1>
      <p style={{ marginBottom: 30, color: theme.color.textMuted, maxWidth: 560, lineHeight: 1.6 }}>
        Three separate <code>Reorder.Group</code>s on one page, each with its
        own state. Reordering one never affects the others.
      </p>

      <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
        <List
          title="Backlog"
          color="#9ca3af"
          initialItems={['Spec out v2 API', 'Research competitors']}
        />
        <List
          title="In progress"
          color={theme.color.accent}
          initialItems={['Fix reorder z-index bug', 'Add drag handles']}
        />
        <List
          title="Done"
          color="#22c55e"
          initialItems={['Ship useScrollReveal', 'Ship useTimeline']}
        />
      </div>
    </div>
  );
};

export default Example;
