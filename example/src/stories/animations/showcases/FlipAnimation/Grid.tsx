import { useMemo, useState } from 'react';
import { animate, Unmount, withSpring } from 'react-ui-animate';
import { ExampleLayout } from '../../shared';

type Category = 'design' | 'engineering' | 'marketing';

interface Member {
  id: number;
  name: string;
  role: string;
  category: Category;
  color: string;
}

const MEMBERS: Member[] = [
  { id: 1, name: 'Ava', role: 'Product Designer', category: 'design', color: '#ff6b6b' },
  { id: 2, name: 'Liam', role: 'Frontend Engineer', category: 'engineering', color: '#3399ff' },
  { id: 3, name: 'Noah', role: 'Backend Engineer', category: 'engineering', color: '#3399ff' },
  { id: 4, name: 'Mia', role: 'Brand Designer', category: 'design', color: '#ff6b6b' },
  { id: 5, name: 'Ethan', role: 'Growth Marketer', category: 'marketing', color: '#22c55e' },
  { id: 6, name: 'Zoe', role: 'UX Researcher', category: 'design', color: '#ff6b6b' },
  { id: 7, name: 'Leo', role: 'Platform Engineer', category: 'engineering', color: '#3399ff' },
  { id: 8, name: 'Ivy', role: 'Content Marketer', category: 'marketing', color: '#22c55e' },
];

const FILTERS: { label: string; value: Category | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Design', value: 'design' },
  { label: 'Engineering', value: 'engineering' },
  { label: 'Marketing', value: 'marketing' },
];

function shuffle<T>(list: T[]): T[] {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const Example = () => {
  const [order, setOrder] = useState(MEMBERS.map((m) => m.id));
  const [filter, setFilter] = useState<Category | 'all'>('all');

  const visibleMembers = useMemo(() => {
    const byId = new Map(MEMBERS.map((m) => [m.id, m]));
    return order
      .map((id) => byId.get(id)!)
      .filter((m) => filter === 'all' || m.category === filter);
  }, [order, filter]);

  return (
    <ExampleLayout
      title="Flip Animation"
      description="Toggle the filters or shuffle the grid — remaining cards smoothly animate to their new position and size using the `flip` prop, no manual transform math required."
      onRestart={() => {
        setOrder(MEMBERS.map((m) => m.id));
        setFilter('all');
      }}
      showRestartButton={false}
    >
      <div
        style={{
          display: 'flex',
          gap: 10,
          marginBottom: 30,
          flexWrap: 'wrap',
        }}
      >
        {FILTERS.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            style={{
              padding: '10px 20px',
              borderRadius: 8,
              border:
                filter === value ? '2px solid #3399ff' : '2px solid #e0e0e0',
              backgroundColor: filter === value ? '#f0f9ff' : '#fff',
              color: filter === value ? '#3399ff' : '#444',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {label}
          </button>
        ))}

        <button
          onClick={() => setOrder((prev) => shuffle(prev))}
          style={{
            marginLeft: 'auto',
            padding: '10px 20px',
            borderRadius: 8,
            border: 'none',
            backgroundColor: '#1a1a1a',
            color: '#fff',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Shuffle
        </button>
      </div>

      <Unmount>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 16,
            width: '100%',
          }}
        >
          {visibleMembers.map((member) => (
            <animate.div
              key={member.id}
              flip
              style={{
                width: 180,
                padding: 20,
                borderRadius: 12,
                backgroundColor: '#fafafa',
                border: `2px solid ${member.color}`,
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              }}
              animate={{
                opacity: withSpring(1, { damping: 20 }),
                scale: withSpring(1, { damping: 20 }),
              }}
              unmount={{
                opacity: withSpring(0, { damping: 20 }),
                scale: withSpring(0.7, { damping: 20 }),
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  backgroundColor: member.color,
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  marginBottom: 12,
                }}
              >
                {member.name[0]}
              </div>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#1a1a1a' }}>
                {member.name}
              </div>
              <div style={{ fontSize: 13, color: '#666', marginTop: 4 }}>
                {member.role}
              </div>
            </animate.div>
          ))}
        </div>
      </Unmount>
    </ExampleLayout>
  );
};

export default Example;
