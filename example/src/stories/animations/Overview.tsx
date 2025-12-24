import React from 'react';
import { Link } from 'react-router-dom';

const Example: React.FC = () => {
  const categories = [
    {
      title: 'Components',
      description: 'Core animated components',
      items: [
        { name: 'animate', path: '/animations/components/animate' },
        { name: 'makeAnimated', path: '/animations/components/makeAnimated' },
      ],
    },
    {
      title: 'Descriptors',
      description: 'Animation descriptor functions',
      items: [
        { name: 'withSpring', path: '/animations/descriptors/withSpring' },
        { name: 'withTiming', path: '/animations/descriptors/withTiming' },
        { name: 'withDecay', path: '/animations/descriptors/withDecay' },
        { name: 'withDelay', path: '/animations/descriptors/withDelay' },
        { name: 'withSequence', path: '/animations/descriptors/withSequence' },
        { name: 'withLoop', path: '/animations/descriptors/withLoop' },
      ],
    },
    {
      title: 'Drivers (Advanced)',
      description: 'Low-level animation drivers for manual control',
      items: [
        { name: 'timing', path: '/animations/drivers/timing' },
        { name: 'spring', path: '/animations/drivers/spring' },
        { name: 'decay', path: '/animations/drivers/decay' },
        { name: 'parallel', path: '/animations/drivers/parallel' },
        { name: 'sequence', path: '/animations/drivers/sequence' },
        { name: 'loop', path: '/animations/drivers/loop' },
        { name: 'delay', path: '/animations/drivers/delay' },
      ],
    },
    {
      title: 'Utilities',
      description: 'Animation utilities and helpers',
      items: [
        { name: 'Easing', path: '/animations/utilities/Easing' },
        { name: 'combine', path: '/animations/utilities/combine' },
        { name: 'to', path: '/animations/utilities/to' },
      ],
    },
    {
      title: 'Hooks',
      description: 'React hooks for animations',
      items: [
        { name: 'useValue', path: '/animations/hooks/useValue/BasicSetup' },
      ],
    },
    {
      title: 'Modules',
      description: 'Animation modules',
      items: [
        { name: 'Presence', path: '/animations/modules/Presence/BasicSetup' },
      ],
    },
    {
      title: 'Recipes',
      description: 'Pre-built animation recipes',
      items: [
        { name: 'All Recipes', path: '/animations/recipes' },
      ],
    },
    {
      title: 'State Animations',
      description: 'Hover, press, and focus animations',
      items: [
        { name: 'State Animations', path: '/animations/state-animations' },
      ],
    },
    {
      title: 'Advanced Examples',
      description: 'Complex real-world examples',
      items: [
        { name: 'Modal', path: '/examples/Modal' },
        { name: 'Toast', path: '/examples/Toast' },
        { name: 'Slider', path: '/examples/Slider' },
        { name: 'Stagger', path: '/examples/Stagger' },
        { name: 'Loop', path: '/examples/Loop' },
        { name: 'InView', path: '/examples/InView' },
        { name: 'SVG', path: '/examples/Svg' },
        { name: 'Sorting', path: '/examples/Sorting' },
        { name: 'Snap Points', path: '/examples/SnapPoints' },
        { name: 'Shared Element', path: '/examples/SharedElement' },
        { name: 'Ripple', path: '/examples/Ripple' },
        { name: 'Todo List', path: '/examples/TodoList' },
      ],
    },
  ];

  return (
    <div style={{ padding: 40, maxWidth: 1200, margin: '0 auto' }}>
      <h1 style={{ marginBottom: 10 }}>Animation Examples</h1>
      <p style={{ marginBottom: 40, color: '#666', fontSize: 16 }}>
        Comprehensive examples for all animation APIs in react-ui-animate
      </p>

      {categories.map((category) => (
        <div key={category.title} style={{ marginBottom: 50 }}>
          <h2 style={{ marginBottom: 10, fontSize: 24 }}>{category.title}</h2>
          <p style={{ marginBottom: 20, color: '#888', fontSize: 14 }}>{category.description}</p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: 12,
            }}
          >
            {category.items.map((item) => (
              <div
                key={item.name}
                style={{
                  padding: '12px 16px',
                  backgroundColor: '#f5f5f5',
                  borderRadius: 6,
                  border: '1px solid #e0e0e0',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#e8f4fd';
                  e.currentTarget.style.borderColor = '#3399ff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f5f5f5';
                  e.currentTarget.style.borderColor = '#e0e0e0';
                }}
              >
                <div style={{ fontWeight: 500, fontSize: 14 }}>{item.name}</div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div style={{ marginTop: 60, padding: 20, backgroundColor: '#f0f9ff', borderRadius: 8 }}>
        <h3 style={{ marginBottom: 10 }}>Quick Start</h3>
        <p style={{ marginBottom: 10, color: '#666' }}>
          Start with <strong>Components</strong> to learn the basics, then explore{' '}
          <strong>Descriptors</strong> for different animation types, and check out{' '}
          <strong>Recipes</strong> for pre-built animations.
        </p>
        <p style={{ color: '#666' }}>
          For advanced usage, see <strong>Advanced Examples</strong> for real-world patterns.
        </p>
      </div>
    </div>
  );
};

export default Example;

