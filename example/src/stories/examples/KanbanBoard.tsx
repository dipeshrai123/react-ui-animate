import { createRef, useMemo, useRef, useState } from 'react';
import {
  animate,
  clamp,
  useDrag,
  useValue,
  withSpring,
} from 'react-ui-animate';
import { ExampleLayout } from '../animations/shared';

type ColumnId = 'todo' | 'in-progress' | 'done';
type Priority = 'low' | 'medium' | 'high';

interface KanbanCard {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  tags: string[];
  assignee: { name: string; initials: string; color: string };
}

type ColumnState = Record<ColumnId, string[]>;

const COLUMNS: { id: ColumnId; label: string; icon: string; accent: string }[] = [
  { id: 'todo', label: 'To Do', icon: '📋', accent: '#6366f1' },
  { id: 'in-progress', label: 'In Progress', icon: '⚡', accent: '#f59e0b' },
  { id: 'done', label: 'Done', icon: '✓', accent: '#10b981' },
];

const CARDS: KanbanCard[] = [
  {
    id: 'c1',
    title: 'Design system tokens',
    description: 'Define color, spacing, and typography scales',
    priority: 'high',
    tags: ['Design', 'UI'],
    assignee: { name: 'Sarah Chen', initials: 'SC', color: '#6366f1' },
  },
  {
    id: 'c2',
    title: 'User research interviews',
    description: 'Schedule and conduct 5 user interviews',
    priority: 'medium',
    tags: ['Research'],
    assignee: { name: 'Alex Rivera', initials: 'AR', color: '#ec4899' },
  },
  {
    id: 'c3',
    title: 'Competitive analysis',
    description: 'Review top 3 competitors and document findings',
    priority: 'low',
    tags: ['Research', 'Strategy'],
    assignee: { name: 'Jordan Lee', initials: 'JL', color: '#8b5cf6' },
  },
  {
    id: 'c4',
    title: 'Implement drag gestures',
    description: 'Build useDrag hook with spring physics',
    priority: 'high',
    tags: ['Engineering', 'Gestures'],
    assignee: { name: 'Morgan Kim', initials: 'MK', color: '#3399ff' },
  },
  {
    id: 'c5',
    title: 'API integration',
    description: 'Connect frontend to REST endpoints',
    priority: 'medium',
    tags: ['Engineering', 'Backend'],
    assignee: { name: 'Taylor Brooks', initials: 'TB', color: '#14b8a6' },
  },
  {
    id: 'c6',
    title: 'Write documentation',
    description: 'Update README with gesture examples',
    priority: 'medium',
    tags: ['Docs'],
    assignee: { name: 'Casey Wong', initials: 'CW', color: '#f97316' },
  },
  {
    id: 'c7',
    title: 'Setup CI pipeline',
    description: 'Configure GitHub Actions for tests and builds',
    priority: 'low',
    tags: ['DevOps'],
    assignee: { name: 'Riley Park', initials: 'RP', color: '#64748b' },
  },
  {
    id: 'c8',
    title: 'Performance audit',
    description: 'Profile animations and optimize re-renders',
    priority: 'high',
    tags: ['Performance'],
    assignee: { name: 'Morgan Kim', initials: 'MK', color: '#3399ff' },
  },
];

const INITIAL_COLUMN_STATE: ColumnState = {
  todo: ['c1', 'c2', 'c3'],
  'in-progress': ['c4', 'c5'],
  done: ['c6', 'c7', 'c8'],
};

const COL_W = 300;
const COL_GAP = 20;
const CARD_H = 96;
const CARD_GAP = 10;
const COL_HEADER = 52;
const COL_PAD = 14;

const cardIndex = new Map(CARDS.map((c, i) => [c.id, i]));

function getSlotPosition(column: ColumnId, index: number) {
  const colIdx = COLUMNS.findIndex((c) => c.id === column);
  return {
    x: colIdx * (COL_W + COL_GAP) + COL_PAD,
    y: COL_HEADER + COL_PAD + index * (CARD_H + CARD_GAP),
  };
}

