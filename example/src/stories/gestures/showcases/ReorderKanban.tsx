import { useState } from 'react';
import { Reorder } from 'react-ui-animate';
import { theme } from '../../animations/shared';

interface Card {
  id: string;
  title: string;
}

type Columns = Record<'todo' | 'inProgress' | 'done', Card[]>;

const INITIAL_COLUMNS: Columns = {
  todo: [
    { id: 'c1', title: 'Design onboarding flow' },
    { id: 'c2', title: 'Write API docs' },
  ],
  inProgress: [
    { id: 'c3', title: 'Fix reorder z-index bug' },
    { id: 'c4', title: 'Add drag handles' },
  ],
  done: [{ id: 'c5', title: 'Ship useScrollReveal' }],
};

const COLUMN_META: Record<keyof Columns, { title: string; color: string }> = {
  todo: { title: 'To Do', color: '#9ca3af' },
  inProgress: { title: 'In Progress', color: theme.color.accent },
  done: { title: 'Done', color: '#22c55e' },
};

const GripIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
    {[4, 8, 12].map((y) =>
      [5, 11].map((x) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={1.3} fill={theme.color.textFaint} />
      ))
    )}
  </svg>
);

/**
 * A Kanban board: three independent `Reorder.Group`s (one per column) all
 * nested in a single `Reorder.Context`, which is what lets a card be
 * dragged out of one column's array and dropped into a different column's
 * array — plain `Reorder.Group` on its own only reorders within one list.
 */
const Example = () => {
  const [columns, setColumns] = useState(INITIAL_COLUMNS);

  return (
    <div style={{ padding: 40, fontFamily: theme.font.sans, color: theme.color.text }}>
      <h1 style={{ marginBottom: 10, fontSize: 26, fontWeight: 700 }}>Kanban board</h1>
      <p style={{ marginBottom: 30, color: theme.color.textMuted, maxWidth: 560, lineHeight: 1.6 }}>
        Drag a card by its grip icon — within a column to reorder it, or into
        a different column to move it there. Powered by{' '}
        <code>Reorder.Context</code> wrapping three <code>Reorder.Group</code>
        s, one per column.
      </p>

      <Reorder.Context>
        <div
          style={{
            display: 'flex',
            gap: 20,
            alignItems: 'flex-start',
            padding: 20,
            backgroundColor: theme.color.surface,
            border: `1px solid ${theme.color.border}`,
            borderRadius: theme.radius.lg,
          }}
        >
          {(Object.keys(columns) as Array<keyof Columns>).map((key) => {
            const { title, color } = COLUMN_META[key];
            return (
              <div
                key={key}
                style={{
                  flex: 1,
                  minWidth: 220,
                  backgroundColor: theme.color.surfaceRaised,
                  borderRadius: 12,
                  padding: 12,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 12,
                    fontSize: 13,
                    fontWeight: 700,
                    color: theme.color.textMuted,
                    textTransform: 'uppercase',
                    letterSpacing: 0.4,
                  }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: color,
                    }}
                  />
                  {title}
                  <span style={{ color: theme.color.textFaint, fontWeight: 500 }}>
                    {columns[key].length}
                  </span>
                </div>

                <Reorder.Group
                  values={columns[key]}
                  onReorder={(next) => setColumns((prev) => ({ ...prev, [key]: next }))}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    minHeight: 60,
                  }}
                >
                  {columns[key].map((card) => (
                    <Reorder.Item
                      key={card.id}
                      value={card}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '10px 12px',
                        borderRadius: 8,
                        backgroundColor: theme.color.surface,
                        border: `1px solid ${theme.color.border}`,
                        fontSize: 13,
                        color: theme.color.text,
                      }}
                    >
                      <Reorder.Handle style={{ display: 'flex' }}>
                        <GripIcon />
                      </Reorder.Handle>
                      {card.title}
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
              </div>
            );
          })}
        </div>
      </Reorder.Context>
    </div>
  );
};

export default Example;
