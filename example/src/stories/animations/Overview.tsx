import React from 'react';
import { animate, withSpring } from 'react-ui-animate';
import { theme } from './shared';

interface CategoryItem {
  name: string;
  path: string;
}

interface Category {
  title: string;
  description: string;
  items: CategoryItem[];
}

const categories: Category[] = [
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
      { name: 'useTimeline', path: '/animations/hooks/useTimeline/Basic' },
    ],
  },
  {
    title: 'Modules',
    description: 'Mount / unmount lifecycle animations',
    items: [{ name: 'Unmount', path: '/animations/modules/Unmount/BasicSetup' }],
  },
  {
    title: 'Recipes',
    description: 'Pre-built animation recipes',
    items: [{ name: 'All Recipes', path: '/animations/recipes' }],
  },
  {
    title: 'State Animations',
    description: 'Hover, press, and focus animations',
    items: [{ name: 'State Animations', path: '/animations/state-animations' }],
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

const ItemPill: React.FC<{ item: CategoryItem }> = ({ item }) => (
  <animate.div
    style={{
      padding: '13px 16px',
      backgroundColor: theme.color.surface,
      borderRadius: theme.radius.sm,
      border: `1px solid ${theme.color.border}`,
      cursor: 'pointer',
      fontSize: 14,
      fontWeight: 500,
      color: theme.color.text,
      scale: 1,
    }}
    hover={{
      scale: withSpring(1.02, { stiffness: 300, damping: 20 }),
      borderColor: theme.color.accent,
    }}
    press={{ scale: withSpring(0.98, { stiffness: 400, damping: 25 }) }}
  >
    {item.name}
  </animate.div>
);

const Example: React.FC = () => {
  return (
    <div
      style={{
        padding: '56px 40px 100px',
        maxWidth: 1160,
        margin: '0 auto',
        fontFamily: theme.font.sans,
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: theme.color.accent,
          marginBottom: 12,
        }}
      >
        react-ui-animate
      </div>
      <h1
        style={{
          marginBottom: 14,
          fontSize: 42,
          fontWeight: 700,
          letterSpacing: '-0.02em',
          color: theme.color.text,
        }}
      >
        Animation examples
      </h1>
      <p style={{ marginBottom: 56, color: theme.color.textMuted, fontSize: 17, lineHeight: 1.6, maxWidth: 640 }}>
        Every API, descriptor, hook, and pattern in the library — from a single spring to
        production-grade showcases. Pick a category to start exploring.
      </p>

      {categories.map((category) => (
        <div key={category.title} style={{ marginBottom: 48 }}>
          <h2 style={{ marginBottom: 6, fontSize: 20, fontWeight: 600, color: theme.color.text }}>
            {category.title}
          </h2>
          <p style={{ marginBottom: 18, color: theme.color.textFaint, fontSize: 14 }}>
            {category.description}
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: 10,
            }}
          >
            {category.items.map((item) => (
              <ItemPill key={item.name} item={item} />
            ))}
          </div>
        </div>
      ))}

      <div
        style={{
          marginTop: 60,
          padding: 24,
          backgroundColor: theme.color.accentSoft,
          borderRadius: theme.radius.md,
          border: `1px solid ${theme.color.accent}33`,
        }}
      >
        <h3 style={{ marginBottom: 10, fontSize: 16, fontWeight: 600, color: theme.color.text }}>
          Quick start
        </h3>
        <p style={{ marginBottom: 8, color: theme.color.textMuted, fontSize: 14, lineHeight: 1.6 }}>
          Start with <strong style={{ color: theme.color.text }}>Components</strong> to learn the
          basics, then explore <strong style={{ color: theme.color.text }}>Descriptors</strong> for
          different animation types, and check out{' '}
          <strong style={{ color: theme.color.text }}>Recipes</strong> for pre-built animations.
        </p>
        <p style={{ color: theme.color.textMuted, fontSize: 14, lineHeight: 1.6 }}>
          For advanced usage, see{' '}
          <strong style={{ color: theme.color.text }}>Real-World / Advanced Examples</strong> for
          production-grade patterns.
        </p>
      </div>
    </div>
  );
};

export default Example;