function computeLayout(state: ColumnState) {
  const xs = new Array(CARDS.length).fill(0);
  const ys = new Array(CARDS.length).fill(0);

  for (const col of COLUMNS) {
    state[col.id].forEach((id, index) => {
      const i = cardIndex.get(id)!;
      const pos = getSlotPosition(col.id, index);
      xs[i] = pos.x;
      ys[i] = pos.y;
    });
  }

  return { xs, ys };
}

function insertIntoColumn(
  state: ColumnState,
  cardId: string,
  targetColumn: ColumnId,
  targetIndex: number
): ColumnState {
  const next: ColumnState = {
    todo: [...state.todo],
    'in-progress': [...state['in-progress']],
    done: [...state.done],
  };

  for (const col of COLUMNS) {
    next[col.id] = next[col.id].filter((id) => id !== cardId);
  }

  const columnCards = next[targetColumn];
  columnCards.splice(clamp(targetIndex, 0, columnCards.length), 0, cardId);

  return next;
}

function findDropTarget(
  cardId: string,
  origin: { x: number; y: number },
  movement: { x: number; y: number },
  state: ColumnState
) {
  const centerX = origin.x + (COL_W - COL_PAD * 2) / 2 + movement.x;
  const centerY = origin.y + CARD_H / 2 + movement.y;

  const colIdx = clamp(
    Math.floor(centerX / (COL_W + COL_GAP)),
    0,
    COLUMNS.length - 1
  );
  const column = COLUMNS[colIdx].id;

  const othersInColumn = state[column].filter((id) => id !== cardId);
  const relativeY = centerY - (COL_HEADER + COL_PAD);
  const index = clamp(
    Math.round(relativeY / (CARD_H + CARD_GAP)),
    0,
    othersInColumn.length
  );

  return { column, index };
}

const PRIORITY_STYLES: Record<
  Priority,
  { label: string; bg: string; color: string }
> = {
  high: { label: 'High', bg: '#fef2f2', color: '#dc2626' },
  medium: { label: 'Medium', bg: '#fffbeb', color: '#d97706' },
  low: { label: 'Low', bg: '#f3f4f6', color: '#6b7280' },
};

