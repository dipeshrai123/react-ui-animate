import React from 'react';

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
        { name: 'withKeyframes', path: '/animations/descriptors/withKeyframes' },
        { name: 'withParallel', path: '/animations/descriptors/withParallel' },
      ],
    },
    {
      title: 'Utilities',
      description: 'Animation utilities and helpers',
      items: [
        { name: 'Easing', path: '/animations/utilities/Easing' },
        { name: 'combine', path: '/animations/utilities/combine' },
        { name: 'to', path: '/animations/utilities/to' },
        { name: 'animateTo', path: '/animations/utilities/animateTo' },
        { name: 'Reduced Motion', path: '/animations/utilities/reduced-motion' },
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
      title: 'Real-World Examples',
      description: 'Polished, production-ready examples',
      items: [
        { name: 'Card Showcase', path: '/animations/showcases/CardShowcase' },
        { name: 'Navigation Menu', path: '/animations/showcases/NavigationMenu' },
        { name: 'Dashboard', path: '/animations/showcases/Dashboard' },
        { name: 'Product Showcase', path: '/animations/showcases/ProductShowcase' },
        { name: 'Kanban Board', path: '/gestures/showcases/KanbanBoard' },
        { name: 'Theme Switch', path: '/animations/showcases/ThemeSwitch' },
        { name: 'Scroll Landing Page', path: '/gestures/showcases/ScrollLandingPage' },
        { name: 'Skeleton Reveal', path: '/animations/showcases/SkeletonReveal' },
      ],
    },
    {
      title: 'Advanced Examples',
      description: 'Complex examples demonstrating advanced features',
      items: [
        { name: 'Modal', path: '/animations/showcases/Modal' },
        { name: 'Toast', path: '/animations/showcases/Toast' },
        { name: 'Slider', path: '/gestures/showcases/Slider' },
        { name: 'Stagger', path: '/gestures/showcases/Stagger' },
        { name: 'Loop', path: '/animations/showcases/Loop' },
        { name: 'InView', path: '/animations/showcases/InView' },
        { name: 'SVG', path: '/gestures/showcases/Svg' },
        { name: 'SVG Path Animation', path: '/animations/showcases/SvgPathAnimation' },
        { name: 'Sorting', path: '/gestures/showcases/Sorting' },
        { name: 'Snap Points', path: '/gestures/showcases/SnapPoints' },
        { name: 'Shared Element', path: '/gestures/showcases/SharedElement' },
        { name: 'Ripple', path: '/animations/showcases/Ripple' },
        { name: 'Todo List', path: '/animations/showcases/TodoList' },
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

