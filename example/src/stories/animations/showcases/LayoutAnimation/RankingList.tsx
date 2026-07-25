import { useState } from 'react';
import type { CSSProperties } from 'react';
import { animate } from 'react-ui-animate';
import { ExampleLayout } from '../../shared';

interface Player {
  id: number;
  name: string;
  score: number;
  color: string;
}

const INITIAL_PLAYERS: Player[] = [
  { id: 1, name: 'Phoenix', score: 82, color: '#ff6b6b' },
  { id: 2, name: 'Falcon', score: 76, color: '#3399ff' },
  { id: 3, name: 'Nova', score: 91, color: '#22c55e' },
  { id: 4, name: 'Vortex', score: 68, color: '#f59e0b' },
  { id: 5, name: 'Cipher', score: 74, color: '#8b5cf6' },
];

function sortByScore(players: Player[]) {
  return [...players].sort((a, b) => b.score - a.score);
}

const arrowButtonStyle: CSSProperties = {
  border: 'none',
  background: '#f3f4f6',
  color: '#555',
  borderRadius: 4,
  width: 22,
  height: 18,
  fontSize: 10,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const Example = () => {
  const [players, setPlayers] = useState(() => sortByScore(INITIAL_PLAYERS));

  const bump = (id: number, delta: number) => {
    setPlayers((prev) =>
      sortByScore(
        prev.map((p) =>
          p.id === id ? { ...p, score: Math.max(0, p.score + delta) } : p
        )
      )
    );
  };

  return (
    <ExampleLayout
      title="Layout Animation — Ranking List"
      description="Bump a player's score up or down — the list re-sorts and every row animates smoothly to its new rank using the `layout` prop, no manual position math required."
      onRestart={() => setPlayers(sortByScore(INITIAL_PLAYERS))}
    >
      <div
        style={{
          maxWidth: 480,
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        {players.map((player, index) => (
          <animate.div
            key={player.id}
            layout
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '14px 18px',
              borderRadius: 10,
              backgroundColor: '#fff',
              border: '2px solid #f0f0f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            }}
          >
            <div
              style={{
                width: 28,
                fontSize: 15,
                fontWeight: 700,
                color: '#94a3b8',
              }}
            >
              #{index + 1}
            </div>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                backgroundColor: player.color,
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {player.name[0]}
            </div>
            <div style={{ flex: 1, fontSize: 15, fontWeight: 600, color: '#1a1a1a' }}>
              {player.name}
            </div>
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: '#1a1a1a',
                width: 40,
                textAlign: 'right',
              }}
            >
              {player.score}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <button style={arrowButtonStyle} onClick={() => bump(player.id, 5)}>
                ▲
              </button>
              <button style={arrowButtonStyle} onClick={() => bump(player.id, -5)}>
                ▼
              </button>
            </div>
          </animate.div>
        ))}
      </div>
    </ExampleLayout>
  );
};

export default Example;
