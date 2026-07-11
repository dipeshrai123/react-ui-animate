import { useState } from 'react';
import { animate, Presence, withSpring, withTiming } from 'react-ui-animate';
import { ExampleLayout } from '../../animations/shared';

interface Card {
  id: number;
  title: string;
  description: string;
  icon: string;
  color: string;
}

const CARDS: Card[] = [
  {
    id: 1,
    title: 'Design System',
    description:
      'A unified set of tokens, components, and patterns that keep every screen in the product visually and behaviorally consistent.',
    icon: '🎨',
    color: '#ff6b6b',
  },
  {
    id: 2,
    title: 'Gesture Engine',
    description:
      'Drag, scroll, and wheel recognizers built on spring physics, so every interaction feels responsive and natural.',
    icon: '🖐️',
    color: '#3399ff',
  },
  {
    id: 3,
    title: 'Layout Transitions',
    description:
      'Automatic FLIP-based animations for position and size changes — reorder, resize, or filter without writing transform math.',
    icon: '📐',
    color: '#22c55e',
  },
  {
    id: 4,
    title: 'Spring Physics',
    description:
      'A dependency-free spring and timing driver that powers every animation in the library, from hovers to page transitions.',
    icon: '🌀',
    color: '#f59e0b',
  },
];

const Example = () => {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  return (
    <ExampleLayout
      title="Layout Animation — Modal"
      description="Click a card and it morphs directly into a fullscreen modal — the same element, animating its own position and size with the `layout` prop. No separate modal component, no manual FLIP math."
      showRestartButton={false}
    >
      <Presence>
        {expandedId !== null && (
          <animate.div
            key="backdrop"
            onClick={() => setExpandedId(null)}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0)',
              zIndex: 50,
            }}
            animate={{ backgroundColor: withTiming('rgba(0,0,0,0.45)', { duration: 200 }) }}
            exit={{ backgroundColor: withTiming('rgba(0,0,0,0)', { duration: 200 }) }}
          />
        )}
      </Presence>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 20,
          maxWidth: 900,
          margin: '0 auto',
        }}
      >
        {CARDS.map((card) => {
          const isExpanded = card.id === expandedId;

          return (
            <animate.div
              key={card.id}
              layout
              layoutOptions={withSpring({ stiffness: 260, damping: 28 })}
              onClick={() => setExpandedId(isExpanded ? null : card.id)}
              style={
                isExpanded
                  ? {
                      position: 'fixed',
                      left: 24,
                      top: 24,
                      right: 24,
                      bottom: 24,
                      zIndex: 100,
                      borderRadius: 20,
                      backgroundColor: '#fff',
                      boxShadow: '0 30px 60px rgba(0,0,0,0.3)',
                      padding: 40,
                      cursor: 'default',
                      overflow: 'auto'
                    }
                  : {
                      position: 'relative',
                      borderRadius: 16,
                      backgroundColor: '#fff',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                      padding: 24,
                      cursor: 'pointer',
                      border: `2px solid ${card.color}20`,
                    }
              }
            >
              {isExpanded ? (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedId(null);
                    }}
                    style={{
                      position: 'absolute',
                      right: 24,
                      top: 24,
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      border: 'none',
                      backgroundColor: '#f1f5f9',
                      color: '#444',
                      fontSize: 16,
                      cursor: 'pointer',
                    }}
                  >
                    ✕
                  </button>
                  <div
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: 18,
                      backgroundColor: `${card.color}20`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 34,
                      marginBottom: 20,
                    }}
                  >
                    {card.icon}
                  </div>
                  <h2 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: '#1a1a1a' }}>
                    {card.title}
                  </h2>
                  <p
                    style={{
                      marginTop: 14,
                      fontSize: 16,
                      color: '#555',
                      lineHeight: 1.7,
                      maxWidth: 520,
                    }}
                  >
                    {card.description}
                  </p>
                </>
              ) : (
                <>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      backgroundColor: `${card.color}20`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 22,
                      marginBottom: 14,
                    }}
                  >
                    {card.icon}
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: '#1a1a1a' }}>
                    {card.title}
                  </div>
                  <div style={{ marginTop: 6, fontSize: 13, color: '#888' }}>
                    Tap to expand
                  </div>
                </>
              )}
            </animate.div>
          );
        })}
      </div>
    </ExampleLayout>
  );
};

export default Example;
