import React from 'react';
import { animate, withSpring, withTiming, Presence } from 'react-ui-animate';

interface Card {
  id: number;
  title: string;
  description: string;
  color: string;
  icon: string;
}

const cards: Card[] = [
  {
    id: 1,
    title: 'Design System',
    description: 'Build beautiful, consistent interfaces',
    color: '#3399ff',
    icon: '🎨',
  },
  {
    id: 2,
    title: 'Animation',
    description: 'Smooth, performant animations',
    color: '#ff6b6b',
    icon: '✨',
  },
  {
    id: 3,
    title: 'Performance',
    description: 'Optimized for speed and efficiency',
    color: '#51cf66',
    icon: '⚡',
  },
  {
    id: 4,
    title: 'Developer Experience',
    description: 'Intuitive API and great docs',
    color: '#ffd43b',
    icon: '🚀',
  },
];

const CardComponent: React.FC<{ card: Card; index: number }> = ({
  card,
  index,
}) => {
  return (
    <animate.div
      style={{
        width: 280,
        height: 200,
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 24,
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        cursor: 'pointer',
        scale: 1,
        translateY: 0,
        border: `2px solid transparent`,
      }}
      hover={{
        scale: withSpring(1.05, { stiffness: 300, damping: 20 }),
        translateY: withSpring(-8, { stiffness: 300, damping: 20 }),
        borderColor: withTiming(card.color, { duration: 200 }),
      }}
      press={{
        scale: withSpring(0.98, { stiffness: 400, damping: 25 }),
      }}
    >
      <animate.div
        style={{
          width: 60,
          height: 60,
          borderRadius: 12,
          backgroundColor: `${card.color}15`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 32,
          marginBottom: 16,
          scale: 1,
          rotate: 0,
        }}
        hover={{
          scale: withSpring(1.1, { stiffness: 300, damping: 20 }),
          rotate: withSpring(5, { stiffness: 200, damping: 15 }),
        }}
      >
        {card.icon}
      </animate.div>
      <h3
        style={{
          margin: 0,
          marginBottom: 8,
          fontSize: 20,
          fontWeight: 600,
          color: '#1a1a1a',
        }}
      >
        {card.title}
      </h3>
      <p
        style={{
          margin: 0,
          fontSize: 14,
          color: '#666',
          lineHeight: 1.5,
        }}
      >
        {card.description}
      </p>
      <animate.div
        style={{
          marginTop: 16,
          width: 0,
          height: 3,
          backgroundColor: card.color,
          borderRadius: 2,
        }}
        hover={{
          width: withSpring('100%', { stiffness: 300, damping: 20 }),
        }}
      />
    </animate.div>
  );
};

const Example: React.FC = () => {
  return (
    <div
      style={{ padding: 40, backgroundColor: '#f5f5f5', minHeight: '100vh' }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <h1
          style={{
            marginBottom: 8,
            fontSize: 32,
            fontWeight: 700,
            color: '#1a1a1a',
          }}
        >
          Feature Showcase
        </h1>
        <p style={{ marginBottom: 40, fontSize: 16, color: '#666' }}>
          Hover over cards to see smooth animations
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 24,
            marginBottom: 40,
          }}
        >
          <Presence>
            {cards.map((card, index) => (
              <CardComponent key={card.id} card={card} index={index} />
            ))}
          </Presence>
        </div>
      </div>
    </div>
  );
};

export default Example;