const Example = () => {
  const columnStateRef = useRef<ColumnState>(INITIAL_COLUMN_STATE);
  const dragOriginRef = useRef<{ x: number; y: number } | null>(null);
  const [columns, setColumns] = useState<ColumnState>(INITIAL_COLUMN_STATE);
  const [hoverColumn, setHoverColumn] = useState<ColumnId | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const refs = useRef(CARDS.map(() => createRef<HTMLDivElement>())).current;

  const getCardOrigin = (cardId: string) => {
    const column = findColumnOfCard(columnStateRef.current, cardId)!;
    const index = columnStateRef.current[column].indexOf(cardId);
    return getSlotPosition(column, index);
  };

  const initialLayout = computeLayout(INITIAL_COLUMN_STATE);
  const [posX, setPosX] = useValue(initialLayout.xs);
  const [posY, setPosY] = useValue(initialLayout.ys);
  const [scale, setScale] = useValue(CARDS.map(() => 1));
  const [zIndex, setZIndex] = useValue(CARDS.map(() => 1));
  const [rotate, setRotate] = useValue(CARDS.map(() => 0));

  const resetBoard = () => {
    columnStateRef.current = INITIAL_COLUMN_STATE;
    setColumns(INITIAL_COLUMN_STATE);
    setHoverColumn(null);
    setIsDragging(false);
    dragOriginRef.current = null;
    const layout = computeLayout(INITIAL_COLUMN_STATE);
    setPosX(layout.xs);
    setPosY(layout.ys);
    setScale(CARDS.map(() => 1));
    setZIndex(CARDS.map(() => 1));
    setRotate(CARDS.map(() => 0));
  };

  useDrag(
    refs,
    ({ index: refIndex, down, movement }) => {
      const cardId = CARDS[refIndex!].id;
      const i = refIndex!;

      if (down) {
        if (!dragOriginRef.current) {
          dragOriginRef.current = getCardOrigin(cardId);
        }

        setIsDragging(true);
        const origin = dragOriginRef.current;

        const target = findDropTarget(
          cardId,
          origin,
          movement,
          columnStateRef.current
        );
        setHoverColumn(target.column);

        const preview = insertIntoColumn(
          columnStateRef.current,
          cardId,
          target.column,
          target.index
        );
        const layout = computeLayout(preview);

        const xs = layout.xs.map((x, j) =>
          j === i ? origin.x + movement.x : x
        );
        const ys = layout.ys.map((y, j) =>
          j === i ? origin.y + movement.y : y
        );
        const scales = CARDS.map((_, j) => (j === i ? 1.04 : 1));
        const zs = CARDS.map((_, j) => (j === i ? 100 : 1));
        const rots = CARDS.map((_, j) =>
          j === i ? clamp(movement.x * 0.04, -3, 3) : 0
        );

        setPosX(xs);
        setPosY(withSpring(ys, { stiffness: 520, damping: 38 }));
        setScale(withSpring(scales, { stiffness: 400, damping: 25 }));
        setZIndex(zs);
        setRotate(withSpring(rots, { stiffness: 300, damping: 20 }));
      } else {
        const origin = dragOriginRef.current ?? getCardOrigin(cardId);
        dragOriginRef.current = null;

        const target = findDropTarget(
          cardId,
          origin,
          movement,
          columnStateRef.current
        );

        const nextState = insertIntoColumn(
          columnStateRef.current,
          cardId,
          target.column,
          target.index
        );
        columnStateRef.current = nextState;
        setColumns(nextState);
        setHoverColumn(null);
        setIsDragging(false);

        const layout = computeLayout(nextState);
        setPosX(withSpring(layout.xs, { stiffness: 400, damping: 30 }));
        setPosY(withSpring(layout.ys, { stiffness: 400, damping: 30 }));
        setScale(withSpring(CARDS.map(() => 1), { stiffness: 400, damping: 25 }));
        setZIndex(CARDS.map(() => 1));
        setRotate(withSpring(CARDS.map(() => 0), { stiffness: 300, damping: 20 }));
      }
    },
    { threshold: 6 }
  );

  const shadows = useMemo(
    () =>
      scale.map((s) =>
        s.to((v) =>
          v > 1
            ? '0 20px 40px rgba(0,0,0,0.15), 0 0 0 1px rgba(99,102,241,0.2)'
            : '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)'
        )
      ),
    [scale]
  );

  const boardHeight =
    COL_HEADER +
    COL_PAD * 2 +
    Math.max(...COLUMNS.map((c) => columns[c.id].length)) * (CARD_H + CARD_GAP) +
    40;

  return (
    <ExampleLayout
      title="Kanban Board"
      description="Drag cards between columns or reorder within a column. Spring physics, drop-zone feedback, and smooth layout transitions powered by react-ui-animate."
      onRestart={resetBoard}
    >
      <div
        style={{
          background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)',
          borderRadius: 20,
          padding: 32,
          border: '1px solid #e2e8f0',
        }}
      >
        <div
          style={{
            position: 'relative',
            width: COLUMNS.length * COL_W + (COLUMNS.length - 1) * COL_GAP,
            height: boardHeight,
            margin: '0 auto',
          }}
        >
          {COLUMNS.map((col, colIdx) => {
            const isHovered = isDragging && hoverColumn === col.id;
            const count = columns[col.id].length;

            return (
              <div
                key={col.id}
                style={{
                  position: 'absolute',
                  left: colIdx * (COL_W + COL_GAP),
                  top: 0,
                  width: COL_W,
                  height: '100%',
                  backgroundColor: isHovered ? `${col.accent}08` : '#ffffff',
                  borderRadius: 16,
                  border: isHovered
                    ? `2px dashed ${col.accent}`
                    : '2px solid transparent',
                  boxShadow: isHovered
                    ? `0 0 0 4px ${col.accent}15`
                    : '0 1px 3px rgba(0,0,0,0.06)',
                  transition: 'background-color 0.2s, border-color 0.2s, box-shadow 0.2s',
                }}
              >
                <div
                  style={{
                    height: COL_HEADER,
                    padding: '0 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    borderBottom: '1px solid #f1f5f9',
                  }}
                >
                  <span style={{ fontSize: 18 }}>{col.icon}</span>
                  <span
                    style={{
                      fontSize: 15,
                      fontWeight: 600,
                      color: '#1e293b',
                      flex: 1,
                    }}
                  >
                    {col.label}
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: col.accent,
                      backgroundColor: `${col.accent}15`,
                      padding: '2px 8px',
                      borderRadius: 999,
                    }}
                  >
                    {count}
                  </span>
                </div>

                {count === 0 && isDragging && (
                  <div
                    style={{
                      margin: COL_PAD,
                      padding: 24,
                      borderRadius: 12,
                      border: `2px dashed ${col.accent}40`,
                      textAlign: 'center',
                      color: col.accent,
                      fontSize: 13,
                      fontWeight: 500,
                    }}
                  >
                    Drop here
                  </div>
                )}
              </div>
            );
          })}

          {CARDS.map((card, i) => {
            const priority = PRIORITY_STYLES[card.priority];

            return (
              <animate.div
                key={card.id}
                ref={refs[i]}
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  width: COL_W - COL_PAD * 2,
                  height: CARD_H,
                  backgroundColor: '#ffffff',
                  borderRadius: 12,
                  padding: '12px 14px',
                  cursor: isDragging ? 'grabbing' : 'grab',
                  userSelect: 'none',
                  touchAction: 'none',
                  translateX: posX[i],
                  translateY: posY[i],
                  scale: scale[i],
                  rotate: rotate[i],
                  zIndex: zIndex[i],
                  boxShadow: shadows[i],
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 8,
                  }}
                >
                  <div
                    style={{
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: '#1e293b',
                        lineHeight: 1.3,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {card.title}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: '#64748b',
                        lineHeight: 1.3,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        marginTop: 2,
                      }}
                    >
                      {card.description}
                    </div>
                  </div>
                  <div
                    style={{
                      color: '#cbd5e1',
                      fontSize: 14,
                      lineHeight: 1,
                      letterSpacing: -2,
                      flexShrink: 0,
                      paddingTop: 2,
                    }}
                    aria-hidden
                  >
                    ⠿
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: 'auto',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: 0.4,
                        padding: '2px 6px',
                        borderRadius: 4,
                        backgroundColor: priority.bg,
                        color: priority.color,
                      }}
                    >
                      {priority.label}
                    </span>
                    {card.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        style={{
                          fontSize: 10,
                          fontWeight: 500,
                          padding: '2px 6px',
                          borderRadius: 4,
                          backgroundColor: '#f1f5f9',
                          color: '#64748b',
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div
                    title={card.assignee.name}
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      backgroundColor: card.assignee.color,
                      color: '#fff',
                      fontSize: 9,
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {card.assignee.initials}
                  </div>
                </div>
              </animate.div>
            );
          })}
        </div>

        <p
          style={{
            marginTop: 24,
            textAlign: 'center',
            fontSize: 13,
            color: '#94a3b8',
          }}
        >
          Drag cards to reorder or move between columns · Release to snap into place
        </p>
      </div>
    </ExampleLayout>
  );
};

function findColumnOfCard(state: ColumnState, cardId: string): ColumnId | null {
  for (const col of COLUMNS) {
    if (state[col.id].includes(cardId)) return col.id;
  }
  return null;
}

export default Example;
